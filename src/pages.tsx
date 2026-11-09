import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { lessonBySlug, lessons } from "./content";
import { useProgress } from "./progress";
import {
  FactorialStage,
  FibonacciStage,
  FractalStage,
  HanoiStage,
  IntroStage,
  ListStage,
  MazeStage,
  SearchStage,
  TreeStage,
} from "./stages";
import { factorialSteps } from "./trace";
import { QuestionCard, StackView } from "./ui";

const stages = {
  "la-llamada": IntroStage,
  factorial: FactorialStage,
  fibonacci: FibonacciStage,
  listas: ListStage,
  busqueda: SearchStage,
  hanoi: HanoiStage,
  fractal: FractalStage,
  laberinto: MazeStage,
  arbol: TreeStage,
};

export function Home() {
  const steps = useMemo(() => factorialSteps(3), []);
  const [index, setIndex] = useState(0);
  const { done, reset } = useProgress();
  const count = lessons.filter((lesson) => done[lesson.slug]).length;
  const step = steps[index];

  useEffect(() => {
    document.title = "Recurso";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const base = steps.findIndex((item) => item.stack.some((frame) => frame.state === "base"));
      setIndex(base === -1 ? 0 : base);
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % steps.length);
    }, 1300);
    return () => window.clearInterval(timer);
  }, [steps]);

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Recursividad, a la vista</p>
          <h1>
            Mira cómo una función <em>se llama</em> a sí misma.
          </h1>
          <p className="lede">
            Recurso enseña recursión haciendo visible lo que el lenguaje esconde: la pila, el caso
            base y el camino de vuelta.
          </p>
          <div className="cta">
            <Link className="btn primary" to="/leccion/la-llamada">
              Empezar por la pila
            </Link>
            <a className="btn ghost" href="#mapa">
              Ver el mapa
            </a>
          </div>
        </div>
        <aside className="hero-stage">
          <div className="code-top">
            <span>en vivo</span>
            <span>factorial(3)</span>
          </div>
          <p className="narration tight">{step.narration}</p>
          <StackView frames={step.stack} />
          <Link className="text-link" to="/leccion/factorial">
            Abrir este paso a paso
          </Link>
        </aside>
      </section>

      <section id="mapa" className="map-section">
        <div className="section-head">
          <p className="eyebrow">El mapa</p>
          <h2>Nueve lecciones. Dos caminos, y un árbol que ya estaba.</h2>
          <p>
            {count === 0
              ? "Los avances se quedan en este navegador."
              : `${count} de ${lessons.length} hechas en este navegador.`}
          </p>
        </div>
        <div className="map">
          {lessons.map((lesson) => (
            <Link
              key={lesson.slug}
              to={`/leccion/${lesson.slug}`}
              className={done[lesson.slug] ? "card done" : "card"}
            >
              <span className="card-index">{lesson.index}</span>
              <span>
                <strong>{lesson.title}</strong>
                <em>{lesson.summary}</em>
              </span>
              <span className="card-meta">{done[lesson.slug] ? "Hecha" : `${lesson.minutes} min`}</span>
            </Link>
          ))}
        </div>
        {count > 0 ? (
          <button type="button" className="text-btn reset" onClick={reset}>
            Borrar avances
          </button>
        ) : null}
      </section>
    </>
  );
}

export function LessonPage() {
  const { slug = "" } = useParams();
  const lesson = lessonBySlug(slug);

  useEffect(() => {
    document.title = lesson ? `${lesson.title} · Recurso` : "Recurso";
  }, [lesson]);

  if (!lesson) return <Missing />;

  const Stage = stages[lesson.slug as keyof typeof stages];
  const index = lessons.findIndex((item) => item.slug === lesson.slug);
  const previous = lessons[index - 1];
  const next = lessons[index + 1];

  return (
    <article className="lesson">
      <p className="eyebrow">
        {lesson.index} / {lessons.length} · {lesson.kicker}
      </p>
      <h1>{lesson.title}</h1>
      <p className="lede">{lesson.summary}</p>
      {lesson.sections.map((section) => (
        <section key={section.heading} className="prose">
          <h2>{section.heading}</h2>
          {section.text.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
      <Stage />
      <QuestionCard key={lesson.slug} slug={lesson.slug} question={lesson.question} />
      <nav className="pager">
        {previous ? <Link to={`/leccion/${previous.slug}`}>← {previous.title}</Link> : <span />}
        {next ? (
          <Link to={`/leccion/${next.slug}`}>{next.title} →</Link>
        ) : (
          <Link to="/">Volver al mapa</Link>
        )}
      </nav>
    </article>
  );
}

export function Missing() {
  return (
    <section className="missing">
      <p className="eyebrow">404</p>
      <h1>Esa página no está.</h1>
      <Link className="btn primary" to="/">
        Volver al inicio
      </Link>
    </section>
  );
}
