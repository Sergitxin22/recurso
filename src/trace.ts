import type { Frame, FrameState, Step } from "./types";

function cloneFrames(frames: Frame[]): Frame[] {
  return frames.map((frame) => ({ ...frame }));
}

export const factorialCode = `def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)`;

export function factorialSteps(n: number): Step[] {
  const steps: Step[] = [];
  const frames: Frame[] = [];

  const snap = (narration: string, line: number) => {
    steps.push({ narration, line, stack: cloneFrames(frames) });
  };

  snap("La pila está vacía. Todavía no se ha llamado a nadie.", 1);

  const rec = (k: number): number => {
    frames.push({
      title: `factorial(${k})`,
      detail: "comprueba si n es 0",
      state: "active",
    });
    snap(
      k === 0
        ? "Entra factorial(0). Este marco puede responder solo."
        : `Entra factorial(${k}). n no es 0, así que este marco todavía no puede cerrarse.`,
      2,
    );

    if (k === 0) {
      frames[frames.length - 1] = {
        title: "factorial(0)",
        detail: "caso base",
        state: "base",
        result: "1",
      };
      snap("Caso base: factorial(0) devuelve 1 y no llama a nadie más.", 3);
      frames.pop();
      return 1;
    }

    frames[frames.length - 1] = {
      title: `factorial(${k})`,
      detail: `espera ${k} × factorial(${k - 1})`,
      state: "waiting",
    };
    snap(`factorial(${k}) deja anotado «${k} × …» y llama a factorial(${k - 1}).`, 4);

    const sub = rec(k - 1);
    const result = k * sub;
    frames[frames.length - 1] = {
      title: `factorial(${k})`,
      detail: `${k} × ${sub}`,
      state: "done",
      result: String(result),
    };
    snap(
      `factorial(${k - 1}) devolvió ${sub}. Este marco despierta: ${k} × ${sub} = ${result}.`,
      4,
    );
    frames.pop();
    return result;
  };

  const result = rec(n);
  snap(`La pila queda vacía. factorial(${n}) = ${result}.`, n === 0 ? 3 : 4);
  return steps;
}

export const fibNaiveCode = `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)`;

export const fibMemoCode = `def fib(n, memoria):
    if n in memoria:
        return memoria[n]
    if n <= 1:
        memoria[n] = n
        return n
    memoria[n] = fib(n - 1, memoria) + fib(n - 2, memoria)
    return memoria[n]`;

export type FibNode = {
  id: number;
  n: number;
  parent: number | null;
  children: number[];
  depth: number;
  state: "active" | "waiting" | "done" | "hit";
  result?: number;
};

export type FibStep = Step & {
  nodes: FibNode[];
  calls: number;
};

function cloneNodes(nodes: FibNode[]): FibNode[] {
  return nodes.map((node) => ({ ...node, children: [...node.children] }));
}

