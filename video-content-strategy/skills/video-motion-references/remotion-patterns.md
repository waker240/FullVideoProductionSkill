# Remotion Animation Patterns — Implementation Reference

Code examples and spring configurations for the patterns defined in SKILL.md.

## Spring Presets

```typescript
export const SPRINGS = {
  standard: { damping: 12, stiffness: 100, mass: 1 },
  tension:  { damping: 8,  stiffness: 200, mass: 0.8 },
  resolve:  { damping: 22, stiffness: 40,  mass: 1.2 },
  ambient:  { damping: 30, stiffness: 10,  mass: 2 },
  snap:     { damping: 15, stiffness: 300, mass: 0.5 },  // micro-interactions
} as const;
```

Mass affects feel: lower mass = lighter/snappier, higher mass = heavier/more deliberate. Tension register uses low mass (urgency). Resolve uses high mass (gravity, weight of insight).

## Entry Patterns

### Build-In (with arc motion and squash/stretch)

```typescript
const BuildIn: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  from: { x: number; y: number };
  register?: keyof typeof SPRINGS;
}> = ({ children, startFrame, from, register = 'standard' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - startFrame;

  const progress = spring({
    frame: Math.max(0, elapsed),
    fps,
    config: SPRINGS[register],
  });

  const x = interpolate(progress, [0, 1], [from.x, 0]);
  const y = interpolate(progress, [0, 1], [from.y, 0]);

  // Arc: add vertical parabola to straight-line path
  const arcOffset = Math.sin(progress * Math.PI) * -50;

  // Squash & stretch along movement axis
  const velocity = 1 - progress; // decreasing as element settles
  const stretchAmount = velocity * 0.12;
  const angle = Math.atan2(from.y, from.x);
  const scaleX = 1 + stretchAmount * Math.abs(Math.cos(angle));
  const scaleY = 1 + stretchAmount * Math.abs(Math.sin(angle));

  return (
    <div style={{
      transform: `translate(${x}px, ${y + arcOffset}px) scale(${scaleX}, ${scaleY})`,
      opacity: interpolate(progress, [0, 0.15, 1], [0, 1, 1]),
    }}>
      {children}
    </div>
  );
};
```

### Materialize

```typescript
const progress = spring({ frame: elapsed, fps, config: SPRINGS.standard });

const scale = interpolate(progress, [0, 1], [0, 1]);
const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1]);

// Slight upward drift on materialize adds organic feel
const y = interpolate(progress, [0, 1], [8, 0]);
```

### Draw-On (SVG stroke animation)

```typescript
const DrawOn: React.FC<{
  d: string; // SVG path data
  startFrame: number;
  color: string;
  strokeWidth?: number;
  register?: keyof typeof SPRINGS;
}> = ({ d, startFrame, color, strokeWidth = 2, register = 'standard' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: SPRINGS[register],
  });

  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) setLength(pathRef.current.getTotalLength());
  }, [d]);

  return (
    <svg>
      <path
        ref={pathRef}
        d={d}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
        strokeLinecap="round"
      />
    </svg>
  );
};
```

### Cascade (Stagger Group)

```typescript
const Cascade: React.FC<{
  children: React.ReactNode[];
  startFrame: number;
  staggerFrames?: number;
  register?: keyof typeof SPRINGS;
}> = ({ children, startFrame, staggerFrames = 4, register = 'standard' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {children.map((child, i) => {
        const itemFrame = frame - startFrame - (i * staggerFrames);
        const progress = spring({
          frame: Math.max(0, itemFrame),
          fps,
          config: SPRINGS[register],
        });

        return (
          <div key={i} style={{
            opacity: interpolate(progress, [0, 0.3, 1], [0, 1, 1]),
            transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)
                         scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
          }}>
            {child}
          </div>
        );
      })}
    </>
  );
};
```

### Typewrite

```typescript
const Typewrite: React.FC<{
  text: string;
  startFrame: number;
  framesPerChar?: number;
}> = ({ text, startFrame, framesPerChar = 2 }) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  const charsVisible = Math.min(
    Math.floor(elapsed / framesPerChar),
    text.length
  );

  return (
    <span>
      {text.slice(0, charsVisible)}
      {charsVisible < text.length && (
        <span style={{ opacity: frame % 15 < 8 ? 1 : 0 }}>|</span>
      )}
    </span>
  );
};
```

## Emphasis Patterns

### Pulse

```typescript
const usePulse = (triggerFrame: number, duration = 15) => {
  const frame = useCurrentFrame();
  const elapsed = frame - triggerFrame;
  if (elapsed < 0 || elapsed > duration) return 1;

  // Quick up, smooth down
  const t = elapsed / duration;
  return 1 + 0.08 * Math.sin(t * Math.PI);
};
```

### Isolate (Dim everything except target)

```typescript
const useIsolation = (active: boolean) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: active ? frame : 0,
    fps,
    config: SPRINGS.standard,
  });

  return {
    contextStyle: {
      opacity: interpolate(progress, [0, 1], [1, 0.2]),
      filter: `blur(${interpolate(progress, [0, 1], [0, 2])}px)`,
    },
    targetStyle: {
      opacity: 1,
      filter: 'none',
      zIndex: 10,
    },
  };
};
```

