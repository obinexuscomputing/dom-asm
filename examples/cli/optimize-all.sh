#!/bin/bash
# Validate and optimize all asset types
dom-asm html parse --validate --optimize examples/assets/index.html
dom-asm css parse --validate --optimize examples/assets/main.css
dom-asm js parse --validate --optimize examples/assets/main.js