export function fibonacciSteps(n: number, memoize: boolean): FibStep[] {
  const steps: FibStep[] = [];
  const nodes: FibNode[] = [];
  const stack: Frame[] = [];
  const memo = new Map<number, number>();
  let calls = 0;

  const snap = (narration: string, line: number) => {
    steps.push({
      narration,
      line,
      calls,
      stack: cloneFrames(stack),
      nodes: cloneNodes(nodes),
    });
  };

  const rec = (k: number, parent: number | null, depth: number): number => {
    const repeated = nodes.some(
      (node) => node.n === k && (node.state === "done" || node.state === "hit"),
    );
    const id = nodes.length;
    calls += 1;
    nodes.push({ id, n: k, parent, children: [], depth, state: "active" });
    if (parent !== null) nodes[parent].children.push(id);

    stack.push({ title: `fib(${k})`, detail: "entra", state: "active" });

    if (memoize && memo.has(k)) {
      const known = memo.get(k)!;
      nodes[id].state = "hit";
      nodes[id].result = known;
      stack[stack.length - 1] = {
        title: `fib(${k})`,
        detail: "ya estaba en memoria",
        state: "done",
        result: String(known),
      };
      snap(`fib(${k}) ya valía ${known}. Se consulta la nota y no se abre ninguna rama.`, 3);
      stack.pop();
      return known;
    }

    snap(
      repeated
        ? `Otra vez fib(${k}). Sin una nota guardada, el trabajo empieza desde cero.`
        : `Entra fib(${k}).`,
      memoize ? 4 : 2,
    );

    if (k <= 1) {
      nodes[id].state = "done";
      nodes[id].result = k;
      if (memoize) memo.set(k, k);
      stack[stack.length - 1] = {
        title: `fib(${k})`,
        detail: "caso base",
        state: "base",
        result: String(k),
      };
      snap(`Caso base: fib(${k}) devuelve ${k}.`, memoize ? 6 : 3);
      stack.pop();
      return k;
    }

    nodes[id].state = "waiting";
    stack[stack.length - 1] = {
      title: `fib(${k})`,
      detail: `espera fib(${k - 1}) + fib(${k - 2})`,
      state: "waiting",
    };
    snap(`fib(${k}) se abre en fib(${k - 1}) y fib(${k - 2}).`, memoize ? 7 : 4);

    const left = rec(k - 1, id, depth + 1);
    nodes[id].state = "waiting";
    const right = rec(k - 2, id, depth + 1);
    const result = left + right;
    nodes[id].state = "done";
    nodes[id].result = result;
    if (memoize) memo.set(k, result);
    stack[stack.length - 1] = {
      title: `fib(${k})`,
      detail: `${left} + ${right}`,
      state: "done",
      result: String(result),
    };
    snap(`fib(${k}) = ${left} + ${right} = ${result}.`, memoize ? 8 : 4);
    stack.pop();
    return result;
  };

  snap(
    memoize
      ? "Con memoria. La primera vez que aparece un n se anota. La siguiente, se responde al momento."
      : "Sin memoria. Cada llamada abre dos ramas, aunque ese número ya se haya calculado.",
    1,
  );
  const result = rec(n, null, 0);
  snap(`fib(${n}) = ${result}. Llamadas hechas: ${calls}.`, memoize ? 8 : 4);
  return steps;
}

export function layoutFib(nodes: FibNode[]) {
  const x = new Map<number, number>();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  let cursor = 0;

  const walk = (id: number): number => {
    const node = byId.get(id);
    if (!node) return 0;
    if (node.children.length === 0) {
      const pos = cursor;
      cursor += 1;
      x.set(id, pos);
      return pos;
    }
    const xs = node.children.map(walk);
    const pos = (xs[0] + xs[xs.length - 1]) / 2;
    x.set(id, pos);
    return pos;
  };

  if (nodes.length > 0) walk(nodes[0].id);
  return { x, columns: Math.max(cursor, 1) };
}

export const listCode = `def sumar(xs):
    if xs == []:
        return 0
    return xs[0] + sumar(xs[1:])`;

export type ListView = {
  items: number[];
  state: FrameState;
  result?: string;
};

export type ListStep = Step & { views: ListView[] };

export function listSteps(xs: number[]): ListStep[] {
  const steps: ListStep[] = [];
  const frames: Frame[] = [];
  const views: ListView[] = [];

  const label = (items: number[]) =>
    items.length === 0 ? "sumar([])" : `sumar([${items.join(", ")}])`;

  const snap = (narration: string, line: number) => {
    steps.push({
      narration,
      line,
      stack: cloneFrames(frames),
      views: views.map((view) => ({ ...view, items: [...view.items] })),
    });
  };

  snap("Una lista es una cabeza y un resto. El resto es otra lista, y se suma igual.", 1);

  const rec = (items: number[]): number => {
    frames.push({ title: label(items), detail: "entra", state: "active" });
    views.push({ items, state: "active" });

    if (items.length === 0) {
      frames[frames.length - 1] = {
        title: "sumar([])",
        detail: "caso base",
        state: "base",
        result: "0",
      };
      views[views.length - 1] = { items: [], state: "base", result: "0" };
      snap("La lista vacía no tiene cabeza. Devuelve 0 y no llama más.", 3);
      frames.pop();
      views.pop();
      return 0;
    }

    const head = items[0];
    const tail = items.slice(1);
    const tailLabel = tail.length === 0 ? "[]" : `[${tail.join(", ")}]`;
    frames[frames.length - 1] = {
      title: label(items),
      detail: `espera ${head} + sumar(${tailLabel})`,
      state: "waiting",
    };
    views[views.length - 1] = { items, state: "waiting" };
    snap(`La cabeza es ${head}. El resto ${tailLabel} se suma con la misma función.`, 4);

    const sub = rec(tail);
    const result = head + sub;
    frames[frames.length - 1] = {
      title: label(items),
      detail: `${head} + ${sub}`,
      state: "done",
      result: String(result),
    };
    views[views.length - 1] = { items, state: "done", result: String(result) };
    snap(`sumar(${tailLabel}) devolvió ${sub}. Este marco calcula ${head} + ${sub} = ${result}.`, 4);
    frames.pop();
    views.pop();
    return result;
  };

  const total = rec(xs);
  snap(
    `La suma es ${total}. Cada marco aportó solo su cabeza.`,
    xs.length === 0 ? 3 : 4,
  );
  return steps;
}

