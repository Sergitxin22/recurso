import { useEffect, useState, type ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import { lessons } from "./content";
import { useProgress } from "./progress";
import type { Frame, FrameState, Lesson } from "./types";

const stateLabel: Record<FrameState, string> = {
  active: "ejecutando",
  waiting: "esperando",
  base: "caso base",
  done: "devuelve",
  boom: "desborde",
  fail: "no",
};

export function Mark() {
  return (
    <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <rect x="8" y="8" width="16" height="16" rx="3" fill="none" stroke="#ff7a3c" strokeWidth="1.8" />
      <rect x="14" y="14" width="4" height="4" fill="#5ee0a0" />
    </svg>
  );
}

export function Shell() {
  const { done } = useProgress();
  const count = lessons.filter((lesson) => done[lesson.slug]).length;

  return (
    <div className="app">
      <header className="top">
        <Link to="/" className="brand">
          <Mark />
          <span>Recurso</span>
        </Link>
        <p className="top-progress">
          <span>{count}</span> / {lessons.length} lecciones
        </p>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="foot">
        <span>Recursión, a la vista</span>
        <a href="https://devpath.es" rel="noreferrer">
          Un proyecto de devpath.es
        </a>
      </footer>
    </div>
  );
}

export function StackView({ frames }: { frames: Frame[] }) {
  if (frames.length === 0) {
    return <p className="empty-stack">Pila vacía</p>;
  }

  return (
    <div className="stack-wrap">
      <span className="stack-tag">cima</span>
      <div className="stack">
        {frames.map((frame, index) => (
          <article key={`${frame.title}-${index}`} className={`frame ${frame.state}`}>
            <div>
              <strong>{frame.title}</strong>
              <em>{frame.detail}</em>
            </div>
            <div className="frame-side">
              <span>{stateLabel[frame.state]}</span>
              {frame.result ? <b>{frame.result}</b> : null}
            </div>
          </article>
        ))}
      </div>
      <span className="stack-tag">fondo</span>
    </div>
  );
}

export function CodeBlock({ code, line }: { code: string; line: number }) {
  return (
    <div className="code">
      <div className="code-top">
        <span>Python</span>
        <span>línea en curso</span>
      </div>
      <pre>
        {code.split("\n").map((text, index) => (
          <div key={index} className={index + 1 === line ? "code-line on" : "code-line"}>
            <span>{index + 1}</span>
            <span>{text.length > 0 ? text : " "}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

export function usePlayer(length: number, resetKey: string) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [seenKey, setSeenKey] = useState(resetKey);

  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setIndex(0);
    setPlaying(false);
  }

  useEffect(() => {
    if (!playing) return;
    if (index >= length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setIndex((current) => Math.min(length - 1, current + 1));
    }, 1150);
    return () => window.clearTimeout(timer);
  }, [playing, index, length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON" || tag === "A") {
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPlaying(false);
        setIndex((current) => Math.min(length - 1, current + 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPlaying(false);
        setIndex((current) => Math.max(0, current - 1));
      } else if (event.key === " ") {
        event.preventDefault();
        setPlaying((current) => !current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [length]);

  return { index, setIndex, playing, setPlaying, length, resetKey };
}

export function Player({
  index,
  length,
  playing,
  resetKey,
  onPrev,
  onNext,
  onToggle,
  onScrub,
}: {
  index: number;
  length: number;
  playing: boolean;
  resetKey: string;
  onPrev: () => void;
  onNext: () => void;
  onToggle: () => void;
  onScrub: (value: number) => void;
}) {
  return (
    <div className="player">
      <button type="button" onClick={onPrev} disabled={index === 0}>
        Anterior
      </button>
      <button type="button" onClick={onToggle} className="play">
        {playing ? "Pausa" : "Play"}
      </button>
      <button type="button" onClick={onNext} disabled={index >= length - 1}>
        Siguiente
      </button>
      <input
        type="range"
        min={0}
        max={Math.max(length - 1, 0)}
        value={index}
        key={resetKey}
        aria-label="Posición de la traza"
        onChange={(event) => onScrub(Number(event.target.value))}
      />
      <span className="stepcount">
        {index + 1} / {length}
      </span>
    </div>
  );
}

export function Stage({
  code,
  line,
  narration,
  player,
  controls,
  children,
}: {
  code: string;
  line: number;
  narration: string;
  player: ReturnType<typeof usePlayer>;
  controls?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="stage">
      {controls ? <div className="controls">{controls}</div> : null}
      <p className="narration" aria-live="polite">
        {narration}
      </p>
      <div className="stage-grid">
        <CodeBlock code={code} line={line} />
        <div className="visual">{children}</div>
      </div>
      <Player
        index={player.index}
        length={player.length}
        playing={player.playing}
        resetKey={player.resetKey}
        onPrev={() => {
          player.setPlaying(false);
          player.setIndex((current) => Math.max(0, current - 1));
        }}
        onNext={() => {
          player.setPlaying(false);
          player.setIndex((current) => Math.min(player.length - 1, current + 1));
        }}
        onToggle={() => player.setPlaying((current) => !current)}
        onScrub={(value) => {
          player.setPlaying(false);
          player.setIndex(value);
        }}
      />
      <p className="keys">Flechas para un paso. Espacio para reproducir.</p>
    </section>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="slider">
      <span>
        {label} <strong>{value}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={option.value === value ? "on" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function QuestionCard({ slug, question }: { slug: string; question: Lesson["question"] }) {
  const { done, mark } = useProgress();
  const [picked, setPicked] = useState<number | null>(done[slug] ? question.answer : null);
  const solved = picked === question.answer;

  return (
    <section className="question">
      <p className="eyebrow">Comprueba</p>
      <h2>{question.prompt}</h2>
      <div className="options">
        {question.options.map((option, index) => {
          const state = picked === null ? "" : index === question.answer && solved ? "good" : picked === index ? "bad" : "";
          return (
            <button
              key={option}
              type="button"
              className={`opt ${state}`}
              disabled={solved}
              onClick={() => {
                setPicked(index);
                if (index === question.answer) mark(slug);
              }}
            >
              <span>{String.fromCharCode(65 + index)}</span>
              {option}
            </button>
          );
        })}
      </div>
      {picked !== null && !solved ? <p className="hint">{question.hint}</p> : null}
      {solved ? <p className="why">{question.why}</p> : null}
    </section>
  );
}
