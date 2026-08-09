# Modelo de datos: Disponibilidad de habitaciones

## Enfoque general

Para un hotel de 100 habitaciones y 3 estrellas, la práctica más usada por los PMS (Property Management Systems) reales es manejar la disponibilidad **a nivel de tipo de habitación**, no de habitación física individual, hasta el momento del check-in. La habitación específica se asigna después (en check-in o cerca de la llegada).

Esto simplifica muchísimo el modelo porque:
- Las reservaciones se hacen contra un "tipo" (ej. "Doble Estándar"), no contra el cuarto 204.
- La disponibilidad se calcula restando reservas activas del inventario total de ese tipo, por noche.
- La asignación física de cuarto es un paso operativo aparte (housekeeping-friendly, permite mover huéspedes sin tocar la reservación).

En vez de mantener una tabla de "inventario disponible" que se va actualizando (lo cual genera problemas de sincronización), se recomienda un modelo basado en un **ledger de noches-reservadas** (`reservation_stay_nights`), y la disponibilidad se **calcula en consulta**, no se guarda como contador.

---

## Entidades principales

### 1. `room_types` (Tipos de habitación)
Catálogo de tipos que vende el hotel.

| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| code | varchar | ej. `DBL-STD`, `SGL-STD`, `SUITE` |
| name | varchar | "Doble Estándar" |
| max_occupancy | int | huéspedes máximos |
| total_units | int | cuántos cuartos de este tipo existen (ej. 40) |
| base_rate | decimal | tarifa de referencia (opcional, ver rate_plans) |
| active | boolean | |

> La suma de `total_units` de todos los tipos = 100.

### 2. `rooms` (Habitaciones físicas)
Cada cuarto real del hotel.

| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| room_number | varchar | "204" |
| room_type_id | FK → room_types | |
| floor | int | |
| status | enum | `clean`, `dirty`, `inspected`, `out_of_service` |
| active | boolean | si está dado de baja permanentemente |

### 3. `room_blocks` (Bloqueos de mantenimiento)
Para cuartos fuera de servicio en un rango de fechas (no reservables).

| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| room_id | FK → rooms | |
| start_date | date | |
| end_date | date | |
| reason | varchar | "mantenimiento", "remodelación" |
| created_by | FK → users | |

### 4. `reservations` (Reservación — cabecera)

| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| guest_id | FK → guests | |
| status | enum | `confirmed`, `checked_in`, `checked_out`, `cancelled`, `no_show` |
| channel | enum | `front_desk`, `phone`, `web`, `ota_booking`, `ota_expedia` |
| created_at | timestamp | |
| cancellation_policy_id | FK | |

### 5. `reservation_room_stays` (Detalle: una fila por tipo de cuarto reservado dentro de la reservación)
Una reservación puede incluir varios cuartos (ej. reservación grupal).

| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| reservation_id | FK → reservations | |
| room_type_id | FK → room_types | |
| check_in_date | date | |
| check_out_date | date | |
| occupancy_adults | int | |
| occupancy_children | int | |
| assigned_room_id | FK → rooms, nullable | se llena en check-in |
| rate_plan_id | FK → rate_plans | |
| status | enum | `active`, `cancelled` |

### 6. `reservation_stay_nights` (Ledger — una fila por noche por cuarto reservado)
Esta es la tabla clave para calcular disponibilidad de forma rápida y confiable.

| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| reservation_room_stay_id | FK | |
| room_type_id | FK → room_types | desnormalizado, para acelerar consultas |
| stay_date | date | la noche específica (2026-08-10) |
| rate_amount | decimal | tarifa aplicada esa noche |
| status | enum | `active`, `cancelled` |

> Se genera automáticamente al crear la reservación (una fila por cada noche entre check-in y check-out). Si se cancela, se marca `cancelled` en vez de borrarse (para auditoría e histórico de ingresos).

---

## Cálculo de disponibilidad (la consulta central)

Disponibilidad de un tipo de habitación en una fecha:

```sql
disponibilidad(room_type_id, fecha) =
    total_units (de room_types)
    - habitaciones bloqueadas ese día (room_blocks activos de ese tipo)
    - COUNT(reservation_stay_nights WHERE room_type_id = X
                                       AND stay_date = fecha
                                       AND status = 'active')
```

Ejemplo en SQL:

```sql
SELECT
    rt.id AS room_type_id,
    rt.name,
    rt.total_units,
    COALESCE(blocked.cnt, 0) AS blocked_units,
    COALESCE(booked.cnt, 0) AS booked_units,
    rt.total_units - COALESCE(blocked.cnt,0) - COALESCE(booked.cnt,0) AS available
FROM room_types rt
LEFT JOIN (
    SELECT r.room_type_id, COUNT(*) AS cnt
    FROM room_blocks rb
    JOIN rooms r ON r.id = rb.room_id
    WHERE :fecha BETWEEN rb.start_date AND rb.end_date
    GROUP BY r.room_type_id
) blocked ON blocked.room_type_id = rt.id
LEFT JOIN (
    SELECT room_type_id, COUNT(*) AS cnt
    FROM reservation_stay_nights
    WHERE stay_date = :fecha AND status = 'active'
    GROUP BY room_type_id
) booked ON booked.room_type_id = rt.id
WHERE rt.active = true;
```

Para un **rango de fechas** (ej. huésped busca del 10 al 13 de agosto), la disponibilidad del rango es el **mínimo** de la disponibilidad diaria entre esas noches — porque si un solo día del rango está lleno, no se puede reservar el rango completo.

---

## Por qué este modelo y no un contador de inventario

| Enfoque | Ventaja | Riesgo |
|---|---|---|
| **Contador de inventario** (tabla `availability` con un número que se resta/suma) | Consultas más simples | Riesgo alto de desincronización (si una cancelación falla en actualizar el contador, la disponibilidad queda mal para siempre) |
| **Ledger de noches-reservadas** (recomendado) | Fuente de verdad única, auditable, permite recalcular disponibilidad desde cero en cualquier momento, facilita reportes históricos de ocupación | Consultas ligeramente más pesadas (se resuelve con índices en `stay_date` + `room_type_id`) |

Para 100 cuartos, el volumen de datos es pequeño (máximo ~36,500 filas de `reservation_stay_nights` por año con ocupación al 100%), así que el rendimiento no es un problema real incluso con el enfoque de ledger.

---

## Índices recomendados

- `reservation_stay_nights (room_type_id, stay_date, status)` — para el cálculo de disponibilidad
- `room_blocks (room_id, start_date, end_date)` — para detectar bloqueos activos
- `reservation_room_stays (reservation_id)` — para armar el detalle de una reservación
- `rooms (room_type_id, status)` — para housekeeping / asignación en check-in

---

## Extensión a futuro (no necesaria para el MVP)

- Tabla `rate_calendar` si se quiere precio dinámico por día independiente del `rate_plan` fijo.
- Tabla `overbooking_rules` si se decide permitir sobreventa controlada por tipo de habitación.
- Tabla `channel_inventory_sync_log` cuando se conecte a un Channel Manager (OTAs), para registrar cada push/pull de disponibilidad.