export const searchCode = `def buscar(xs, objetivo, i, j):
    if i > j:
        return -1
    medio = (i + j) // 2
    if xs[medio] == objetivo:
        return medio
    if xs[medio] < objetivo:
        return buscar(xs, objetivo, medio + 1, j)
    return buscar(xs, objetivo, i, medio - 1)`;

export const searchValues = [1, 3, 5, 8, 9, 12, 15, 20];

export type SearchStep = Step & {
  lo: number;
  hi: number;
  mid: number | null;
  answer: number | null;
};

export function searchSteps(xs: number[], target: number): SearchStep[] {
  const steps: SearchStep[] = [];
  const frames: Frame[] = [];
  let answer: number | null = null;

  const snap = (narration: string, line: number, lo: number, hi: number, mid: number | null) => {
    steps.push({
      narration,
      line,
      lo,
      hi,
      mid,
      answer,
      stack: cloneFrames(frames),
    });
  };

  const rec = (lo: number, hi: number): number => {
    frames.push({
      title: `buscar(${lo}, ${hi})`,
      detail: `objetivo ${target}`,
      state: "active",
    });

    if (lo > hi) {
      frames[frames.length - 1] = {
        title: `buscar(${lo}, ${hi})`,
        detail: "el tramo está vacío",
        state: "base",
        result: "−1",
      };
      snap(
        `i (${lo}) ya pasó a j (${hi}). El tramo se vació: ${target} no está.`,
        3,
        lo,
        hi,
        null,
      );
      frames.pop();
      return -1;
    }

    const mid = Math.floor((lo + hi) / 2);
    const value = xs[mid];
    snap(
      `Tramo del índice ${lo} al ${hi}. El medio es el índice ${mid} y vale ${value}.`,
      4,
      lo,
      hi,
      mid,
    );

    if (value === target) {
      answer = mid;
      frames[frames.length - 1] = {
        title: `buscar(${lo}, ${hi})`,
        detail: `xs[${mid}] es ${target}`,
        state: "done",
        result: String(mid),
      };
      snap(`xs[${mid}] es ${target}. Devolvemos el índice ${mid}.`, 6, lo, hi, mid);
      frames.pop();
      return mid;
    }

    if (value < target) {
      frames[frames.length - 1] = {
        title: `buscar(${lo}, ${hi})`,
        detail: `${value} < ${target}: mira a la derecha`,
        state: "waiting",
      };
      snap(
        `${value} es menor que ${target}. Se descarta la izquierda, incluido el medio.`,
        8,
        lo,
        hi,
        mid,
      );
      const found = rec(mid + 1, hi);
      frames[frames.length - 1] = {
        title: `buscar(${lo}, ${hi})`,
        detail: "recibe el índice",
        state: "done",
        result: String(found),
      };
      snap(`La llamada de la derecha devuelve ${found}. Este marco lo propaga.`, 8, lo, hi, mid);
      frames.pop();
      return found;
    }

    frames[frames.length - 1] = {
      title: `buscar(${lo}, ${hi})`,
      detail: `${value} > ${target}: mira a la izquierda`,
      state: "waiting",
    };
    snap(
      `${value} es mayor que ${target}. Se descarta la derecha, incluido el medio.`,
      9,
      lo,
      hi,
      mid,
    );
    const found = rec(lo, mid - 1);
    frames[frames.length - 1] = {
      title: `buscar(${lo}, ${hi})`,
      detail: "recibe el índice",
      state: "done",
      result: String(found),
    };
    snap(`La llamada de la izquierda devuelve ${found}. Este marco lo propaga.`, 9, lo, hi, mid);
    frames.pop();
    return found;
  };

  snap(`Buscamos ${target}. El primer tramo es la lista entera.`, 1, 0, xs.length - 1, null);
  const found = rec(0, xs.length - 1);
  const previous = steps[steps.length - 1];
  snap(
    found === -1
      ? `${target} no está. Todas las llamadas devolvieron −1 y la pila queda vacía.`
      : `${target} está en el índice ${found}. La pila queda vacía.`,
    found === -1 ? 3 : 6,
    previous.lo,
    previous.hi,
    found === -1 ? null : found,
  );
  return steps;
}

