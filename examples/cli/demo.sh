#!/bin/bash
# Full demo script for the CLI
echo "Processing HTML..."
dom-asm html parse --validate --optimize examples/assets/index.html

echo "Processing CSS..."
dom-asm css parse --validate --optimize examples/assets/main.css

echo "Processing JavaScript..."
dom-asm js parse --validate --optimize examples/assets/main.js
