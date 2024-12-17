
// Example usage:
// const cssInput = `/* Example CSS */
// body {
//   background: white;
//   color: black;
//   color: black;
// }`;

import { ASTNode, ASTBuilder } from "../ast/index";
import { CSSTokenizer, CSSValidator, CSSASTOptimizer } from "../index";



// try {
//   const parser = new Parser(cssInput, true); // Enable validation
//   const ast = parser.parse();
//   console.log("Final AST:", JSON.stringify(ast, null, 2));
// } catch (error) {
//   console.error(error.message);
// }
export class CSSParser {
  private input: string;
  private validate: boolean;

  constructor(input: string, validate: boolean = false) {
    this.input = input;
    this.validate = validate;
  }

  public parse(): ASTNode {
    const tokenizer = new CSSTokenizer(this.input);
    const tokens = tokenizer.tokenize();

    const astBuilder = new ASTBuilder(tokens);
    let ast = astBuilder.buildAST();

    if (this.validate) {
      const validator = new CSSValidator(ast);
      const errors = validator.validate();
      if (errors.length > 0) {
        throw new Error(`Validation errors:\n${errors.join("\n")}`);
      }
    }

    const optimizer = new CSSASTOptimizer(ast);
    ast = optimizer.optimize();

    return ast;
  }
}
