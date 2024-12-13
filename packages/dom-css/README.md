# dom-css Package

The `dom-css` package is a lightweight and efficient library designed to process, validate, and optimize CSS files. It provides a pipeline that parses CSS into an Abstract Syntax Tree (AST) with features like tokenization, validation, and optimization.

## Features

- **Tokenization**: Converts raw CSS input into a stream of tokens.
- **AST Generation**: Builds an Abstract Syntax Tree (AST) to represent the CSS structure.
- **Validation (Optional)**: Validates the AST to ensure syntactic correctness.
- **Optimization**: Minimizes and optimizes the AST by removing redundancies and merging rules.

## Installation

```bash
npm install @obinexuscomputing/dom-css
```

## Usage

### Basic Parsing

The `Parser` class provides the main entry point for the pipeline. Here is an example of how to use it:

```typescript
import { Parser } from "@obinexuscomputing/dom-css";

const cssInput = `/* Example CSS */
body {
  background: white;
  color: black;
  color: black;
}`;

try {
  const parser = new Parser(cssInput, true); // Enable validation
  const ast = parser.parse();
  console.log("Final AST:", JSON.stringify(ast, null, 2));
} catch (error) {
  console.error(error.message);
}
```

### Output Example

Given the input CSS above, the resulting AST (after optimization) would look like:

```json
{
  "type": "stylesheet",
  "children": [
    {
      "type": "rule",
      "children": [
        {
          "type": "selector",
          "value": "body",
          "children": []
        },
        {
          "type": "declaration",
          "children": [
            {
              "type": "property",
              "value": "background",
              "children": []
            },
            {
              "type": "value",
              "value": "white",
              "children": []
            }
          ]
        },
        {
          "type": "declaration",
          "children": [
            {
              "type": "property",
              "value": "color",
              "children": []
            },
            {
              "type": "value",
              "value": "black",
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

## API

### `Parser`

#### Constructor
```typescript
constructor(input: string, validate: boolean = false)
```
- **`input`**: Raw CSS string to be parsed.
- **`validate`**: Whether to validate the CSS. Defaults to `false`.

#### Methods

- **`parse(): ASTNode`**
  - Parses the input CSS into an optimized AST.

### Tokenizer

Handles breaking down the CSS input into tokens for AST generation.

### Validator

Optionally validates the AST for syntactic correctness.

### Optimizer

Optimizes the AST by:
- Removing duplicate declarations.
- Merging adjacent rules with the same selectors.

## Testing

Use `npm run test` to run unit tests and ensure functionality.

## Build

Compile the TypeScript source code using:

```bash
npm run build
```

## Contributing

Feel free to submit issues or contribute enhancements via pull requests.

## License

This project is licensed under the MIT License.
