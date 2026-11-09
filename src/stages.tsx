import { useEffect, useMemo, useRef, useState } from "react";
import {
  factorialCode,
  factorialSteps,
  fibMemoCode,
  fibNaiveCode,
  fibonacciSteps,
  fractalCode,
  hanoiCode,
  hanoiSteps,
  introLesson,
  layoutFib,
  listCode,
  listSteps,
  mazeCode,
  mazeMap,
  mazeSteps,
  searchCode,
  searchSteps,
  searchValues,
  treeCode,
  treeSteps,
  type FibNode,
  type IntroAct,
} from "./trace";
import { CodeBlock, Segmented, Slider, StackView, Stage, usePlayer } from "./ui";

function pick<T>(items: T[], index: number): T {
  return items[Math.min(Math.max(index, 0), items.length - 1)];
}

export function IntroStage() {
  const [act, setAct] = useState<IntroAct>("normal");
  const lesson = useMemo(() => introLesson(act), [act]);
  const player = usePlayer(lesson.steps.length, act);
  const step = pick(lesson.steps, player.index);

  return (
    <Stage
      code={lesson.code}
      line={step.line}
      narration={step.narration}
      player={player}
      controls={
        <Segmented
          label="Escena"
          value={act}
          onChange={setAct}
          options={[
            { value: "normal", label: "Llamada normal" },
            { value: "sin-base", label: "Sin caso base" },
            { value: "con-base", label: "Con caso base" },
          ]}
        />
      }
    >
      <StackView frames={step.stack} />
    </Stage>
  );
}

export function FactorialStage() {
  const [n, setN] = useState(4);
  const steps = useMemo(() => factorialSteps(n), [n]);
  const player = usePlayer(steps.length, String(n));
  const step = pick(steps, player.index);

  return (
    <Stage
      code={factorialCode}
      line={step.line}
      narration={step.narration}
      player={player}
      controls={<Slider label="n" min={0} max={6} value={n} onChange={setN} />}
    >
      <StackView frames={step.stack} />
    </Stage>
  );
}

export function FibonacciStage() {
  const [n, setN] = useState(5);
  const [memo, setMemo] = useState(false);
  const steps = useMemo(() => fibonacciSteps(n, memo), [n, memo]);
  const player = usePlayer(steps.length, `${n}-${memo}`);
  const step = pick(steps, player.index);
  const full = steps[steps.length - 1];
  const layout = useMemo(() => layoutFib(full.nodes), [full]);
  const depth = full.nodes.reduce((max, node) => Math.max(max, node.depth), 0);

  return (
    <Stage
      code={memo ? fibMemoCode : fibNaiveCode}
      line={step.line}
      narration={step.narration}
      player={player}
      controls={
        <>
          <Slider label="n" min={1} max={6} value={n} onChange={setN} />
          <Segmented
            label="Memoria"
            value={memo ? "si" : "no"}
            onChange={(value) => setMemo(value === "si")}
            options={[
              { value: "no", label: "Sin memoria" },
              { value: "si", label: "Con memoria" },
            ]}
          />
          <p className="stat">
            Traza completa: <strong>{full.calls}</strong> llamadas
          </p>
        </>
      }
    >
      <div className="fib-layout">
        <StackView frames={step.stack} />
        <div className="tree-scroll">
          <Tree nodes={step.nodes} layout={layout} depth={depth} />
          <ul className="legend">
            <li><i className="swatch active" /> activa</li>
            <li><i className="swatch waiting" /> esperando</li>
            <li><i className="swatch done" /> resuelta</li>
            <li><i className="swatch hit" /> memoria</li>
          </ul>
        </div>
      </div>
    </Stage>
  );
}

function Tree({
  nodes,
  layout,
  depth,
}: {
  nodes: FibNode[];
  layout: ReturnType<typeof layoutFib>;
  depth: number;
}) {
  const gapX = 72;
  const gapY = 86;
  const padX = 34;
  const padY = 28;
  const width = padX * 2 + Math.max(layout.columns - 1, 0) * gapX;
  const height = padY * 2 + depth * gapY + 22;
  const byId = new Map(nodes.map((node) => [node.id, node]));

  const point = (node: FibNode) => ({
    x: padX + (layout.x.get(node.id) ?? 0) * gapX,
    y: padY + node.depth * gapY,
  });

  return (
    <svg className="tree" viewBox={`0 0 ${Math.max(width, 80)} ${Math.max(height, 80)}`} role="img" aria-label="Árbol de llamadas">
      {nodes.map((node) => {
        if (node.parent === null) return null;
        const parent = byId.get(node.parent);
        if (!parent) return null;
        const from = point(parent);
        const to = point(node);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.hypot(dx, dy) || 1;
        const pad = 18;
        return (
          <line
            key={`e-${node.id}`}
            x1={from.x + (dx / length) * pad}
            y1={from.y + (dy / length) * pad}
            x2={to.x - (dx / length) * pad}
            y2={to.y - (dy / length) * pad}
          />
        );
      })}
      {nodes.map((node) => {
        const { x, y } = point(node);
        return (
          <g key={node.id} className={`node ${node.state}`}>
            {node.result !== undefined ? (
              <text className="arg" x={x} y={y - 24}>{node.n}</text>
            ) : null}
            <circle cx={x} cy={y} r="16" />
            <text x={x} y={y + 1}>{node.result ?? node.n}</text>
          </g>
        );
      })}
    </svg>
  );
}

