#!/bin/bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
./save_daily_log.sh
git add heritage_logs
git commit -m "chore(logs): snapshot $(date +%F_%H-%M-%S)"
echo "✅ Snapshot committed."
