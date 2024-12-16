import { JSASTNode } from "../ast";

export class JSValidator {
  private errors: string[];

  constructor() {
    this.errors = [];
  }

  public validate(ast: JSASTNode): string[] {
    this.errors = [];
    this.traverse(ast);
    return this.errors;
  }

  private traverse(node: JSASTNode): void {
    switch (node.type) {
      case "Program":
        this.validateProgram(node);
        break;

      case "VariableDeclaration":
        this.validateVariableDeclaration(node);
        break;

      case "InlineConstant":
        this.validateInlineConstant(node);
        break;

      case "Identifier":
        this.validateIdentifier(node);
        break;

      case "Literal":
        this.validateLiteral(node);
        break;

      default:
        this.errors.push(`Unknown node type: ${node.type}`);
    }

    if (node.children) {
      for (const child of node.children) {
        this.traverse(child);
      }
    }
  }

  private validateProgram(node: JSASTNode): void {
    if (!node.children || node.children.length === 0) {
      this.errors.push("Program must contain at least one statement.");
    }
  }

  private validateVariableDeclaration(node: JSASTNode): void {
    // Check if children exist and have at least two elements
    if (!node.children || node.children.length < 2) {
      this.errors.push("Invalid VariableDeclaration: insufficient children.");
      return;
    }
  
    const identifier = node.children[0];
    const value = node.children[1];
  
    if (!identifier || identifier.type !== "Identifier") {
      this.errors.push("VariableDeclaration must have a valid identifier.");
    }
  
    if (!value || value.type !== "Literal") {
      this.errors.push("VariableDeclaration must have a valid literal value.");
    }
  }
  private validateInlineConstant(node: JSASTNode): void {
    if (!node.value) {
      this.errors.push("InlineConstant must have a value.");
    }
  }

  private validateIdentifier(node: JSASTNode): void {
    if (!node.value || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(node.value)) {
      this.errors.push(`Invalid identifier name: ${node.value}`);
    }
  }

  private validateLiteral(node: JSASTNode): void {
    if (!node.value) {
      this.errors.push("Literal must have a value.");
    }
  }
}
