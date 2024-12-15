
# `@obinexuscomputing/dom-asm` CLI Usage

`@obinexuscomputing/dom-asm` is a Command-Line Interface (CLI) tool designed for parsing, validating, and optimizing CSS, HTML, and JavaScript files.

## Installation

Make sure the package is globally available (or use locally in your project):
```bash
npm install -g @obinexuscomputing/dom-asm
```

---

## Usage

Run the CLI tool using the following command:
```bash
dom-asm [options] [command]
```

### Global Options

| Option         | Description                          |
|----------------|--------------------------------------|
| `-V, --version` | Output the current version of the tool |
| `-h, --help`    | Display help for commands           |

---

## Commands

### CSS Processing

```bash
dom-asm css parse [options] <file>
```

| Option                 | Description                        |
|------------------------|------------------------------------|
| `-o, --optimize`       | Optimize the CSS Abstract Syntax Tree (AST) |
| `-v, --validate`       | Validate the CSS file              |
| `-f, --format <format>` | Output format (`json` or `text`)   |
| `--output <file>`      | Output file (default: stdout)      |
| `-d, --debug`          | Enable debug output                |

#### Example:
```bash
dom-asm css parse --validate --optimize ./styles.css
```

---

### HTML Processing

```bash
dom-asm html parse [options] <file>
```

| Option                 | Description                        |
|------------------------|------------------------------------|
| `-o, --optimize`       | Optimize the HTML Abstract Syntax Tree (AST) |
| `-v, --validate`       | Validate the HTML file             |
| `-f, --format <format>` | Output format (`json` or `text`)   |
| `--output <file>`      | Output file (default: stdout)      |
| `-d, --debug`          | Enable debug output                |

#### Example:
```bash
dom-asm html parse --validate --optimize ./index.html
```

---

### JavaScript Processing

```bash
dom-asm js parse [options] <file>
```

| Option                 | Description                        |
|------------------------|------------------------------------|
| `-o, --optimize`       | Optimize the JavaScript Abstract Syntax Tree (AST) |
| `-v, --validate`       | Validate the JavaScript file       |
| `-f, --format <format>` | Output format (`json` or `text`)   |
| `--output <file>`      | Output file (default: stdout)      |
| `-d, --debug`          | Enable debug output                |

#### Example:
```bash
dom-asm js parse --validate --optimize ./script.js
```

---

## Examples

### Debugging Tokens and AST
To debug the tokens and AST for an HTML file:
```bash
dom-asm html parse --debug ./index.html
```

### Validating and Optimizing a CSS File
To validate and optimize a CSS file:
```bash
dom-asm css parse --validate --optimize ./styles.css
```

### Validating a JavaScript File
To validate a JavaScript file without optimizing:
```bash
dom-asm js parse --validate ./script.js
```

---

## Troubleshooting

If you encounter issues:
1. Ensure you have Node.js version >= 18.0.0 installed.
2. Verify that the `dom-asm` binary is accessible globally if installed globally.

For further assistance, reach out to the developer at: `okpalan@protonmail.com`.
