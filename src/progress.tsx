import { createContext, useContext, useState, type ReactNode } from "react";

const KEY = "recurso-progress-v1";

type ProgressValue = {
  done: Record<string, boolean>;
  mark: (slug: string) => void;
  reset: () => void;
};

const ProgressContext = createContext<ProgressValue | null>(null);

function read(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(read);

  const mark = (slug: string) => {
    setDone((prev) => {
      if (prev[slug]) return prev;
      const next = { ...prev, [slug]: true };
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    localStorage.removeItem(KEY);
    setDone({});
  };

  return (
    <ProgressContext.Provider value={{ done, mark, reset }}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("useProgress tiene que usarse dentro de ProgressProvider.");
  return value;
}
