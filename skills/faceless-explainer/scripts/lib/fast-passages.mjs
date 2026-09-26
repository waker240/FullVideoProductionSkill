const ID_RE = /^[A-Za-z][A-Za-z0-9_-]{1,63}$/;
const ROLE_ORDER = new Map([
  ["baseline", 0],
  ["compress", 1],
  ["escalate", 2],
  ["peak", 3],
  ["release", 4],
]);
const RELATED_KEYS = [
  "fast_role",
  "fast_entry",
  "fast_exit",
  "fast_bgm_gain",
  "fast_bgm_ramp",
];

const r3 = (value) => Math.round(value * 1000) / 1000;
const clean = (value) => String(value ?? "").trim();
const present = (value) => value !== undefined && value !== null && clean(value) !== "";

function labelFor(frame, index) {
  const number = frame?.number ?? index + 1;
  return `frame ${number}${frame?.title ? ` (${frame.title})` : ""}`;
}

function parseFinite(value, label, errors) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    errors.push(`${label} must be a finite number`);
    return null;
  }
  return number;
}

export function hasFastPassageMarkers(frames) {
  return frames.some((frame) => {
    const extra = frame?.extra || {};
    return present(extra.fast_passage) || RELATED_KEYS.some((key) => present(extra[key]));
  });
}

export function resolveFastPassages(entries) {
  const errors = [];
  const grouped = new Map();
  const cues = [];

  entries.forEach((entry, index) => {
    const frame = entry.frame || {};
    const extra = frame.extra || {};
    const passageId = clean(extra.fast_passage);
    const hasRelated = RELATED_KEYS.some((key) => present(extra[key]));
    const label = labelFor(frame, index);

    if (!passageId) {
      if (hasRelated) errors.push(`${label} has fast-passage fields but no fast_passage id`);
      return;
    }
    if (!ID_RE.test(passageId)) {
      errors.push(`${label} fast_passage must be a safe 2–64 character id`);
      return;
    }

    const role = clean(extra.fast_role).toLowerCase();
    if (role !== "full" && !ROLE_ORDER.has(role)) {
      errors.push(`${label} fast_role must be baseline, compress, escalate, peak, release, or full`);
    }
    const entryReceiver = clean(extra.fast_entry);
    const exitReceiver = clean(extra.fast_exit);
    if (!entryReceiver) errors.push(`${label} in ${passageId} needs fast_entry`);
    if (!exitReceiver) errors.push(`${label} in ${passageId} needs fast_exit`);

    let gain = null;
    let ramp = null;
    if (present(extra.fast_bgm_gain)) {
      gain = parseFinite(extra.fast_bgm_gain, `${label} fast_bgm_gain`, errors);
      if (gain !== null && (gain < 0 || gain > 1)) {
        errors.push(`${label} fast_bgm_gain must be between 0 and 1`);
      }
      if (present(extra.fast_bgm_ramp)) {
        ramp = parseFinite(extra.fast_bgm_ramp, `${label} fast_bgm_ramp`, errors);
        if (ramp !== null && (ramp < 0 || ramp > 10)) {
          errors.push(`${label} fast_bgm_ramp must be between 0 and 10 seconds`);
        }
      } else if (gain !== null) {
        ramp = gain === 0 ? 0.08 : 0.4;
      }
    } else if (present(extra.fast_bgm_ramp)) {
      errors.push(`${label} fast_bgm_ramp requires fast_bgm_gain`);
    }

    const start = Number(entry.start);
    const duration = Number(entry.durationSeconds);
    if (!Number.isFinite(start) || start < 0 || !Number.isFinite(duration) || duration <= 0) {
      errors.push(`${label} needs a resolved nonnegative start and positive synced duration`);
    }

    const sequenceIndex = Number.isInteger(entry.storyIndex)
      ? entry.storyIndex
      : Number.isInteger(frame.index)
        ? frame.index
        : index;
    const item = {
      passageId,
      role,
      index: sequenceIndex,
      frame,
      label,
      start: r3(start),
      end: r3(start + duration),
      duration: r3(duration),
      entryReceiver,
      exitReceiver,
      gain,
      ramp: ramp === null ? null : r3(ramp),
    };
    if (!grouped.has(passageId)) grouped.set(passageId, []);
    grouped.get(passageId).push(item);
    if (gain !== null && gain >= 0 && gain <= 1 && ramp !== null && ramp >= 0 && ramp <= 10) {
      cues.push({ passageId, label, at: item.start, gain: r3(gain), ramp: r3(ramp) });
    }
  });

  const passages = [];
  for (const [id, items] of grouped) {
    for (let i = 1; i < items.length; i++) {
      if (items[i].index !== items[i - 1].index + 1) {
        errors.push(`fast passage ${id} must occupy contiguous storyboard frames`);
        break;
      }
    }

    const full = items.filter((item) => item.role === "full");
    if (full.length) {
      if (items.length !== 1 || full.length !== 1) {
        errors.push(`fast passage ${id}: role full is valid only for one self-contained frame`);
      }
    } else {
      const counts = new Map();
      let priorOrder = -1;
      for (const item of items) {
        const order = ROLE_ORDER.get(item.role);
        if (order !== undefined && order < priorOrder) {
          errors.push(`fast passage ${id}: role order must be baseline → compress/escalate → peak → release`);
          break;
        }
        if (order !== undefined) priorOrder = order;
        counts.set(item.role, (counts.get(item.role) || 0) + 1);
      }
      for (const required of ["baseline", "peak", "release"]) {
        if (counts.get(required) !== 1) {
          errors.push(`fast passage ${id} needs exactly one ${required} frame`);
        }
      }
      if (items[0]?.role !== "baseline") errors.push(`fast passage ${id} must begin with baseline`);
      if (items.at(-1)?.role !== "release") errors.push(`fast passage ${id} must end with release`);
    }

    passages.push({
      id,
      start: items[0]?.start ?? 0,
      end: items.at(-1)?.end ?? 0,
      duration: r3((items.at(-1)?.end ?? 0) - (items[0]?.start ?? 0)),
      items,
    });
  }

  return { passages, cues, errors };
}
