export type WordTiming = { word: string; start: number; end: number };

/** Find the frame when a target word is spoken */
export const wf = (
  words: WordTiming[],
  target: string,
  fps: number = 30,
): number => {
  const t = target.toLowerCase();
  const w = words.find((w) => w.word.toLowerCase().includes(t));
  return w ? Math.round(w.start * fps) : 0;
};

/** Find the frame when a target word finishes being spoken */
export const wfEnd = (
  words: WordTiming[],
  target: string,
  fps: number = 30,
): number => {
  const t = target.toLowerCase();
  const w = words.find((w) => w.word.toLowerCase().includes(t));
  return w ? Math.round(w.end * fps) : 0;
};

/**
 * Create an audio-offset-aware word finder.
 * Returned function maps word → visual-local frame position,
 * accounting for J-cut / L-cut offset.
 */
export const makeWf =
  (words: WordTiming[], offset: number) =>
  (target: string) =>
    wf(words, target) + offset;

/**
 * Proportional word-frame estimation when STT timestamps aren't available.
 * Distributes time proportionally by character count with pause estimates.
 * Accurate to ~0.5s for TTS audio — sufficient for the 0.3-0.8s visual lead window.
 */
export const estimateWordFrames = (
  narration: string,
  totalDurationSec: number,
  fps: number = 30,
): WordTiming[] => {
  const PERIOD_PAUSE = 0.4;
  const COMMA_PAUSE = 0.2;

  const rawWords = narration.split(/\s+/).filter(Boolean);
  const totalChars = rawWords.reduce(
    (sum, w) => sum + w.replace(/[.,!?;:]/g, "").length,
    0,
  );

  const pauseTime =
    (narration.match(/[.?!]/g) || []).length * PERIOD_PAUSE +
    (narration.match(/,/g) || []).length * COMMA_PAUSE;
  const speakingTime = Math.max(0, totalDurationSec - pauseTime);

  const result: WordTiming[] = [];
  let cursor = 0;

  for (const w of rawWords) {
    const clean = w.replace(/[.,!?;:]/g, "");
    const charDuration =
      totalChars > 0 ? (clean.length / totalChars) * speakingTime : 0;
    const start = cursor;
    const end = cursor + charDuration;
    result.push({ word: clean, start, end });
    cursor = end;
    if (/[.?!]/.test(w)) cursor += PERIOD_PAUSE;
    else if (/,/.test(w)) cursor += COMMA_PAUSE;
  }

  return result;
};
