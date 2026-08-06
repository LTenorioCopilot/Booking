using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SumaNumeros
{
  using System; // Importa la librería base de C# que nos permite usar Console, Convert, etc.

  class Program // Define una clase llamada "Program" (todo el código en C# vive dentro de clases)
  { // Llave de apertura de la clase
    static void Main(string[] args) // Método principal: es el punto de entrada, aquí empieza el programa
    { // Llave de apertura del método Main

      Console.WriteLine("=== Suma de Números ==="); // Imprime un título en pantalla con salto de línea al final

      Console.Write("Ingresa el primer número: "); // Muestra un mensaje SIN salto de línea (el cursor queda al lado)
      double num1 = Convert.ToDouble(Console.ReadLine()); // Lee lo que escribe el usuario y lo convierte a número decimal, guardándolo en "num1"

      Console.Write("Ingresa el segundo número: "); // Muestra el mensaje para pedir el segundo número
      double num2 = Convert.ToDouble(Console.ReadLine()); // Lee el segundo número ingresado y lo guarda en "num2"

      double resultado = num1 + num2; // Suma num1 y num2, y guarda el total en una variable llamada "resultado"

      Console.WriteLine($"\nResultado: {num1} + {num2} = {resultado}"); // Muestra el resultado en pantalla; el \n agrega una línea en blanco antes

      Console.Read();
    } // Llave de cierre del método Main
  } // Llave de cierre de la clase Program
}
