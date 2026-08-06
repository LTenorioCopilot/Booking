using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fractales
{
  using System; // Librería base para Console y Math

  class Program // Clase principal
  {
    static void Main(string[] args) // Punto de entrada del programa
    {
      Console.OutputEncoding = System.Text.Encoding.UTF8; // Permite mostrar caracteres especiales y símbolos
      Console.CursorVisible = false;                       // Oculta el cursor para que no parpadee mientras dibuja

      // ─────────────────────────────────────────
      // CONFIGURACIÓN DEL FRACTAL
      // Definimos el "área" del plano matemático que vamos a dibujar
      // ─────────────────────────────────────────
      int anchoConsola = 80;   // Número de columnas (caracteres horizontales)
      int altoConsola = 35;   // Número de filas (caracteres verticales)

      double xMin = -2.5;  // Límite izquierdo del plano matemático
      double xMax = 1.0;  // Límite derecho del plano matemático
      double yMin = -1.1;  // Límite inferior del plano matemático
      double yMax = 1.1;  // Límite superior del plano matemático

      int maxIteraciones = 50; // Cuántas veces intentamos saber si un punto "escapa" o no

      // Paleta de caracteres: del más denso al más vacío
      // Se usan para simular "profundidad" o "intensidad" del fractal
      char[] paleta = { '#', '@', '%', '=', '+', '*', ':', '-', '.', ' ' };

      // ─────────────────────────────────────────
      // TÍTULO
      // ─────────────────────────────────────────
      Console.ForegroundColor = ConsoleColor.Cyan; // Cambia el color del texto a cian
      Console.WriteLine("╔══════════════════════════════════════╗");
      Console.WriteLine("║      Conjunto de Mandelbrot          ║");
      Console.WriteLine("║   El fractal más famoso del mundo    ║");
      Console.WriteLine("╚══════════════════════════════════════╝");
      Console.WriteLine();

      // ─────────────────────────────────────────
      // BUCLE PRINCIPAL: recorre cada píxel de la consola
      // Cada "píxel" es un carácter en pantalla
      // ─────────────────────────────────────────
      for (int fila = 0; fila < altoConsola; fila++)       // Recorre cada fila de arriba a abajo
      {
        for (int columna = 0; columna < anchoConsola; columna++) // Recorre cada columna de izquierda a derecha
        {
          // Convierte la posición del carácter (fila, columna)
          // a coordenadas reales del plano matemático (x, y)
          double x0 = xMin + (columna / (double)anchoConsola) * (xMax - xMin); // Coordenada real (eje horizontal)
          double y0 = yMin + (fila / (double)altoConsola) * (yMax - yMin); // Coordenada imaginaria (eje vertical)

          // ── ALGORITMO DE MANDELBROT ──────────────────
          // Partimos de z = 0 y repetimos: z = z² + c
          // donde c es el punto que estamos evaluando (x0, y0)
          // Si z se aleja demasiado (> 2), el punto "escapa" → no pertenece al conjunto
          // Si nunca escapa en maxIteraciones → pertenece al conjunto (se pinta denso)
          double x = 0.0; // Parte real de z (empieza en 0)
          double y = 0.0; // Parte imaginaria de z (empieza en 0)
          int iteracion = 0; // Contador de iteraciones

          while (x * x + y * y <= 4.0 && iteracion < maxIteraciones) // Mientras z no escape y no superemos el límite
          {
            double xTemp = x * x - y * y + x0; // Calcula la nueva parte real:      x² - y² + x0
            y = 2 * x * y + y0;                // Calcula la nueva parte imaginaria: 2xy + y0
            x = xTemp;                     // Actualiza x con el valor temporal calculado
            iteracion++;                   // Cuenta una iteración más
          }

          // ── COLOREAR EL PUNTO ────────────────────────
          // Según cuántas iteraciones tardó en escapar, elegimos color y carácter
          int indice = (iteracion * (paleta.Length - 1)) / maxIteraciones; // Mapea iteraciones al índice de la paleta

          // Asigna un color según la "profundidad" del punto
          //Console.ForegroundColor =  switch (indice)
          //      {
          //          0 => ConsoleColor.White,       // Centro del conjunto (nunca escapa)
          //          1 => ConsoleColor.Cyan,         // Muy cerca del borde
          //          2 => ConsoleColor.Blue,         // Borde interior
          //          3 => ConsoleColor.Green,        // Zona media
          //          4 => ConsoleColor.Yellow,       // Zona exterior media
          //          5 => ConsoleColor.Red,          // Zona exterior
          //          6 => ConsoleColor.Magenta,      // Zona muy exterior
          //          _ => ConsoleColor.DarkGray      // Espacio vacío (escapa rápido)
          //      };

          switch (indice)
          {
            case 0:
              Console.ForegroundColor = ConsoleColor.White;
              break;
            case 1:
              Console.ForegroundColor = ConsoleColor.Cyan;
              break;
            case 2:
              Console.ForegroundColor = ConsoleColor.Blue;
              break;
            case 3:
              Console.ForegroundColor = ConsoleColor.Green;
              break;

            case 4:
              Console.ForegroundColor = ConsoleColor.Yellow;
              break;
            case 5:
              Console.ForegroundColor = ConsoleColor.Red;
              break;
            case 6:
              Console.ForegroundColor = ConsoleColor.Magenta;
              break;
            case 7:
              Console.ForegroundColor = ConsoleColor.DarkGray;
              break;
            default:
              Console.ForegroundColor = ConsoleColor.White;
              break;
          }

          Console.Write(paleta[indice]); // Dibuja el carácter correspondiente en pantalla
        }

        Console.WriteLine(); // Salto de línea al terminar cada fila
      }

      // ─────────────────────────────────────────
      // EXPLICACIÓN AL PIE
      // ─────────────────────────────────────────
      Console.ForegroundColor = ConsoleColor.White;
      Console.WriteLine();
      Console.WriteLine("  Fórmula: z = z² + c  →  repetida hasta que |z| > 2");
      Console.WriteLine("  Los colores indican cuántas iteraciones tardó en 'escapar'");
      Console.WriteLine("  El centro negro NUNCA escapa → pertenece al conjunto");
      Console.WriteLine();
      Console.WriteLine("  Presiona cualquier tecla para salir...");

      Console.ResetColor();  // Restaura el color original de la consola
      Console.CursorVisible = true; // Vuelve a mostrar el cursor
      Console.ReadKey();            // Espera que el usuario presione una tecla
    }
  }
}
