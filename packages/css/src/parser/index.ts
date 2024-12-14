
import { Tokenizer } from "../tokenizer";
import { ASTBuilder } from "../ast";
import { Validator } from "../validator";
import { Optimizer } from "../optimizer";
import { ASTNode } from "../ast";

// Example usage:
// const cssInput = `/* Example CSS */
// body {
//   background: white;
//   color: black;
//   color: black;
// }`;

// try {
//   const parser = new Parser(cssInput, true); // Enable validation
//   const ast = parser.parse();
//   console.log("Final AST:", JSON.stringify(ast, null, 2));
// } catch (error) {
//   console.error(error.message);
// }

export class Parser {
  private input: string;
  private validate: boolean;

  constructor(input: string, validate: boolean = false) {
    this.input = input;
    this.validate = validate;
  }

  public parse(): ASTNode {
    // Step 1: Tokenization
    const tokenizer = new Tokenizer(this.input);
    const tokens = tokenizer.tokenize();

    // Step 2: AST Building
    const astBuilder = new ASTBuilder(tokens);
    let ast = astBuilder.buildAST();

    // Step 3: Validation (optional)
    if (this.validate) {
      const validator = new Validator(ast);
      const errors = validator.validate();
      if (errors.length > 0) {
        throw new Error(`Validation errors:\n${errors.join("\n")}`);
      }
    }

    // Step 4: Optimization
    const optimizer = new Optimizer(ast);
    ast = optimizer.optimize();

    return ast;
  }
}

