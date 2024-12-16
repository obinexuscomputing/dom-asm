

# `@obinexuscomputing/dom-asm` CLI Documentation

The `@obinexuscomputing/dom-asm` Command-Line Interface (CLI) is a powerful tool for parsing, validating, and optimizing CSS, HTML, JavaScript, XML, and ASM files. It provides efficient AST-based analysis and optimization for web and programmatic assets.

---

## Installation

Install the CLI globally to use it anywhere on your system:
```bash
npm install -g @obinexuscomputing/dom-asm
```

Alternatively, you can add it as a local dependency to your project:
```bash
npm install @obinexuscomputing/dom-asm
```

---

## Usage

Run the CLI tool with the following structure:
```bash
dom-asm [options] [command]
```

### Global Options

| Option          | Description                              |
|-----------------|------------------------------------------|
| `-V, --version` | Display the current version of the tool  |
| `-h, --help`    | Display help information for commands    |

---

## Commands

### CSS Processing

The `css` command provides tools for parsing, validating, and optimizing CSS files.

```bash
dom-asm css parse [options] <file>
```

| Option                 | Description                                  |
|------------------------|----------------------------------------------|
| `-o, --optimize`       | Optimize the CSS Abstract Syntax Tree (AST) |
| `-v, --validate`       | Validate the CSS file                       |
| `-f, --format <format>` | Output format (`json` or `text`)             |
| `--output <file>`      | Specify output file (default: stdout)        |
| `-d, --debug`          | Enable debug output                         |

#### Example:
```bash
dom-asm css parse --validate --optimize ./styles.css
```

---

### HTML Processing

The `html` command provides tools for parsing, validating, and optimizing HTML files.

```bash
dom-asm html parse [options] <file>
```

| Option                 | Description                                   |
|------------------------|-----------------------------------------------|
| `-o, --optimize`       | Optimize the HTML Abstract Syntax Tree (AST) |
| `-v, --validate`       | Validate the HTML file                       |
| `-f, --format <format>` | Output format (`json` or `text`)              |
| `--output <file>`      | Specify output file (default: stdout)         |
| `-d, --debug`          | Enable debug output                          |

#### Example:
```bash
dom-asm html parse --validate --optimize ./index.html
```

---

### JavaScript Processing

The `js` command provides tools for parsing, validating, and optimizing JavaScript files.

```bash
dom-asm js parse [options] <file>
```

| Option                 | Description                                      |
|------------------------|--------------------------------------------------|
| `-o, --optimize`       | Optimize the JavaScript Abstract Syntax Tree (AST) |
| `-v, --validate`       | Validate the JavaScript file                    |
| `-f, --format <format>` | Output format (`json` or `text`)                |
| `--output <file>`      | Specify output file (default: stdout)           |
| `-d, --debug`          | Enable debug output                            |

#### Example:
```bash
dom-asm js parse --validate --optimize ./script.js
```

---

### XML Processing

The `xml` command enables parsing, validating, and optimizing XML files.

```bash
dom-asm xml parse [options] <file>
```

| Option                 | Description                                   |
|------------------------|-----------------------------------------------|
| `-o, --optimize`       | Optimize the XML Abstract Syntax Tree (AST)  |
| `-v, --validate`       | Validate the XML file                        |
| `-f, --format <format>` | Output format (`json` or `text`)              |
| `--output <file>`      | Specify output file (default: stdout)         |
| `-d, --debug`          | Enable debug output                          |

#### Example:
```bash
dom-asm xml parse --validate --optimize ./config.xml
```

---

### ASM Processing

The `asm` command is reserved for parsing, validating, and optimizing assembly-like language files. Currently, this feature is under development.

```bash
dom-asm asm parse [options] <file>
```

| Option                 | Description                     |
|------------------------|---------------------------------|
| `-o, --optimize`       | Optimize the ASM AST           |
| `-v, --validate`       | Validate the ASM file          |
| `-f, --format <format>` | Output format (`json` or `text`)|
| `--output <file>`      | Specify output file (default: stdout) |
| `-d, --debug`          | Enable debug output            |

---

## Examples

### Debugging Tokens and AST

Debug the tokens and AST structure for an HTML file:
```bash
dom-asm html parse --debug ./index.html
```

### Validating and Optimizing CSS

Validate and optimize a CSS file:
```bash
dom-asm css parse --validate --optimize ./styles.css
```

### Validating a JavaScript File

Validate a JavaScript file without optimization:
```bash
dom-asm js parse --validate ./script.js
```

### Optimizing XML Metadata

Optimize an XML file and output the results:
```bash
dom-asm xml parse --optimize --output optimized.xml ./config.xml
```

---

## Troubleshooting

### Common Issues
1. **Node.js Version**: Ensure Node.js version >= 18.0.0 is installed.
2. **Binary Accessibility**: If the `dom-asm` binary is not accessible globally, ensure global installation (`npm install -g @obinexuscomputing/dom-asm`).

### Support
If you encounter further issues, reach out via email: `okpalan@protonmail.com`.
