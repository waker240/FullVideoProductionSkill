#!/usr/bin/env bash
# scripts/master.sh — master a narration WAV to broadcast loudness, DURATION-PRESERVING.
# Transparent profile for clean synthetic voice: highpass 80 Hz + transient limiter
# + TWO-PASS LINEAR loudnorm. No compression, no denoise (those "kill" clean TTS).
# Refuses to swap the output in if duration drifts > 0.01s (subtitle/word-lock safety),
# and regenerates the playback mp3 the composition actually plays.
#
#   bash scripts/master.sh assets/voice/narration.wav
#   TARGET_I=-14 TARGET_TP=-1 TARGET_LRA=7 bash scripts/master.sh <in.wav> [out.wav]
#
# Defaults: I=-14 LUFS (YouTube/Bilibili sweet spot), TP=-1 dBTP, LRA=7 (keeps
# dramatic-beat dynamics; tighten toward 5 if delivery feels uneven).
# NOTE: asking for -13 on quiet flat TTS lands ~-14 in transparent mode — that is
# correct, not failure; pushing harder would crush speech peaks.
set -euo pipefail

IN="${1:?usage: master.sh <in.wav> [out.wav]}"
OUT="${2:-$IN}"
I="${TARGET_I:--14}"; TP="${TARGET_TP:--1}"; LRA="${TARGET_LRA:-7}"
CHAIN="highpass=f=80,alimiter=limit=0.7:level=disabled"
TMP="$(mktemp -d)/master.wav"

dur() { ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$1"; }
D0="$(dur "$IN")"

# pass 1 — measure
MEAS=$(ffmpeg -hide_banner -nostats -i "$IN" \
  -af "${CHAIN},loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:print_format=json" -f null - 2>&1 | awk '/^\{/,/^\}/')
gv() { echo "$MEAS" | grep "\"$1\"" | sed -E 's/.*: *"([^"]+)",?/\1/' | xargs; }

# pass 2 — linear apply (duration-preserving)
ffmpeg -hide_banner -y -i "$IN" \
  -af "${CHAIN},loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:measured_I=$(gv input_i):measured_TP=$(gv input_tp):measured_LRA=$(gv input_lra):measured_thresh=$(gv input_thresh):offset=$(gv target_offset):linear=true" \
  -ar 48000 -c:a pcm_s24le "$TMP" -loglevel error

D1="$(dur "$TMP")"
DRIFT=$(node -e "console.log(Math.abs($D0-$D1).toFixed(4))")
if ! node -e "process.exit(Math.abs($D0-$D1)<=0.01?0:1)"; then
  echo "✗ DURATION DRIFT ${DRIFT}s (>0.01) — NOT swapping. Word-lock timing would break." >&2
  exit 1
fi
cp "$TMP" "$OUT"

# the composition plays the MP3 — regenerate it FROM the mastered wav
MP3="${OUT%.wav}.mp3"
ffmpeg -y -i "$OUT" -c:a libmp3lame -b:a 192k "$MP3" -loglevel error

echo "✓ mastered → $OUT (Δdur=${DRIFT}s)  + regenerated $MP3"
ffmpeg -hide_banner -nostats -i "$OUT" -filter_complex ebur128=peak=true -f null - 2>&1 | tail -12 | grep -E "I:|LRA:|Peak:" || true