export const hanoiCode = `def hanoi(n, origen, auxiliar, destino):
    if n == 1:
        mover(origen, destino)
        return
    hanoi(n - 1, origen, destino, auxiliar)
    mover(origen, destino)
    hanoi(n - 1, auxiliar, origen, destino)`;

export type HanoiStep = Step & {
  pegs: number[][];
  disk: number | null;
  move: number;
  total: number;
};

export function hanoiSteps(n: number): HanoiStep[] {
  const steps: HanoiStep[] = [];
  const pegs: number[][] = [[], [], []];
  for (let disk = n; disk >= 1; disk -= 1) pegs[0].push(disk);

  const frames: Frame[] = [];
  const names = ["A", "B", "C"];
  let move = 0;
  const total = 2 ** n - 1;

  const snap = (narration: string, line: number, disk: number | null) => {
    steps.push({
      narration,
      line,
      disk,
      move,
      total,
      stack: cloneFrames(frames),
      pegs: pegs.map((peg) => [...peg]),
    });
  };

  const moveDisk = (from: number, to: number) => {
    const top = pegs[to][pegs[to].length - 1];
    const disk = pegs[from].pop();
    if (disk == null) throw new Error("El poste de origen está vacío.");
    if (top != null && disk > top) {
      throw new Error(`Movimiento ilegal: disco ${disk} sobre ${top}.`);
    }
    pegs[to].push(disk);
    move += 1;
    return disk;
  };

  const solve = (k: number, from: number, aux: number, to: number) => {
    if (k === 1) {
      frames.push({
        title: `hanoi(1, ${names[from]} → ${names[to]})`,
        detail: "caso base",
        state: "base",
      });
      const disk = moveDisk(from, to);
      frames[frames.length - 1] = {
        title: `hanoi(1, ${names[from]} → ${names[to]})`,
        detail: "un disco, sin llamadas",
        state: "base",
        result: `${names[from]}→${names[to]}`,
      };
      snap(
        `Caso base: el disco 1 pasa de ${names[from]} a ${names[to]}. No hay llamadas nuevas. Movimiento ${move} de ${total}.`,
        3,
        disk,
      );
      frames.pop();
      return;
    }

    frames.push({
      title: `hanoi(${k}, ${names[from]} → ${names[to]})`,
      detail: `apartar ${k - 1} en ${names[aux]}`,
      state: "active",
    });
    snap(
      `hanoi(${k}) va de ${names[from]} a ${names[to]}. Primero pide que los ${k - 1} de encima se aparten en ${names[aux]}.`,
      5,
      null,
    );
    frames[frames.length - 1] = {
      title: `hanoi(${k}, ${names[from]} → ${names[to]})`,
      detail: `espera el apartar en ${names[aux]}`,
      state: "waiting",
    };
    solve(k - 1, from, to, aux);

    const disk = moveDisk(from, to);
    frames[frames.length - 1] = {
      title: `hanoi(${k}, ${names[from]} → ${names[to]})`,
      detail: `mueve el disco ${disk}`,
      state: "active",
      result: `${names[from]}→${names[to]}`,
    };
    snap(
      `Los de encima ya están fuera. El disco ${disk} pasa de ${names[from]} a ${names[to]}. Movimiento ${move} de ${total}.`,
      6,
      disk,
    );
    frames[frames.length - 1] = {
      title: `hanoi(${k}, ${names[from]} → ${names[to]})`,
      detail: `colocar ${k - 1} en ${names[to]}`,
      state: "waiting",
    };
    solve(k - 1, aux, from, to);
    frames[frames.length - 1] = {
      title: `hanoi(${k}, ${names[from]} → ${names[to]})`,
      detail: "torre colocada",
      state: "done",
      result: "ok",
    };
    snap(`hanoi(${k}) termina: esos discos ya están en ${names[to]}. El marco puede salir.`, 7, null);
    frames.pop();
  };

  solve(n, 0, 1, 2);
  return steps;
}

