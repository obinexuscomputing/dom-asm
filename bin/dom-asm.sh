#!/bin/bash
# dom-asm.sh - Unix Shell launcher

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Execute the CLI with Node.js
node "$SCRIPT_DIR/../dist/cli/index.js" "$@"