const lists = [
  [4, 1, 7],
  [2, 5],
  [8],
];

export function ListStage() {
  const [choice, setChoice] = useState(0);
  const xs = lists[choice];
  const steps = useMemo(() => listSteps(xs), [xs]);
  const player = usePlayer(steps.length, xs.join(","));
  const step = pick(steps, player.index);

  return (
    <Stage
      code={listCode}
      line={step.line}
      narration={step.narration}
      player={player}
      controls={
        <Segmented
          label="Lista"
          value={String(choice)}
          onChange={(value) => setChoice(Number(value))}
          options={lists.map((items, index) => ({
            value: String(index),
            label: `[${items.join(", ")}]`,
          }))}
        />
      }
    >
      <div className="slices">
        {step.views.length === 0 ? <p className="empty-stack">Todavía no hay llamadas</p> : null}
        {step.views.map((view, index) => (
          <div key={index} className={`slice ${view.state}`} style={{ marginLeft: index * 18 }}>
            {view.items.length === 0 ? (
              <span className="pill mute">[ ]</span>
            ) : (
              <>
                <span className="pill head">{view.items[0]}</span>
                <span className="tail">
                  {view.items.slice(1).map((item, itemIndex) => (
                    <span key={itemIndex} className="pill">{item}</span>
                  ))}
                  {view.items.length === 1 ? <span className="pill mute">resto vacío</span> : null}
                </span>
              </>
            )}
            {view.result ? <b className="slice-result">{view.result}</b> : null}
          </div>
        ))}
      </div>
      <StackView frames={step.stack} />
    </Stage>
  );
}

export function SearchStage() {
  const [target, setTarget] = useState(12);
  const steps = useMemo(() => searchSteps(searchValues, target), [target]);
  const player = usePlayer(steps.length, String(target));
  const step = pick(steps, player.index);

  return (
    <Stage
      code={searchCode}
      line={step.line}
      narration={step.narration}
      player={player}
      controls={
        <button type="button" className="text-btn" onClick={() => setTarget(7)}>
          Buscar 7, que no está
        </button>
      }
    >
      <div className="numrow" role="list">
        {searchValues.map((value, index) => {
          const inside = index >= step.lo && index <= step.hi;
          const mid = index === step.mid;
          const hit = index === step.answer;
          const className = hit ? "cell hit" : mid ? "cell mid" : inside ? "cell" : "cell off";
          return (
            <button key={value} type="button" className={className} onClick={() => setTarget(value)}>
              <small>{index}</small>
              {value}
            </button>
          );
        })}
      </div>
      <p className="keys">Pulsa un número para buscarlo. El índice va debajo del valor.</p>
      <StackView frames={step.stack} />
    </Stage>
  );
}

const diskColors = ["#ffd27a", "#ff7a3c", "#ff5d73", "#9aa7ff"];

export function HanoiStage() {
  const [n, setN] = useState(3);
  const steps = useMemo(() => hanoiSteps(n), [n]);
  const player = usePlayer(steps.length, String(n));
  const step = pick(steps, player.index);
  const names = ["A", "B", "C"];

  return (
    <Stage
      code={hanoiCode}
      line={step.line}
      narration={step.narration}
      player={player}
      controls={
        <>
          <Slider label="discos" min={1} max={4} value={n} onChange={setN} />
          <p className="stat">
            Mínimo <strong>{2 ** n - 1}</strong> movimientos
          </p>
        </>
      }
    >
      <div className="hanoi-layout">
        <div className="pegs" aria-label="Postes">
          {step.pegs.map((peg, index) => (
            <div key={names[index]} className="peg">
              <div className="peg-post" />
              <div className="disks">
                {[...peg].reverse().map((disk) => (
                  <span
                    key={disk}
                    className={disk === step.disk ? "disk moved" : "disk"}
                    style={{
                      width: `${36 + (disk / n) * 64}%`,
                      background: diskColors[disk - 1],
                    }}
                  >
                    {disk}
                  </span>
                ))}
              </div>
              <span className="peg-name">{names[index]}</span>
            </div>
          ))}
        </div>
        <StackView frames={step.stack} />
      </div>
    </Stage>
  );
}

