import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import {
  BgDimGrade,
  ChromaticAberration,
  Desaturate,
  Halation,
  RegionDim,
  RegionHold,
  Spotlight,
  type Shape,
} from "./index";
import { BaseScene, Label, PALETTE, SHOT, usePulse } from "./_testHelpers";

/**
 * Tier 1 smoke test — Tone, Mask, Optics atom validation.
 *
 * 8 shots × 150 frames @ 30fps = 40 seconds. Each shot demos one atom on
 * the same BaseScene so visual differences are immediately attributable
 * to the atom under test.
 *
 * See `_testHelpers.tsx` for the shared scaffolding.
 */

const NUM_SHOTS = 8;
export const CINEMATICS_SMOKE_TEST_DURATION = SHOT * NUM_SHOTS;
const TEST_NAME = "CINEMATICS · TIER 1 · TONE / MASK / OPTICS";

const Shot1Baseline: React.FC = () => (
  <>
    <BaseScene />
    <Label testName={TEST_NAME} shotNumber={1} totalShots={NUM_SHOTS} atomName="Baseline" details="no atom — reference frame" />
  </>
);

const Shot2Desaturate: React.FC = () => {
  const amount = usePulse();
  return (
    <>
      <Desaturate amount={amount}>
        <BaseScene />
      </Desaturate>
      <Label testName={TEST_NAME} shotNumber={2} totalShots={NUM_SHOTS} atomName="<Desaturate>" details={`amount: ${amount.toFixed(2)}`} />
    </>
  );
};

const Shot3BgDim: React.FC = () => {
  const intensity = usePulse();
  return (
    <>
      <BgDimGrade intensity={intensity}>
        <BaseScene />
      </BgDimGrade>
      <Label testName={TEST_NAME} shotNumber={3} totalShots={NUM_SHOTS} atomName="<BgDimGrade>" details={`intensity: ${intensity.toFixed(2)}  ·  coolness: 1`} />
    </>
  );
};

const Shot4RegionDim: React.FC = () => {
  const dimAmount = usePulse() * 0.85;
  const region: Shape = { type: "circle", cx: 960, cy: 540, r: 280 };
  return (
    <>
      <BaseScene />
      <RegionDim region={region} dimAmount={dimAmount} />
      <Label testName={TEST_NAME} shotNumber={4} totalShots={NUM_SHOTS} atomName="<RegionDim>" details={`circle r=280  ·  dimAmount: ${dimAmount.toFixed(2)}`} />
    </>
  );
};

const Shot5RegionHold: React.FC = () => {
  const strength = usePulse();
  const region: Shape = {
    type: "rect",
    x: 760,
    y: 480,
    w: 400,
    h: 180,
    cornerRadius: 18,
  };
  return (
    <>
      <RegionHold region={region} effect={{ type: "desat", strength }}>
        <BaseScene />
      </RegionHold>
      <Label testName={TEST_NAME} shotNumber={5} totalShots={NUM_SHOTS} atomName="<RegionHold>" details={`rect 400×180  ·  effect: desat strength=${strength.toFixed(2)}`} />
    </>
  );
};

const Shot6Spotlight: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / SHOT;
  const x = 600 + t * 720;
  const y = 540;
  const intensity = 0.7;
  return (
    <>
      <BaseScene />
      <Spotlight x={x} y={y} radius={260} intensity={intensity} falloff={0.7} />
      <Label testName={TEST_NAME} shotNumber={6} totalShots={NUM_SHOTS} atomName="<Spotlight>" details={`x=${Math.round(x)}, y=${y}  ·  r=260  ·  intensity=${intensity.toFixed(2)}`} />
    </>
  );
};

const Shot7CA: React.FC = () => {
  const amount = usePulse() * 8;
  return (
    <>
      <ChromaticAberration amount={amount}>
        <BaseScene />
      </ChromaticAberration>
      <Label testName={TEST_NAME} shotNumber={7} totalShots={NUM_SHOTS} atomName="<ChromaticAberration>" details={`amount: ${amount.toFixed(2)} px  ·  angle: 0°`} />
    </>
  );
};

const Shot8Halation: React.FC = () => {
  const intensity = usePulse();
  return (
    <>
      <Halation warmth={0.85} intensity={intensity} radius={18}>
        <BaseScene />
      </Halation>
      <Label testName={TEST_NAME} shotNumber={8} totalShots={NUM_SHOTS} atomName="<Halation>" details={`warmth=0.85  ·  intensity=${intensity.toFixed(2)}  ·  radius=18`} />
    </>
  );
};

export const CinematicsSmokeTest: React.FC = () => (
  <AbsoluteFill style={{ background: PALETTE.bg }}>
    <Sequence from={SHOT * 0} durationInFrames={SHOT}><Shot1Baseline /></Sequence>
    <Sequence from={SHOT * 1} durationInFrames={SHOT}><Shot2Desaturate /></Sequence>
    <Sequence from={SHOT * 2} durationInFrames={SHOT}><Shot3BgDim /></Sequence>
    <Sequence from={SHOT * 3} durationInFrames={SHOT}><Shot4RegionDim /></Sequence>
    <Sequence from={SHOT * 4} durationInFrames={SHOT}><Shot5RegionHold /></Sequence>
    <Sequence from={SHOT * 5} durationInFrames={SHOT}><Shot6Spotlight /></Sequence>
    <Sequence from={SHOT * 6} durationInFrames={SHOT}><Shot7CA /></Sequence>
    <Sequence from={SHOT * 7} durationInFrames={SHOT}><Shot8Halation /></Sequence>
  </AbsoluteFill>
);
