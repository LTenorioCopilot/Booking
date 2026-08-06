using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DibujarGato
{
  using System; // Importa la librería base para usar Console

  class Program // Define la clase principal del programa
  {
    static void Main(string[] args) // Punto de entrada del programa
    {
      Console.WriteLine(""); // Línea en blanco para separar

      // ====== OREJAS ======
      Console.WriteLine(@"  /\_____/\");         // Dibuja las dos orejas puntiagudas del gato

      // ====== CABEZA ======
      Console.WriteLine(@" /  o   o  \");         // Ojos del gato
      Console.WriteLine(@"( ==  ^  == )");        // Nariz (el ^ representa la nariz triangular)
      Console.WriteLine(@" )         (");         // Mejillas del gato
      Console.WriteLine(@"(           ))");       // Parte baja de la cabeza y bigotes

      // ====== BIGOTES ======
      Console.WriteLine(@"~~ ~~  ~~ ~~");         // Bigotes extendidos a los lados

      // ====== CUERPO ======
      Console.WriteLine(@"  (  ___  )");          // Hombros / inicio del cuerpo
      Console.WriteLine(@"  | |   | |");          // Cuerpo superior
      Console.WriteLine(@"  | |   | |");          // Cuerpo medio
      Console.WriteLine(@" _| |___| |_");         // Parte baja del cuerpo y patas delanteras

      // ====== PATAS Y COLA ======
      Console.WriteLine(@"|___________|");        // Base / piso donde apoya el gato
      Console.WriteLine(@"  |_|   |_|");          // Patas traseras del gato

      Console.WriteLine(""); // Línea en blanco al final

      Console.WriteLine("  ~~ Meow ~~"); // Mensaje final con sonido del gato

      Console.ReadKey(); // Espera a que el usuario presione una tecla antes de cerrar
    }
  }
}
