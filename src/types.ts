export type FrameState = "active" | "waiting" | "base" | "done" | "boom" | "fail";

export type Frame = {
  title: string;
  detail: string;
  state: FrameState;
  result?: string;
};

export type Step = {
  narration: string;
  line: number;
  stack: Frame[];
};

export type Lesson = {
  slug: string;
  index: string;
  kicker: string;
  title: string;
  summary: string;
  minutes: number;
  sections: { heading: string; text: string[] }[];
  question: {
    prompt: string;
    options: string[];
    answer: number;
    hint: string;
    why: string;
  };
};
