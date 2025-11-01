#!/bin/bash
echo "🔁 Loading Heritage Condo AI context for Claude..."

read heritage_config/claude_instructions.json
read heritage_config/project_context.md
read heritage_config/TODAY_DEV_PLAN.md

echo "✅ Context successfully loaded into Claude session."
./load_heritage_context.sh