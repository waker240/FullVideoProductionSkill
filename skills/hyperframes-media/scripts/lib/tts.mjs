// Shared public media helpers. No browser session, proxy, or private endpoint.
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import api from "../../../fish-audio-api/scripts/public-media-api.cjs";
export const { loadProjectEnv, resolveFishConfig, validateFishModel, synthesizeOne } = api;
export const validateTranscriptionConfig = api.resolveTranscriptionConfig;

export function withWordIds(words) {
  return (words ?? [])
    .filter((word) => word && isFinite(word.start) && isFinite(word.end))
    .map((word, index) => ({
      id: `w${index}`,
      text: String(word.text ?? word.word ?? "").trim(),
      start: Number(word.start),
      end: Number(word.end),
    }))
    .filter((word) => word.text && word.end >= word.start);
}

export function ffprobeDuration(absPath) {
  const result = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "a:0",
      "-show_entries",
      "stream=index,duration:format=duration",
      "-of",
      "json",
      absPath,
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0) return NaN;
  try {
    const parsed = JSON.parse(String(result.stdout));
    if (!Array.isArray(parsed?.streams) || parsed.streams.length === 0) return NaN;
    const durations = [
      ...parsed.streams.map((stream) => Number(stream?.duration)),
      Number(parsed?.format?.duration),
    ];
    return durations.find((duration) => Number.isFinite(duration) && duration > 0) ?? NaN;
  } catch {
    return NaN;
  }
}


export async function transcribeWav({ wavRel, lang = "en", hyperframesDir }) {
  const result = await api.transcribeAudio({ file: join(hyperframesDir, wavRel), language: lang });
  return result.words;
}