export const normalCode = `def preparar():
    hervir()

def hervir():
    servir()

def servir():
    return "listo"`;

export const sinBaseCode = `def cuenta(n):
    return cuenta(n - 1)`;

export const conBaseCode = `def cuenta(n):
    if n == 0:
        return "fin"
    return cuenta(n - 1)`;

export type IntroAct = "normal" | "sin-base" | "con-base";

function frame(
  title: string,
  detail: string,
  state: FrameState,
  result?: string,
): Frame {
  return { title, detail, state, result };
}

function normalSteps(): Step[] {
  return [
    {
      narration: "El programa va a llamar a preparar(). La pila todavía está vacía.",
      line: 1,
      stack: [],
    },
    {
      narration: "preparar() entra. Su único trabajo es llamar a hervir().",
      line: 2,
      stack: [frame("preparar()", "va a llamar a hervir()", "active")],
    },
    {
      narration: "hervir() se pone encima. preparar() espera debajo, en el punto de la llamada.",
      line: 5,
      stack: [
        frame("preparar()", "esperando a hervir()", "waiting"),
        frame("hervir()", "va a llamar a servir()", "active"),
      ],
    },
    {
      narration: "servir() es ahora la cima. Es la única que trabaja.",
      line: 8,
      stack: [
        frame("preparar()", "esperando a hervir()", "waiting"),
        frame("hervir()", "esperando a servir()", "waiting"),
        frame("servir()", "devuelve «listo»", "active"),
      ],
    },
    {
      narration: "servir() termina. Su marco sale y hervir() recupera el control.",
      line: 8,
      stack: [
        frame("preparar()", "esperando a hervir()", "waiting"),
        frame("hervir()", "esperando a servir()", "waiting"),
        frame("servir()", "terminó", "done", "listo"),
      ],
    },
    {
      narration: "hervir() no tiene nada más que hacer. También sale.",
      line: 5,
      stack: [
        frame("preparar()", "esperando a hervir()", "waiting"),
        frame("hervir()", "terminó", "done"),
      ],
    },
    {
      narration: "preparar() termina. La pila vuelve a quedar vacía.",
      line: 2,
      stack: [frame("preparar()", "terminó", "done")],
    },
    {
      narration: "Nadie llamó a una copia de sí mismo. Aun así ya se ve la regla: la última en entrar es la primera en salir.",
      line: 1,
      stack: [],
    },
  ];
}

