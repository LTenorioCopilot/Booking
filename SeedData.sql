/****** Seed data: 50 Rooms, 50 Customers, 15 Booking ******/
USE [ClientesDb]
GO
SET NOCOUNT ON
GO

------------------------------------------------------------
-- Rooms (50) — Id no es IDENTITY, se genera explícito
-- 5 pisos x 10 habitaciones: 101-110, 201-210, ..., 501-510
------------------------------------------------------------
;WITH Numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM Numbers WHERE n < 50
)
INSERT INTO [dbo].[Rooms] ([Id], [Name], [Type], [Capacity])
SELECT
    CAST(RoomId AS nvarchar(20)),
    N'Habitación ' + CAST(RoomId AS nvarchar(20)),
    RoomType,
    Capacity
FROM (
    SELECT
        n,
        (((n - 1) / 10) + 1) * 100 + (((n - 1) % 10) + 1) AS RoomId,
        CASE n % 5
            WHEN 0 THEN N'Sencilla'
            WHEN 1 THEN N'Doble'
            WHEN 2 THEN N'Triple'
            WHEN 3 THEN N'Suite Delux'
            ELSE N'Suite Presidencial'
        END AS RoomType,
        CASE n % 5
            WHEN 0 THEN 1
            WHEN 1 THEN 2
            WHEN 2 THEN 3
            WHEN 3 THEN 4
            ELSE 6
        END AS Capacity
    FROM Numbers
) AS Rooms
OPTION (MAXRECURSION 100)
GO

------------------------------------------------------------
-- Customers (50) — Id es IDENTITY
------------------------------------------------------------
;WITH Numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM Numbers WHERE n < 50
),
FirstNames AS (
    SELECT * FROM (VALUES
        (0,N'Carlos'),(1,N'María'),(2,N'Juan'),(3,N'Ana'),(4,N'Luis'),
        (5,N'Sofía'),(6,N'Pedro'),(7,N'Laura'),(8,N'Miguel'),(9,N'Elena'),
        (10,N'Jorge'),(11,N'Patricia'),(12,N'Diego'),(13,N'Valentina'),(14,N'Andrés'),
        (15,N'Camila'),(16,N'Ricardo'),(17,N'Daniela'),(18,N'Fernando'),(19,N'Gabriela')
    ) AS t(idx, name)
),
LastNames AS (
    SELECT * FROM (VALUES
        (0,N'García'),(1,N'Rodríguez'),(2,N'Martínez'),(3,N'López'),(4,N'González'),
        (5,N'Pérez'),(6,N'Sánchez'),(7,N'Ramírez'),(8,N'Torres'),(9,N'Flores'),
        (10,N'Rivera'),(11,N'Gómez'),(12,N'Díaz'),(13,N'Reyes'),(14,N'Cruz'),
        (15,N'Morales'),(16,N'Ortiz'),(17,N'Gutiérrez'),(18,N'Chávez'),(19,N'Ramos')
    ) AS t(idx, name)
),
Cities AS (
    SELECT * FROM (VALUES
        (0,N'Lima'),(1,N'Arequipa'),(2,N'Cusco'),(3,N'Trujillo'),(4,N'Piura')
    ) AS t(idx, name)
)
INSERT INTO [dbo].[Customers]
    ([Nombres], [Apellidos], [DocumentType], [NumeroDocumento], [FechaNacimiento], [Email], [Telefono], [Direccion])
SELECT
    fn.name,
    ln.name,
    CASE n % 3 WHEN 0 THEN N'DNI' WHEN 1 THEN N'Pasaporte' ELSE N'CE' END,
    RIGHT('00000000' + CAST(40000000 + n AS varchar(10)), 8),
    CAST(DATEADD(DAY, -((n * 47) % 365), DATEADD(YEAR, -(20 + (n % 45)), '2026-08-09')) AS date),
    N'cliente' + RIGHT('000' + CAST(n AS varchar(3)), 3) + N'@example.com',
    N'+51 9' + RIGHT('0000000' + CAST(n AS varchar(7)), 7),
    N'Av. ' + ln.name + N' ' + CAST(n * 3 AS nvarchar(10)) + N', ' + city.name
FROM Numbers num
JOIN FirstNames fn ON fn.idx = (num.n - 1) % 20
JOIN LastNames ln ON ln.idx = (num.n * 7 - 1) % 20
JOIN Cities city ON city.idx = (num.n - 1) % 5
OPTION (MAXRECURSION 100)
GO

------------------------------------------------------------
-- Booking (15) — Id es IDENTITY, RoomId debe existir en Rooms (FK)
------------------------------------------------------------
;WITH Numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM Numbers WHERE n < 15
),
NumberedRooms AS (
    SELECT [Id], ROW_NUMBER() OVER (ORDER BY [Id]) AS rn
    FROM [dbo].[Rooms]
),
NumberedCustomers AS (
    SELECT [Nombres], [Apellidos], ROW_NUMBER() OVER (ORDER BY [Id]) AS rn
    FROM [dbo].[Customers]
)
INSERT INTO [dbo].[Booking]
    ([RoomId], [GuestName], [Status], [StartHour], [EndHour], [CheckInDate], [CheckOutDate])
SELECT
    r.[Id],
    c.[Nombres] + N' ' + c.[Apellidos],
    CASE num.n % 3 WHEN 0 THEN N'Pending' WHEN 1 THEN N'Confirmed' ELSE N'CheckedIn' END,
    9.0 + (num.n % 4),
    18.0 - (num.n % 3),
    CAST(DATEADD(DAY, num.n * 2, '2026-08-01') AS date),
    CAST(DATEADD(DAY, num.n * 2 + 1 + (num.n % 4), '2026-08-01') AS date)
FROM Numbers num
JOIN NumberedRooms r ON r.rn = num.n
JOIN NumberedCustomers c ON c.rn = num.n
OPTION (MAXRECURSION 100)
GO

------------------------------------------------------------
SELECT (SELECT COUNT(*) FROM [dbo].[Rooms]) AS Rooms,
       (SELECT COUNT(*) FROM [dbo].[Customers]) AS Customers,
       (SELECT COUNT(*) FROM [dbo].[Booking]) AS Booking
GO
