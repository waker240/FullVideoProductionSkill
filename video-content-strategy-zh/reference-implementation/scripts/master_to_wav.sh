#!/usr/bin/env bash
# master_to_wav.sh — transparent mastering chain, PCM .wav output.
# Mirrors master.sh's transparent profile (two-pass linear loudnorm) but
# exports 48k/24-bit PCM .wav instead of AAC, so mastered audio can replace
# an existing .wav without an extra lossy generation.
#
# Usage: ./master_to_wav.sh input.mp3 output.wav

set -euo pipefail

INPUT="${1:?usage: master_to_wav.sh input output.wav}"
OUTPUT="${2:?usage: master_to_wav.sh input output.wav}"

TARGET_I="${TARGET_I:--14}"
TARGET_TP="${TARGET_TP:--1}"
TARGET_LRA="${TARGET_LRA:-5}"

# transparent profile: highpass + transient limiter, no denoise/compression
PREFILTER="highpass=f=80,alimiter=limit=0.7:level=disabled"

echo "==> input:  $INPUT"
echo "==> output: $OUTPUT  (I=${TARGET_I} LUFS, TP=${TARGET_TP} dBTP, LRA=${TARGET_LRA} LU)"

echo "    pass 1/2: measuring..."
MEASURE=$(ffmpeg -hide_banner -nostats -i "$INPUT" \
  -af "${PREFILTER},loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=${TARGET_LRA}:print_format=json" \
  -f null - 2>&1 | awk '/^\{/,/^\}/')

get() { echo "$MEASURE" | grep "\"$1\"" | sed -E 's/.*: *"([^"]+)",?/\1/' | xargs; }
M_I=$(get input_i);  M_TP=$(get input_tp);  M_LRA=$(get input_lra)
M_THRESH=$(get input_thresh);  M_OFFSET=$(get target_offset)

if [[ -z "$M_I" || -z "$M_TP" || -z "$M_LRA" ]]; then
  echo "error: failed to parse loudnorm measurements" >&2; echo "$MEASURE" >&2; exit 1
fi
echo "    measured: I=${M_I} LUFS, TP=${M_TP} dBTP, LRA=${M_LRA} LU"

echo "    pass 2/2: applying + exporting PCM wav..."
ffmpeg -hide_banner -y -i "$INPUT" \
  -af "${PREFILTER},loudnorm=\
I=${TARGET_I}:TP=${TARGET_TP}:LRA=${TARGET_LRA}:\
measured_I=${M_I}:measured_TP=${M_TP}:measured_LRA=${M_LRA}:\
measured_thresh=${M_THRESH}:offset=${M_OFFSET}:\
linear=true:print_format=summary" \
  -ar 48000 -c:a pcm_s24le "$OUTPUT"

echo "==> done: $OUTPUT"
