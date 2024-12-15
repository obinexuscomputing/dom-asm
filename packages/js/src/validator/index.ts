import { ASTNode } from "../ast";

export class JSValidator {
  private errors: string[];

  constructor() {
    this.errors = [];
  }

  /**
   * Validates the given AST and returns the list of errors (if any).
   * @param ast The AST to validate.
   * @returns An array of error messages.
   */
  public validate(ast: ASTNode): string[] {
    this.errors = [];
    this.traverse(ast);
    return this.errors;
  }

  /**
   * Traverses the AST and applies validation rules recursively.
   * @param node The current AST node.
   */
  private traverse(node: ASTNode): void {
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

    // Traverse child nodes
    if (node.children) {
      for (const child of node.children) {
        this.traverse(child);
      }
    }
  }

  /**
   * Validates a program node.
   * @param node The program node.
   */
  private validateProgram(node: ASTNode): void {
    if (!node.children || node.children.length === 0) {
      this.errors.push("Program must contain at least one statement.");
    }
  }

  /**
   * Validates a variable declaration node.
   * @param node The variable declaration node.
   */
  private validateVariableDeclaration(node: ASTNode): void {
    const [identifier, value] = node.children;

    if (!identifier || identifier.type !== "Identifier") {
      this.errors.push("VariableDeclaration must have a valid identifier.");
    }

    if (!value || value.type !== "Literal") {
      this.errors.push("VariableDeclaration must have a valid literal value.");
    }
  }

  /**
   * Validates an inline constant node.
   * @param node The inline constant node.
   */
  private validateInlineConstant(node: ASTNode): void {
    if (!node.value) {
      this.errors.push("InlineConstant must have a value.");
    }
  }

  /**
   * Validates an identifier node.
   * @param node The identifier node.
   */
  private validateIdentifier(node: ASTNode): void {
    if (!node.value || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(node.value)) {
      this.errors.push(`Invalid identifier name: ${node.value}`);
    }
  }

  /**
   * Validates a literal node.
   * @param node The literal node.
   */
  private validateLiteral(node: ASTNode): void {
    if (!node.value) {
      this.errors.push("Literal must have a value.");
    }
  }
}
