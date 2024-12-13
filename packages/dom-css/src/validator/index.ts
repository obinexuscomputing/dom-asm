// Example usage:
// import { Tokenizer } from "../tokenizer";
// import { ASTBuilder } from "../ast";

// const cssInput = `/* Example CSS */
// body {
//   background: white;
//   color;
// }`;
// const tokenizer = new Tokenizer(cssInput);
// const tokens = tokenizer.tokenize();
// const astBuilder = new ASTBuilder(tokens);
// const ast = astBuilder.buildAST();

// const validator = new Validator(ast);
// const errors = validator.validate();
// if (errors.length > 0) {
//   console.error("Validation errors:", errors);
// } else {
//   console.log("CSS is valid.");
// }

import { ASTNode } from "../ast";

export class Validator {
  private ast: ASTNode;
  private errors: string[];

  constructor(ast: ASTNode) {
    this.ast = ast;
    this.errors = [];
  }

  private validateStylesheet(node: ASTNode): void {
    if (node.type !== 'stylesheet') {
      this.errors.push(`Invalid root node type: ${node.type}`);
    }

    for (const child of node.children) {
      if (child.type === 'rule') {
        this.validateRule(child);
      } else {
        this.errors.push(`Invalid child node type in stylesheet: ${child.type}`);
      }
    }
  }

  private validateRule(node: ASTNode): void {
    const selector = node.children.find((child) => child.type === 'selector');
    if (!selector || !selector.value) {
      this.errors.push(`Missing or invalid selector in rule.`);
    }

    const declarations = node.children.filter((child) => child.type === 'declaration');
    for (const declaration of declarations) {
      this.validateDeclaration(declaration);
    }
  }

  private validateDeclaration(node: ASTNode): void {
    const property = node.children.find((child) => child.type === 'property');
    const value = node.children.find((child) => child.type === 'value');

    if (!property || !property.value) {
      this.errors.push(`Missing or invalid property in declaration.`);
    }

    if (!value || !value.value) {
      this.errors.push(`Missing or invalid value in declaration.`);
    }
  }

  public validate(): string[] {
    this.validateStylesheet(this.ast);
    return this.errors;
  }
}