function sinBaseSteps(): Step[] {
  const waiting = (n: number): Frame =>
    frame(`cuenta(${n})`, `espera a cuenta(${n - 1})`, "waiting");
  return [
    {
      narration: "cuenta(3) no tiene caso base. Su cuerpo es llamarse con n − 1.",
      line: 2,
      stack: [frame("cuenta(3)", "llama a cuenta(2)", "active")],
    },
    {
      narration: "cuenta(2) hace lo mismo. La torre ya tiene dos pisos y ninguno sabe responder.",
      line: 2,
      stack: [waiting(3), frame("cuenta(2)", "llama a cuenta(1)", "active")],
    },
    {
      narration: "cuenta(1), cuenta(0)… el problema no se está acercando a una respuesta. Solo cambia el número.",
      line: 2,
      stack: [
        waiting(3),
        waiting(2),
        frame("cuenta(1)", "llama a cuenta(0)", "active"),
      ],
    },
    {
      narration: "cuenta(0) tampoco se detiene. Pide cuenta(-1).",
      line: 2,
      stack: [
        waiting(3),
        waiting(2),
        waiting(1),
        frame("cuenta(0)", "llama a cuenta(-1)", "active"),
      ],
    },
    {
      narration: "Aquí el lenguaje corta: RecursionError. Faltaba un caso que no llamara a nadie.",
      line: 2,
      stack: [
        waiting(3),
        waiting(2),
        waiting(1),
        waiting(0),
        frame("cuenta(-1)", "la pila se desborda", "boom", "error"),
      ],
    },
  ];
}

function conBaseSteps(): Step[] {
  const steps: Step[] = [];
  const frames: Frame[] = [];
  const snap = (narration: string, line: number) => {
    steps.push({ narration, line, stack: cloneFrames(frames) });
  };

  snap("Ahora cuenta(n) se detiene en 0. La bajada tiene un suelo.", 1);

  const rec = (k: number): string => {
    frames.push({
      title: `cuenta(${k})`,
      detail: "comprueba si n es 0",
      state: "active",
    });
    snap(
      k === 0
        ? "Entra cuenta(0). La condición se cumple."
        : `Entra cuenta(${k}). n no es 0, así que todavía no hay respuesta.`,
      2,
    );
    if (k === 0) {
      frames[frames.length - 1] = {
        title: "cuenta(0)",
        detail: "caso base",
        state: "base",
        result: "fin",
      };
      snap("Caso base: devuelve «fin» y no llama a cuenta(-1).", 3);
      frames.pop();
      return "fin";
    }
    frames[frames.length - 1] = {
      title: `cuenta(${k})`,
      detail: `espera a cuenta(${k - 1})`,
      state: "waiting",
    };
    snap(
      `cuenta(${k}) llama a cuenta(${k - 1}). El mismo problema, un número más cerca del cero.`,
      4,
    );
    const sub = rec(k - 1);
    frames[frames.length - 1] = {
      title: `cuenta(${k})`,
      detail: "propaga el retorno",
      state: "done",
      result: sub,
    };
    snap(
      `cuenta(${k - 1}) devolvió «${sub}». cuenta(${k}) no lo cambia: lo devuelve hacia arriba.`,
      4,
    );
    frames.pop();
    return sub;
  };

  rec(3);
  snap("La pila queda vacía. «fin» llegó hasta arriba porque el caso base detuvo la bajada.", 3);
  return steps;
}

export function introLesson(act: IntroAct): { code: string; steps: Step[] } {
  if (act === "normal") return { code: normalCode, steps: normalSteps() };
  if (act === "sin-base") return { code: sinBaseCode, steps: sinBaseSteps() };
  return { code: conBaseCode, steps: conBaseSteps() };
}

export const fractalCode = `def rama(longitud, angulo, profundidad):
    if profundidad == 0:
        return
    dibujar(longitud, angulo)
    rama(longitud * 0.72, angulo - 28, profundidad - 1)
    rama(longitud * 0.72, angulo + 28, profundidad - 1)`;

export const mazeCode = `def buscar(fila, col, camino):
    if not cabe(fila, col) or muro(fila, col) or camino[fila][col]:
        return
    camino[fila][col] = True
    if es_salida(fila, col):
        anotar(camino)
    else:
        for df, dc in ((0, 1), (1, 0), (0, -1), (-1, 0)):
            buscar(fila + df, col + dc, camino)
    camino[fila][col] = False`;

/** 2 entrada, 1 casilla libre, 0 muro, 3 salida. */
export const mazeMap = [
  [2, 1, 1],
  [1, 0, 1],
  [1, 1, 3],
];

export type MazeCell = "wall" | "open" | "path" | "head" | "undo" | "exit" | "sol1" | "sol2" | "both";

