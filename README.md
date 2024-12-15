# DOM-ASM: Automaton State Minimization and AST Optimization Tool

`DOM-ASM` is a groundbreaking library and command-line tool for automaton state minimization and abstract syntax tree (AST) optimization. Developed through cutting-edge research by Nnamdi Michael Okpala, `DOM-ASM` provides advanced tools for modern web development.

For more details on the research behind `DOM-ASM`, refer to the documentation in the [docs](./docs) folder.

---

## Features

- **Automaton State Minimization**: Efficiently simplifies finite state machines (FSMs) to reduce complexity while preserving behavior.
- **AST Optimization**: Advanced algorithms for optimizing abstract syntax trees.
- **HTML Parsing and Validation**: Robust parsing and validation for HTML documents.
- **CSS Optimization**: AST-based optimization for CSS stylesheets.
- **JavaScript Compilation**: Streamlined JavaScript AST generation and validation.
- **CLI Support**: A powerful command-line interface (`dom-asm`) for automation.
- **Workspace Support**: Modular packages for HTML, CSS, and JavaScript (`@obinexuscomputing/html`, `@obinexuscomputing/css`, `@obinexuscomputing/js`).

---

## Installation

### Using npm

Install the CLI globally:

```bash
npm install -g @obinexuscomputing/dom-asm
```

### Local Development

Clone the repository and set up the workspace:

```bash
git clone https://github.com/obinexuscomputing/dom-asm.git
cd dom-asm
npm install
```

Link the CLI for development:

```bash
npm link
```

---

## Usage

### CLI Commands

#### Build the Project

```bash
dom-asm build
```

Compiles the HTML, CSS, and JavaScript packages into optimized bundles.

#### Validate a File

```bash
dom-asm validate <file>
```

Validates the provided HTML or CSS file.

### Example

```bash
dom-asm validate index.html
```

Output:

```
Validating file: index.html
Validation passed!
```

---

## Development Workflow

### Project Structure

```
project/
├── bin/                # CLI entry point
├── docs/               # Documentation
├── packages/           # Workspace packages (html, css, js)
├── src/                # Core source code
├── rollup.config.js    # Rollup configuration
├── tsconfig.json       # TypeScript configuration
├── turbo.json          # TurboRepo configuration
├── package.json        # Package metadata
└── README.md           # This file
```

### Running Tests

Run unit tests for all packages:

```bash
npm run test
```

---

## Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push your changes:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

Special thanks to the Obinexus Computing team and the groundbreaking research by Nnamdi Michael Okpala that powers this project.