export function FractalStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [depth, setDepth] = useState(7);
  const [spread, setSpread] = useState(26);
  const [line, setLine] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const width = parent.clientWidth;
      const height = 460;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const branch = (x: number, y: number, length: number, angle: number, level: number) => {
        if (level === 0 || length < 1.2) return;
        const nextX = x + Math.cos(angle) * length;
        const nextY = y + Math.sin(angle) * length;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nextX, nextY);
        const nearTrunk = level / depth;
        ctx.strokeStyle = nearTrunk > 0.72 ? "#ff7a3c" : `rgba(244, 240, 230, ${0.28 + nearTrunk * 0.65})`;
        ctx.lineWidth = Math.max(1, level * 0.42);
        ctx.lineCap = "round";
        ctx.stroke();
        const turn = (spread * Math.PI) / 180;
        const shorter = length * 0.72;
        branch(nextX, nextY, shorter, angle - turn, level - 1);
        branch(nextX, nextY, shorter, angle + turn, level - 1);
      };

      branch(width / 2, height - 28, Math.min(height * 0.27, 130), -Math.PI / 2, depth);
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [depth, spread]);

  return (
    <section className="stage">
      <div className="controls">
        <Slider label="profundidad" min={0} max={11} value={depth} onChange={setDepth} />
        <Slider label="ángulo" min={8} max={60} value={spread} onChange={setSpread} />
        <Segmented
          label="Qué mirar en el código"
          value={String(line)}
          onChange={(value) => setLine(Number(value))}
          options={[
            { value: "3", label: "Caso base" },
            { value: "5", label: "Caso recursivo" },
          ]}
        />
      </div>
      <p className="narration">
        {depth === 0
          ? "Profundidad 0: la función vuelve enseguida y el lienzo se queda vacío. Ese es el corte."
          : `Profundidad ${depth}. Cada rama se dibuja y llama a dos ramas más cortas, abiertas ${spread}° a cada lado.`}
      </p>
      <div className="stage-grid">
        <CodeBlock code={fractalCode} line={line} />
        <div className="visual canvas-wrap">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </section>
  );
}

export function MazeStage() {
  const steps = useMemo(() => mazeSteps(), []);
  const player = usePlayer(steps.length, "laberinto");
  const step = pick(steps, player.index);

  return (
    <Stage
      code={mazeCode}
      line={step.line}
      narration={step.narration}
      player={player}
      controls={
        <>
          <p className="stat">Orden: este, sur, oeste, norte</p>
          <p className="stat">
            Caminos anotados <strong>{step.paths}</strong>
          </p>
        </>
      }
    >
      <div className="maze-layout">
        <div>
          <div className="maze" role="img" aria-label="Laberinto">
            {step.grid.map((row, r) =>
              row.map((cell, c) => {
                const kind = mazeMap[r][c];
                const label = kind === 2 ? "S" : kind === 3 ? "E" : cell === "undo" ? "×" : "";
                return (
                  <div key={`${r}-${c}`} className={`maze-cell ${cell}`}>
                    {label}
                  </div>
                );
              }),
            )}
          </div>
          <ul className="legend">
            <li><i className="swatch active" /> ahora</li>
            <li><i className="swatch hit" /> camino 1</li>
            <li><i className="swatch done" /> camino 2</li>
          </ul>
        </div>
        <StackView frames={step.stack} />
      </div>
    </Stage>
  );
}

const sumLayout: Record<string, { x: number; y: number }> = {
  a: { x: 160, y: 42 },
  b: { x: 64, y: 128 },
  c: { x: 256, y: 128 },
  d: { x: 196, y: 214 },
};

const sumValue: Record<string, number> = { a: 3, b: 1, c: 4, d: 2 };
const sumEdges = [
  ["a", "b"],
  ["a", "c"],
  ["c", "d"],
];

export function TreeStage() {
  const steps = useMemo(() => treeSteps(), []);
  const player = usePlayer(steps.length, "arbol");
  const step = pick(steps, player.index);

  return (
    <Stage
      code={treeCode}
      line={step.line}
      narration={step.narration}
      player={player}
    >
      <div className="maze-layout">
        <svg className="sum-tree" viewBox="0 0 320 260" role="img" aria-label="Árbol de números">
          {sumEdges.map(([from, to]) => (
            <line
              key={`${from}-${to}`}
              x1={sumLayout[from].x}
              y1={sumLayout[from].y}
              x2={sumLayout[to].x}
              y2={sumLayout[to].y}
            />
          ))}
          {step.nodes.map((node) => {
            const point = sumLayout[node.id];
            return (
              <g key={node.id} className={node.state}>
                <circle cx={point.x} cy={point.y} r="22" />
                <text x={point.x} y={point.y + 1}>{sumValue[node.id]}</text>
                {node.result !== undefined ? (
                  <text className="result" x={point.x} y={point.y + 38}>{node.result}</text>
                ) : null}
              </g>
            );
          })}
        </svg>
        <StackView frames={step.stack} />
      </div>
    </Stage>
  );
}