export type MazeStep = Step & {
  grid: MazeCell[][];
  paths: number;
};

const mazeDirections = [
  { name: "este", dr: 0, dc: 1 },
  { name: "sur", dr: 1, dc: 0 },
  { name: "oeste", dr: 0, dc: -1 },
  { name: "norte", dr: -1, dc: 0 },
];

export function mazeSteps(): MazeStep[] {
  const rows = mazeMap.length;
  const cols = mazeMap[0].length;
  const onPath = mazeMap.map((row) => row.map(() => false));
  const trail: [number, number][] = [];
  const solutions: [number, number][][] = [];
  const frames: Frame[] = [];
  const steps: MazeStep[] = [];

  const listed = (index: number, r: number, c: number) =>
    solutions[index]?.some(([rr, cc]) => rr === r && cc === c) ?? false;

  const paint = (head: [number, number] | null, undo: [number, number] | null): MazeCell[][] =>
    mazeMap.map((row, r) =>
      row.map((kind, c) => {
        if (kind === 0) return "wall";
        if (undo && undo[0] === r && undo[1] === c) return "undo";
        if (head && head[0] === r && head[1] === c && onPath[r][c]) return "head";
        if (onPath[r][c]) return "path";
        const first = listed(0, r, c);
        const second = listed(1, r, c);
        if (first && second) return "both";
        if (first) return "sol1";
        if (second) return "sol2";
        if (kind === 3) return "exit";
        return "open";
      }),
    );

  const snap = (
    narration: string,
    line: number,
    head: [number, number] | null,
    undo: [number, number] | null,
  ) => {
    steps.push({
      narration,
      line,
      paths: solutions.length,
      stack: cloneFrames(frames),
      grid: paint(head, undo),
    });
  };

  const inside = (r: number, c: number) => r >= 0 && c >= 0 && r < rows && c < cols;

  const route = () => trail.map(([r, c]) => `(${r}, ${c})`).join(" → ");

  const search = (r: number, c: number) => {
    if (!inside(r, c)) return;

    const wall = mazeMap[r][c] === 0;
    if (wall || onPath[r][c]) {
      frames.push({
        title: `buscar(${r}, ${c})`,
        detail: wall ? "hay un muro" : "ya está en el camino",
        state: "fail",
        result: "no",
      });
      snap(
        wall
          ? `(${r}, ${c}) es un muro. Esta llamada no marca nada.`
          : `(${r}, ${c}) ya está en el camino. Entrar otra vez haría un círculo.`,
        3,
        null,
        null,
      );
      frames.pop();
      return;
    }

    onPath[r][c] = true;
    trail.push([r, c]);
    frames.push({
      title: `buscar(${r}, ${c})`,
      detail: "marca la casilla",
      state: "active",
    });
    snap(`Entra en (${r}, ${c}) y la añade al camino.`, 4, [r, c], null);

    if (mazeMap[r][c] === 3) {
      solutions.push(trail.map(([rr, cc]) => [rr, cc]));
      const which = solutions.length === 1 ? "primer" : "segundo";
      frames[frames.length - 1] = {
        title: `buscar(${r}, ${c})`,
        detail: `anota el camino ${solutions.length}`,
        state: "base",
        result: String(solutions.length),
      };
      snap(
        `Este es el ${which} camino hasta E: ${route()}. Lo anoto. Ahora hay que borrar las marcas; si se quedaran, el otro camino no podría pasar.`,
        6,
        [r, c],
        null,
      );
    } else {
      for (const dir of mazeDirections) {
        frames[frames.length - 1] = {
          title: `buscar(${r}, ${c})`,
          detail: `prueba el ${dir.name}`,
          state: "waiting",
        };
        search(r + dir.dr, c + dir.dc);
      }
    }

    onPath[r][c] = false;
    trail.pop();
    const kept = solutions.some((path) => path.some(([rr, cc]) => rr === r && cc === c));
    frames[frames.length - 1] = {
      title: `buscar(${r}, ${c})`,
      detail: "borra la marca",
      state: "fail",
      result: kept ? "anotado" : "no",
    };
    snap(
      kept
        ? `buscar(${r}, ${c}) borra su marca. El camino ya anotado pasa al otro color.`
        : `Desde (${r}, ${c}) no hay más que explorar. Borra la marca.`,
      10,
      null,
      [r, c],
    );
    frames.pop();
  };

  snap(
    "Hay dos formas de ir de S a E. Se prueba este, sur, oeste y norte. Un camino que llega también se deshace, para poder encontrar el otro.",
    1,
    null,
    null,
  );
  search(0, 0);
  snap(
    "La pila queda vacía. El ámbar es el primer camino, por arriba. El verde es el segundo, por abajo. S y E están en los dos.",
    10,
    null,
    null,
  );
  return steps;
}

