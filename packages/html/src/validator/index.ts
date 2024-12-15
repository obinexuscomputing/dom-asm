


/**
 * import { HTMLTokenizer } from "./tokenizer/index";
import { AST } from "./ast/index";
import { Validator } from "./validator/index";

const htmlInput = `
<html:html>
  <html:head>
    <html:title>Sample HTML6 Document</html:title>
  </html:head>
  <html:body>
    <html:media src="logo.png" type="image" />
    <html:p>This is a sample document.</html:p>
    <invalid:tag>Oops!</invalid:tag>
  </html:body>
</html:html>
`;

const tokenizer = new HTMLTokenizer(htmlInput);
const tokens = tokenizer.tokenize();

const astBuilder = new AST();
const ast = astBuilder.buildAST(tokens);

const validator = new Validator();
const validationResult = validator.validateAST(ast);

if (validationResult.valid) {
  console.log("The document is valid.");
} else {
  console.error("Validation errors:");
  validationResult.errors.forEach((error) => console.error(error));
}

 */

import { HTMLASTNode } from "../parser";

export interface HTMLValidationResult {
  valid: boolean;
  errors: string[];
}

export class HTMLValidator {
  public validate(ast: HTMLASTNode): HTMLValidationResult {
    const errors: string[] = [];
    this.traverse(ast, errors);
    return { valid: errors.length === 0, errors };
  }

  private traverse(node: HTMLASTNode, errors: string[]): void {
    if (node.type === "Element") {
      if (!node.name.match(/^[a-zA-Z0-9\-]+$/)) {
        errors.push(`Invalid tag name: ${node.name}`);
      }
      for (const child of node.children) {
        this.traverse(child, errors);
      }
    }
  }
}
