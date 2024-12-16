import { JSASTNode } from "../ast/JSAst";

export class JSParser {
  parse(ast: JSASTNode): any {
    if (ast.type === "Program") {
      return ast.children?.map((child: any) => this.parse(child));
    }

    if (ast.type === "VariableDeclaration") {
      return `Declare ${ast.children
        ?.map((child: any) => this.parse(child))
        .join(" ")}`;
    }

    if (ast.type === "InlineConstant") {
      return `Inline ${ast.value}`;
    }

    return ast.value;
  }
}
