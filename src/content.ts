import type { Lesson } from "./types";

export const lessons: Lesson[] = [
  {
    slug: "la-llamada",
    index: "01",
    kicker: "La pila",
    title: "Antes de la recursión",
    summary: "Una llamada apila un marco. La de arriba es la única que trabaja.",
    minutes: 4,
    sections: [
      {
        heading: "La torre de trabajos a medias",
        text: [
          "Cuando una función llama a otra, el trabajo actual se queda esperando y el nuevo se pone encima. Ese piso se llama marco. La pila es la torre de marcos.",
          "La cima es la única que se ejecuta. Cuando termina, su marco se tira y la función de abajo sigue justo donde se quedó. Por eso la última en entrar es la primera en salir.",
        ],
      },
      {
        heading: "Qué añade la recursión",
        text: [
          "La recursión es esa misma pila, con una diferencia: la función llama a una copia de sí misma. Si ninguna copia se detiene, la torre crece hasta que el lenguaje la corta.",
          "Los ejemplos están en Python. La pila se comporta igual en casi cualquier lenguaje.",
        ],
      },
    ],
    question: {
      prompt: "Cuando una función llama a otra, ¿cuál termina primero?",
      options: [
        "La que llamó, porque empezó antes.",
        "La que está en la cima: hasta que no termina, las de abajo esperan.",
        "Las dos a la vez.",
        "La del fondo, porque es la principal.",
      ],
      answer: 1,
      hint: "Mira quién está arriba cuando la pila está llena.",
      why: "La cima es la única que trabaja. Las de abajo guardan el sitio al que hay que volver. Por eso se cierra primero la llamada más reciente.",
    },
  },
  {
    slug: "factorial",
    index: "02",
    kicker: "El caso base",
    title: "Factorial",
    summary: "Un caso que responde solo, y otro que se acerca a ese caso.",
    minutes: 6,
    sections: [
      {
        heading: "Dos piezas, y solo dos",
        text: [
          "El factorial de n es n multiplicado por el factorial del número anterior. Esa frase es el caso recursivo: reduce el problema, pero no lo resuelve del todo.",
          "El caso base es el que ya no llama a nadie. Aquí es el 0, y su factorial es 1. Sin ese corte, factorial(1) pediría factorial(0), factorial(-1), factorial(-2)… y la pila no pararía.",
        ],
      },
      {
        heading: "La bajada y la subida",
        text: [
          "Primero la pila crece: cada marco deja anotado «n × …» y espera. Al tocar el caso base, el 1 empieza a subir. Cada marco despierta, multiplica y devuelve su resultado al de abajo.",
        ],
      },
    ],
    question: {
      prompt:
        "factorial(4) espera a factorial(3). Si esa llamada devuelve 6, ¿qué hace el marco de factorial(4)?",
      options: [
        "Devuelve 6, porque el resultado de abajo ya es el definitivo.",
        "Vuelve a empezar desde factorial(4).",
        "Multiplica 4 × 6 y devuelve 24.",
        "Suma 4 + 6 y devuelve 10.",
      ],
      answer: 2,
      hint: "El marco de arriba dejó escrita una multiplicación incompleta.",
      why: "El caso recursivo no es la llamada: es lo que haces con lo que la llamada devuelve. Aquí eso es multiplicar por n. 4 × 6 = 24.",
    },
  },
  {
    slug: "fibonacci",
    index: "03",
    kicker: "El árbol",
    title: "Fibonacci",
    summary: "Dos llamadas por marco. Los mismos números, una y otra vez.",
    minutes: 7,
    sections: [
      {
        heading: "Una llamada que se abre en dos",
        text: [
          "Fibonacci de n es la suma de los dos anteriores. En código, eso son dos llamadas. Cada una vuelve a abrirse en dos. El dibujo ya no es una torre: es un árbol.",
          "Sin memoria, fib(2) se calcula entero varias veces. El resultado es el mismo, pero la pila no lo sabe.",
        ],
      },
      {
        heading: "Acordarse",
        text: [
          "Memorizar es anotar el resultado la primera vez. La siguiente llamada con el mismo n no abre ramas: consulta la nota y devuelve. La recursión sigue ahí. Lo que desaparece es el trabajo repetido.",
        ],
      },
    ],
    question: {
      prompt: "¿Qué cambia cuando fib recuerda los resultados?",
      options: [
        "El caso base desaparece.",
        "Cada valor de n se calcula una sola vez y las repeticiones no abren ramas.",
        "La pila pasa a ser una cola.",
        "fib deja de llamarse a sí misma.",
      ],
      answer: 1,
      hint: "Compara el árbol con memoria y sin ella, con el mismo n.",
      why: "La memoria no quita la recursión. Evita repetir un subproblema que ya tiene respuesta. El árbol se aplana: una rama nueva por valor, y el resto son consultas.",
    },
  },
  {
    slug: "listas",
    index: "04",
    kicker: "La lista",
    title: "Cabeza y resto",
    summary: "Una lista es un primer elemento y otra lista más corta.",
    minutes: 5,
    sections: [
      {
        heading: "Partir hasta que no quede nada",
        text: [
          "Sumar [4, 1, 7] es 4 más la suma de [1, 7]. Sumar [1, 7] es 1 más la suma de [7]. Sumar [7] es 7 más la suma de []. Cada llamada recibe una lista más corta.",
          "La lista vacía no tiene cabeza. No se puede partir. Ese es el caso base, y por convenio suma 0. Desde ese 0 se reconstruye el total, sumando las cabezas de vuelta.",
        ],
      },
    ],
    question: {
      prompt: "¿Cuál es el caso base de sumar una lista por la cabeza y el resto?",
      options: [
        "Una lista de un elemento, que suma 1.",
        "La lista vacía, que suma 0.",
        "El número más grande de la lista.",
        "Llegar a diez llamadas.",
      ],
      answer: 1,
      hint: "Busca el único tamaño que la función no puede partir.",
      why: "La lista vacía no tiene cabeza ni resto. Es el caso que responde directo. A partir de ese 0, cada marco suma solo su cabeza.",
    },
  },
  {
    slug: "busqueda",
    index: "05",
    kicker: "Divide y vencerás",
    title: "Búsqueda binaria",
    summary: "El elemento del medio tira la mitad de los datos.",
    minutes: 6,
    sections: [
      {
        heading: "Quedarse con un trozo",
        text: [
          "Si la lista está ordenada, el valor del medio responde a una pregunta: ¿el objetivo es ese, está a la izquierda o está a la derecha?",
          "Una sola llamada continúa, con el tramo que aún puede contener el objetivo. La otra mitad no vuelve a mirarse. El caso base llega cuando el tramo se vacía, o cuando el medio es el número buscado.",
        ],
      },
    ],
    question: {
      prompt: "Buscas 12 y el medio del tramo vale 8. ¿Qué mitad se descarta?",
      options: [
        "La derecha, porque 12 es mayor y los mayores están a la izquierda.",
        "La izquierda, incluido el medio: si 12 está, está a la derecha de 8.",
        "Ninguna. Hay que mirar los dos lados.",
        "Se conservan solo los dos extremos.",
      ],
      answer: 1,
      hint: "La lista está ordenada de menor a mayor.",
      why: "Si el medio es menor que el objetivo, todo lo que hay a su izquierda también es menor. Esa mitad ya no puede contener el 12.",
    },
  },
  {
    slug: "hanoi",
    index: "06",
    kicker: "El subproblema",
    title: "Torres de Hanói",
    summary: "No muevas disco a disco en tu cabeza. Pide una torre más baja.",
    minutes: 6,
    sections: [
      {
        heading: "La regla, dicha una vez",
        text: [
          "Para pasar n discos de un poste a otro: aparta los n−1 de encima al poste auxiliar, mueve el disco que quedó libre, y coloca encima la torre de n−1. Cada una de esas partes es el mismo problema, con un disco menos.",
          "El caso base es una torre de un disco: se mueve y no llama a nadie. El número mínimo de movimientos es 2ⁿ − 1. Con 3 discos son 7. Con 4, 15.",
        ],
      },
    ],
    question: {
      prompt: "¿Cuántos movimientos hacen falta, como mínimo, para pasar 4 discos?",
      options: ["4, uno por disco.", "8, el doble.", "15, que es 2⁴ − 1.", "24."],
      answer: 2,
      hint: "La fórmula está en el texto de la lección: 2ⁿ − 1.",
      why: "Mover n discos exige dos torres de n−1 y un movimiento del disco grande. Eso suma 2ⁿ − 1. Con 4 discos, 15.",
    },
  },
  {
    slug: "fractal",
    index: "07",
    kicker: "El dibujo",
    title: "Una rama, dos ramas",
    summary: "El mismo árbol, más corto y girado, hasta que la profundidad se acaba.",
    minutes: 4,
    sections: [
      {
        heading: "El caso base es no dibujar",
        text: [
          "Una rama se traza y después la función se llama dos veces: una inclinada a la izquierda y otra a la derecha, más cortas. Cada llamada es el mismo dibujo.",
          "Cuando la profundidad llega a 0, la función vuelve sin trazar nada. Ese corte es el que permite que el árbol termine. Si no estuviera, cada rama pediría dos ramas más, para siempre.",
        ],
      },
    ],
    question: {
      prompt: "Si la profundidad llega a 0, ¿qué hace la función que dibuja la rama?",
      options: [
        "Dibuja una hoja y llama otra vez.",
        "No dibuja nada. Ese es el caso base.",
        "Borra el tronco.",
        "Llama a una sola rama, más larga.",
      ],
      answer: 1,
      hint: "Fíjate en el if del código, no en las dos llamadas de abajo.",
      why: "El caso base es la llamada que no genera llamadas nuevas. Aquí no dibuja. Sin ese corte el árbol no terminaría.",
    },
  },
  {
    slug: "laberinto",
    index: "08",
    kicker: "Backtracking",
    title: "El laberinto",
    summary: "Hay dos rutas hasta E. Para ver la segunda hay que deshacer la primera.",
    minutes: 7,
    sections: [
      {
        heading: "Anotar, y aun así deshacer",
        text: [
          "Si al llegar a E la función devolviera sí y parara, solo verías un camino. Para encontrar los dos, un camino que ya vale también se deshace: se anota y se borran las marcas.",
          "El primero sale por el este, recorre la fila de arriba y baja a E. El segundo sale por el sur, baja por la izquierda y cruza la fila de abajo. S y E están en los dos.",
        ],
      },
      {
        heading: "El orden solo decide cuál aparece antes",
        text: [
          "Se prueba este, sur, oeste y norte. Por eso el ámbar aparece antes que el verde. Otro orden los descubriría al revés. La idea no cambia: marcar, recurrir, anotar si es la salida, borrar la marca.",
        ],
      },
    ],
    question: {
      prompt: "¿Por qué se borra también un camino que ya llegó a E?",
      options: [
        "Porque ese camino en realidad no valía.",
        "Para poder buscar otro camino distinto.",
        "Porque la salida solo se puede pisar una vez.",
        "Porque la pila se había llenado.",
      ],
      answer: 1,
      hint: "Mira qué pasa justo después de anotar el primer camino.",
      why: "El camino queda guardado en otro color. Si no se deshiciera, las casillas seguirían marcadas y la búsqueda no podría salir por el otro lado.",
    },
  },
  {
    slug: "arbol",
    index: "09",
    kicker: "La estructura",
    title: "Sumar un árbol",
    summary: "El árbol no lo crea la llamada. Ya está, y la función lo recorre.",
    minutes: 6,
    sections: [
      {
        heading: "No es el árbol de Fibonacci",
        text: [
          "En Fibonacci el árbol era el dibujo de las llamadas. Aquí el árbol es un dato: nodos con un número y, como mucho, dos hijos. La función no lo construye. Lo visita.",
          "Sumar un nodo es su valor, más la suma del hijo izquierdo, más la suma del derecho. Si no hay hijo, esa llamada devuelve 0. Ese 0 es el caso base.",
        ],
      },
      {
        heading: "Izquierda, derecha, y solo entonces el resultado",
        text: [
          "El marco se queda esperando dos veces. Primero vuelve el lado izquierdo. Después el derecho. Con los dos números en la mano, suma el suyo y devuelve. La raíz es la última en responder.",
        ],
      },
    ],
    question: {
      prompt: "¿Qué devuelve la llamada cuando ese hijo no existe?",
      options: [
        "El valor del padre.",
        "0. Es el caso base.",
        "None, y la suma se corta.",
        "Vuelve a llamar al mismo nodo.",
      ],
      answer: 1,
      hint: "Es la llamada sumar(∅), la que no tiene nodo.",
      why: "Sin ese 0, una hoja no sabría qué sumar a su valor. La hoja devuelve su número más 0 más 0.",
    },
  },
];

export function lessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}
