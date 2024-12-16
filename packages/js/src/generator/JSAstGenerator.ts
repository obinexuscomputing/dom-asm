import { JSASTNode } from "../ast/";

export class JSAstGenerator {
  public generate(ast: JSASTNode): string {
    if (ast.type === "Program") {
      return ast.children?.map((child: JSASTNode) => this.generate(child)).join("\n") || "";
    }

    if (ast.type === "VariableDeclaration") {
      const identifier = ast.children?.find((child: JSASTNode) => child.type === "Identifier");
      const value = ast.children?.find((child: JSASTNode) => child.type === "Literal");
      return `const ${identifier?.value} = ${value?.value};`;
    }

    if (ast.type === "InlineConstant") {
      return `const ${ast.value};`;
    }

    return ast.value || "";
  }
}