# @obinexuscomputing/dom-asm Monorepo

This monorepo contains the packages for the `@obinexuscomputing` suite of tools for automaton state minimization, abstract syntax tree (AST) optimization, and related parsing functionalities. Each package is designed to operate individually or collaboratively within the monorepo ecosystem.

## Packages

### 1. **dom-asm**
- **Description:** Provides tools and a CLI for DOM-based automaton state minimization and AST optimization.
- **Status:** Core functionality implemented.
- **Entry Point:** `index.js`

### 2. **dom-css**
- **Description:** A parser for CSS, facilitating its integration with automaton and AST tools.
- **Status:** In development.
- **Entry Point:** `index.js`

### 3. **dom-html**
- **Description:** A parser for HTML, designed for DOM parsing and optimization tasks.
- **Status:** In development.
- **Entry Point:** `index.js`

### 4. **dom-js**
- **Description:** A future package for JavaScript ASM parsing and DOM manipulation.
- **Status:** Planned.

## Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd dom-asm-monorepo
   ```

2. **Install Dependencies:**
   Use npm to install all dependencies across workspaces.
   ```bash
   npm install
   ```

3. **Build All Packages:**
   Compile all workspaces (if applicable).
   ```bash
   npm run build
   ```

4. **Run Tests:**
   Execute tests across all packages.
   ```bash
   npm test
   ```

5. **Use `dom-asm` CLI:**
   Run the CLI for `dom-asm` directly:
   ```bash
   npx dom-asm --help
   ```

## Monorepo Structure
```
.
├── package.json      # Root configuration for npm workspaces
├── dom-asm/          # Core automaton state minimization package
├── dom-css/          # CSS parsing package
├── dom-html/         # HTML parsing package
├── dom-js/           # Planned JavaScript ASM parsing package
```

## Development Workflow

- **Adding a New Package:**
  Add a folder under the root directory, configure its `package.json`, and include it in the root workspace configuration.

- **Testing Individual Packages:**
  Navigate to the package folder and run:
  ```bash
  npm test
  ```

- **Publishing to npm:**
  Ensure all changes are committed, and then publish using npm CLI:
  ```bash
  npm publish --workspace=@obinexuscomputing/dom-asm
  ```

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request.

## License

This project is licensed under the MIT License.

