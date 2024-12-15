import { ASTNode } from "../ast";

export class JSCodeGenerator {
  constructor() {}

  public generate(ast: ASTNode): string {
    if (ast.type === "Program") {
      return ast.children.map((child) => this.generate(child)).join("\n");
    }

    if (ast.type === "VariableDeclaration") {
      const identifier = ast.children.find((child) => child.type === "Identifier");
      const value = ast.children.find((child) => child.type === "Literal");
      return `const ${identifier?.value} = ${value?.value};`;
    }

    return "";
  }
}