### Color Shift

```typescript
const useColorShift = (
  startFrame: number,
  fromColor: string,
  toColor: string,
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: SPRINGS.resolve, // slow, deliberate color changes
  });

  return interpolateColors(progress, [0, 1], [fromColor, toColor]);
};
```

## Transition Patterns

### Camera (Pan, Zoom, Track)

```typescript
const CameraMove: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  from: { x: number; y: number; scale: number };
  to: { x: number; y: number; scale: number };
  register?: keyof typeof SPRINGS;
}> = ({ children, startFrame, from, to, register = 'standard' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: SPRINGS[register],
  });

  const x = interpolate(progress, [0, 1], [from.x, to.x]);
  const y = interpolate(progress, [0, 1], [from.y, to.y]);
  const scale = interpolate(progress, [0, 1], [from.scale, to.scale]);

  return (
    <div style={{
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      transformOrigin: 'center center',
    }}>
      {children}
    </div>
  );
};
```

### Layout Reflow

```typescript
// Use Remotion's `interpolate` to smoothly move elements between layout positions.
// Define positions as named states, transition between them.

type LayoutState = Record<string, { x: number; y: number; width: number }>;

const useLayoutReflow = (
  fromLayout: LayoutState,
  toLayout: LayoutState,
  startFrame: number,
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: SPRINGS.standard,
  });

  const current: LayoutState = {};
  for (const key of Object.keys(fromLayout)) {
    current[key] = {
      x: interpolate(progress, [0, 1], [fromLayout[key].x, toLayout[key].x]),
      y: interpolate(progress, [0, 1], [fromLayout[key].y, toLayout[key].y]),
      width: interpolate(progress, [0, 1], [fromLayout[key].width, toLayout[key].width]),
    };
  }
  return current;
};
```

## Ambient Patterns

### Particle Drift

```typescript
const ParticleField: React.FC<{
  count?: number;
  color?: string;
}> = ({ count = 30, color = 'rgba(255,255,255,0.06)' }) => {
  const frame = useCurrentFrame();

  // Deterministic positions from index (no Math.random in render)
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      x: (i * 137.508) % 100,         // golden angle distribution
      y: (i * 97.31) % 100,
      size: 2 + (i % 4),
      speed: 0.1 + (i % 5) * 0.05,
      phase: i * 0.7,
    })),
  [count]);

  return (
    <AbsoluteFill>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${(p.y + frame * p.speed * 0.3) % 110 - 5}%`,
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          backgroundColor: color,
          opacity: 0.3 + 0.2 * Math.sin(frame * 0.02 + p.phase),
        }} />
      ))}
    </AbsoluteFill>
  );
};
```

### Breathe (Subtle Scale Oscillation)

```typescript
const useBreathe = (rate = 0.015, amount = 0.02) => {
  const frame = useCurrentFrame();
  return 1 + Math.sin(frame * rate) * amount;
};

// Usage: transform: `scale(${useBreathe()})`
```

## Scene Orchestration

### Sequencing multiple patterns with a timeline

```typescript
type SceneEvent = {
  frame: number;
  action: 'enter' | 'emphasize' | 'exit' | 'transition';
  target: string;
  pattern: string;
  register?: keyof typeof SPRINGS;
};

// Define a scene as a timeline of events:
const buildScene: SceneEvent[] = [
  { frame: 0,  action: 'enter',     target: 'background', pattern: 'emerge' },
  { frame: 15, action: 'enter',     target: 'mainNode',   pattern: 'build-in', register: 'standard' },
  { frame: 45, action: 'enter',     target: 'labels',     pattern: 'cascade' },
  { frame: 60, action: 'enter',     target: 'connections', pattern: 'draw-on' },
  { frame: 90, action: 'emphasize', target: 'mainNode',   pattern: 'pulse' },
];
```

This is a conceptual pattern — implement the timeline reader as a component that maps events to the pattern components above.

## Semantic Color in Motion

```typescript
export const PALETTE = {
  system:  '#a0aec0',
  tension: '#f6ad55',
  insight: '#68d391',
  bg:      '#1a1a2e',
} as const;

// Color transitions should use the resolve register (slow, deliberate):
// system → tension when introducing a problem
// tension → insight when delivering the resolution
// Always via interpolateColors with SPRINGS.resolve
```

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Linear interpolation for spatial motion | Feels robotic, no life | Use spring() or at minimum Easing.bezier |
| Same speed for entry and exit | Exits feel heavy/slow | Exits 40-60% faster than entries |
| All elements animate simultaneously | Eye can't track, reads as chaos | Stagger by 3-6 frames minimum |
| Constant ambient speed | Background feels mechanical | Vary speed with sine waves, different phases per element |
| No hold time after entry | Viewer can't register what appeared | Minimum 500ms (15 frames at 30fps) hold |
| Overshoot on everything | Feels bouncy/cartoony | Reserve overshoot for standard/tension; resolve register has zero |
| Ignoring frame-precision | Animation drifts from narration | Sync key events to exact frame counts from audio markers |