export const treeCode = `def sumar(nodo):
    if nodo is None:
        return 0
    izquierda = sumar(nodo.izq)
    derecha = sumar(nodo.der)
    return nodo.valor + izquierda + derecha`;

export type SumNode = {
  id: string;
  state: "idle" | "active" | "waiting" | "done";
  result?: number;
};

export type SumStep = Step & { nodes: SumNode[] };

const treeValue: Record<string, number> = { a: 3, b: 1, c: 4, d: 2 };
const treeLeft: Record<string, string | null> = { a: "b", b: null, c: "d", d: null };
const treeRight: Record<string, string | null> = { a: "c", b: null, c: null, d: null };
const treeIds = ["a", "b", "c", "d"];

export function treeSteps(): SumStep[] {
  const state: Record<string, { state: SumNode["state"]; result?: number }> = Object.fromEntries(
    treeIds.map((id) => [id, { state: "idle" }]),
  );
  const frames: Frame[] = [];
  const steps: SumStep[] = [];

  const cloneNodes = (): SumNode[] =>
    treeIds.map((id) => ({ id, state: state[id].state, result: state[id].result }));

  const snap = (narration: string, line: number) => {
    steps.push({ narration, line, stack: cloneFrames(frames), nodes: cloneNodes() });
  };

  const visit = (id: string | null): number => {
    if (id === null) {
      frames.push({
        title: "sumar(∅)",
        detail: "no hay nodo",
        state: "base",
        result: "0",
      });
      snap("No hay hijo en este lado. El caso base devuelve 0.", 3);
      frames.pop();
      return 0;
    }

    const value = treeValue[id];
    frames.push({
      title: `sumar(${value})`,
      detail: "entra en el nodo",
      state: "active",
    });
    state[id] = { state: "active" };
    const leaf = treeLeft[id] === null && treeRight[id] === null;
    snap(
      leaf
        ? `Entra en el nodo ${value}. Es una hoja: no tiene hijos, así que cada lado valdrá 0.`
        : `Entra en el nodo ${value}. Antes de responder, suma el hijo izquierdo.`,
      4,
    );

    state[id] = { state: "waiting" };
    frames[frames.length - 1] = {
      title: `sumar(${value})`,
      detail: "espera al hijo izquierdo",
      state: "waiting",
    };
    const left = visit(treeLeft[id]);

    state[id] = { state: "waiting" };
    frames[frames.length - 1] = {
      title: `sumar(${value})`,
      detail: `izquierda = ${left}; espera a la derecha`,
      state: "waiting",
    };
    snap(`El hijo izquierdo de ${value} devolvió ${left}. Ahora el derecho.`, 5);
    const right = visit(treeRight[id]);
    const total = value + left + right;
    state[id] = { state: "done", result: total };
    frames[frames.length - 1] = {
      title: `sumar(${value})`,
      detail: `${value} + ${left} + ${right}`,
      state: "done",
      result: String(total),
    };
    snap(`El nodo ${value} devuelve ${value} + ${left} + ${right} = ${total}.`, 6);
    frames.pop();
    return total;
  };

  snap(
    "Este árbol no lo dibuja la recursión. Ya está. Sumar es el valor del nodo más la suma de cada hijo.",
    1,
  );
  const total = visit("a");
  snap(`La raíz devuelve ${total}. Cada nodo sumó solo su valor a lo que trajeron sus hijos.`, 6);
  return steps;
}
