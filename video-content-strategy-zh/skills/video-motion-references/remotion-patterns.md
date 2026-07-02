# Remotion 动画模式——实现参考（Remotion Animation Patterns — Implementation Reference）

针对 SKILL.md 中定义的各种模式，本文给出代码示例与弹簧（spring）配置。

## 弹簧预设（Spring Presets）

```typescript
export const SPRINGS = {
  standard: { damping: 12, stiffness: 100, mass: 1 },
  tension:  { damping: 8,  stiffness: 200, mass: 0.8 },
  resolve:  { damping: 22, stiffness: 40,  mass: 1.2 },
  ambient:  { damping: 30, stiffness: 10,  mass: 2 },
  snap:     { damping: 15, stiffness: 300, mass: 0.5 },  // micro-interactions
} as const;
```

质量（mass）影响的是运动的"手感"：质量越小，动作越轻盈、越干脆；质量越大，动作越沉重、越从容。张力（tension）register 使用低质量（营造紧迫感）。化解（resolve）register 使用高质量（营造重力感、洞察的分量感）。

## 入场模式（Entry Patterns）

### 生成入场（Build-In，带弧线运动与挤压/拉伸）

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

### 显影入场（Materialize）

```typescript
const progress = spring({ frame: elapsed, fps, config: SPRINGS.standard });

const scale = interpolate(progress, [0, 1], [0, 1]);
const opacity = interpolate(progress, [0, 0.3, 1], [0, 1, 1]);

// Slight upward drift on materialize adds organic feel
const y = interpolate(progress, [0, 1], [8, 0]);
```

### 描边入场（Draw-On，SVG 描边动画）

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

### 级联入场（Cascade，错峰群组动画）

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

### 打字机入场（Typewrite）

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

## 强调模式（Emphasis Patterns）

### 脉冲（Pulse）

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

### 孤立（Isolate，除目标外全部调暗）

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

### 色彩转换（Color Shift）

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

## 转场模式（Transition Patterns）

### 运镜（Camera，平移、缩放、跟随）

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

### 布局重排（Layout Reflow）

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

## 环境模式（Ambient Patterns）

### 粒子漂浮（Particle Drift）

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

### 呼吸感（Breathe，细微缩放振荡）

```typescript
const useBreathe = (rate = 0.015, amount = 0.02) => {
  const frame = useCurrentFrame();
  return 1 + Math.sin(frame * rate) * amount;
};

// Usage: transform: `scale(${useBreathe()})`
```

## 场景编排（Scene Orchestration）

### 用时间线编排多个模式

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

这是一个概念性模式——请把时间线读取器实现为一个组件，将这些事件映射到上面的各个模式组件。

## 动效中的语义色彩（Semantic Color in Motion）

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

## 常见错误（Common Mistakes）

| 错误 | 问题 | 修正方法 |
|---------|---------|-----|
| 对空间运动使用线性插值（Linear interpolation） | 显得机械、缺乏生命力 | 使用 spring()，或至少使用 Easing.bezier |
| 入场和退场使用相同速度 | 退场显得沉重/迟缓 | 退场速度应比入场快 40%-60% |
| 所有元素同时动画 | 眼睛无法追踪，显得混乱 | 至少错峰 3-6 帧 |
| 环境动画速度恒定 | 背景显得机械 | 用正弦波变化速度，各元素相位不同 |
| 入场后没有停留时间 | 观众来不及注意到出现了什么 | 至少停留 500 毫秒（30fps 下为 15 帧） |
| 所有元素都带过冲（overshoot） | 显得跳脱、卡通化 | 过冲只保留给 standard/tension register；resolve register 应为零过冲 |
| 忽视帧级精度 | 动画会与旁白脱节 | 将关键事件与音频标记的精确帧数同步 |
