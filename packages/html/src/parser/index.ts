import {Token ,  HTMLTokenizer } from "../tokenizer/index";
import { AST, ASTNode } from "../ast/index";
import { ValidationResult, Validator } from "../validator/index";

/**
 * import { Parser } from "./parser/index";

const htmlInput = `
<html:html>
  <html:head>
    <html:title>Sample HTML6 Document</html:title>
  </html:head>
  <html:body>
    <custom:widget id="main-widget" type="interactive"></custom:widget>
  </html:body>
</html:html>
`;

const parser = new Parser();
const { ast, validationResult } = parser.parse(htmlInput);

if (validationResult.valid) {
  console.log("Valid HTML6 Document.");
} else {
  console.error("Validation Errors:");
  validationResult.errors.forEach((error) => console.error(error));
}

// Optionally, visualize the AST
const astBuilder = new AST();
astBuilder.printAST(ast);

 */
export class Parser {
  private tokenizer: HTMLTokenizer;
  private astBuilder: AST;
  private validator: Validator;

  constructor() {
    this.tokenizer = new HTMLTokenizer("");
    this.astBuilder = new AST();
    this.validator = new Validator();
  }

  public parse(input: string): { ast: ASTNode; validationResult: ValidationResult } {
    // Step 1: Tokenize the input
    this.tokenizer = new HTMLTokenizer(input);
    const tokens = this.tokenizer.tokenize();

    // Step 2: Build the AST with error recovery
    const ast = this.buildASTWithRecovery(tokens);

    // Step 3: Validate the AST
    const validationResult = this.validator.validateAST(ast);

    return { ast, validationResult };
  }

  private buildASTWithRecovery(tokens: Token[]): ASTNode {
    const stack: ASTNode[] = [];
    let root = this.astBuilder.getRoot();
    let currentParent = root;

    for (const token of tokens) {
      try {
        switch (token.type) {
          case "StartTag":
            const elementNode: ASTNode = {
              type: "Element",
              name: token.name,
              attributes: token.attributes,
              children: [],
              parent: currentParent,
            };
            currentParent.children.push(elementNode);
            stack.push(elementNode);
            currentParent = elementNode;
            break;

          case "EndTag":
            if (currentParent.name === token.name) {
              stack.pop();
              currentParent = stack.length > 0 ? stack[stack.length - 1] : root;
            } else {
              throw new Error(`Unmatched end tag: </${token.name}>`);
            }
            break;

          case "Text":
            const textNode: ASTNode = {
              type: "Text",
              value: token.value,
              children: [],
              parent: currentParent,
            };
            currentParent.children.push(textNode);
            break;

          case "Comment":
            const commentNode: ASTNode = {
              type: "Comment",
              value: token.value,
              children: [],
              parent: currentParent,
            };
            currentParent.children.push(commentNode);
            break;

          default:
            throw new Error(`Unsupported token type: ${token.type}`);
        }
      } catch (error) {
        console.error("Error during AST construction:", error.message);
        console.error("Skipping malformed token and continuing...");
      }
    }

    return root;
  }
}

