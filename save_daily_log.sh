#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
SRC="$ROOT/heritage_config/TODAY_DEV_PLAN.md"
DATESTAMP="$(date +%F)"           # e.g., 2025-10-29
TIMESTAMP="$(date +%F_%H-%M-%S)"  # e.g., 2025-10-29_09-42-10
DEST_DIR="$ROOT/heritage_logs"
DEST_FILE="$DEST_DIR/$DATESTAMP.md"

mkdir -p "$DEST_DIR"

# If today's file doesn't exist, seed it with a header
if [ ! -f "$DEST_FILE" ]; then
  {
    echo "# Heritage Condo – Daily Log ($DATESTAMP)"
    echo
  } > "$DEST_FILE"
fi

{
  echo
  echo "----"
  echo "## Snapshot @ $TIMESTAMP"
  echo
  cat "$SRC"
} >> "$DEST_FILE"

echo "✅ Saved snapshot to $DEST_FILE"
