import { factorialSteps, fibonacciSteps, hanoiSteps, listSteps, mazeSteps, searchSteps, searchValues, treeSteps } from "../src/trace.ts";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const fact = factorialSteps(4);
assert(fact[fact.length - 1].narration.includes("24"), "factorial(4) debe ser 24");
assert(fact.some((step) => step.stack.some((frame) => frame.state === "base")), "factorial tiene caso base");

const fact0 = factorialSteps(0);
assert(fact0[fact0.length - 1].narration.includes("= 1"), "factorial(0) es 1");

for (const memo of [false, true]) {
  const fib = fibonacciSteps(6, memo);
  const last = fib[fib.length - 1];
  assert(last.narration.includes("= 8"), `fib(6) con memoria=${memo} debe ser 8`);
  if (!memo) assert(last.calls === 25, `fib(6) sin memoria hace 25 llamadas, hizo ${last.calls}`);
  if (memo) assert(last.calls < 20, `fib(6) con memoria no debería explotar, hizo ${last.calls}`);
}

assert(listSteps([4, 1, 7]).at(-1)?.narration.includes("12"), "suma [4,1,7] = 12");
assert(listSteps([]).at(-1)?.narration.includes("0"), "suma [] = 0");

const found = searchSteps(searchValues, 12);
assert(found.some((step) => step.answer === 5), "12 está en el índice 5");
const missing = searchSteps(searchValues, 7);
assert(missing.at(-1)?.stack.length === 0, "la búsqueda que falla vacía la pila");
assert(missing.some((step) => step.narration.includes("no está")), "7 no está");

for (let n = 1; n <= 4; n += 1) {
  const steps = hanoiSteps(n);
  const last = steps[steps.length - 1];
  assert(last.total === 2 ** n - 1, `Hanói ${n}: total`);
  assert(last.move === last.total, `Hanói ${n}: se hicieron todos los movimientos`);
  assert(JSON.stringify(last.pegs[2]) === JSON.stringify(Array.from({ length: n }, (_, i) => n - i)), `Hanói ${n}: destino`);
  assert(last.pegs[0].length === 0 && last.pegs[1].length === 0, `Hanói ${n}: origen y auxiliar vacíos`);
}

const maze = mazeSteps();
const firstPath = maze.findIndex((step) => step.narration.includes("primer camino"));
const secondPath = maze.findIndex((step) => step.narration.includes("segundo camino"));
const undoBetween = maze.slice(firstPath + 1, secondPath).some((step) => step.narration.includes("borra su marca"));
assert(firstPath > 0 && secondPath > firstPath, "aparecen dos caminos y el primero va antes");
assert(undoBetween, "el primer camino se deshace antes de encontrar el segundo");
const end = maze[maze.length - 1];
assert(end.paths === 2 && end.stack.length === 0, "el laberinto termina con dos caminos y la pila vacía");
assert(end.grid[0][0] === "both" && end.grid[2][2] === "both", "S y E están en los dos caminos");
assert(end.grid[0][1] === "sol1" && end.grid[0][2] === "sol1" && end.grid[1][2] === "sol1", "el primer camino va por arriba");
assert(end.grid[1][0] === "sol2" && end.grid[2][0] === "sol2" && end.grid[2][1] === "sol2", "el segundo camino va por abajo");
assert(end.grid[1][1] === "wall", "el centro sigue siendo un muro");

const tree = treeSteps();
assert(tree.at(-1)?.narration.includes("10"), "la raíz del árbol suma 10");
assert(tree.at(-1)?.stack.length === 0, "el árbol termina con la pila vacía");
assert(tree.some((step) => step.stack.some((frame) => frame.title === "sumar(∅)" && frame.result === "0")), "el hijo vacío devuelve 0");
assert(tree.at(-1)?.nodes.find((node) => node.id === "a")?.result === 10, "el nodo raíz queda en 10");
assert(tree.at(-1)?.nodes.every((node) => node.state === "done"), "todos los nodos terminan resueltos");

console.log("trazas ok");
