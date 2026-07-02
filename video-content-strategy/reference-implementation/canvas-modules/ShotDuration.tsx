import { createContext, useContext } from "react";
import { useVideoConfig } from "remotion";

export const ShotDurationCtx = createContext<number | undefined>(undefined);

export const useShotDuration = () => {
  const override = useContext(ShotDurationCtx);
  const { durationInFrames } = useVideoConfig();
  return override ?? durationInFrames;
};

/**
 * Audio offset context — how the scene's local frame 0 relates to its audio.
 *   ao > 0  → visual starts BEFORE audio (visual lead-in / L-cut)
 *   ao < 0  → audio already in progress when visual starts (J-cut)
 *   ao = 0  → simultaneous (hard cut)
 */
export const AudioOffsetCtx = createContext<number>(0);

export const useAudioOffset = () => useContext(AudioOffsetCtx);
