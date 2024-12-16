import { JSASTNode } from "../ast/JSAst";

export class JSASTOptimizer {
  constructor() {}

  public optimize(ast: JSASTNode): JSASTNode {
    function simplify(node: JSASTNode): JSASTNode {
      if (node.type === "VariableDeclaration" && node.children) {
        const value = node.children[1];
        if (value.type === "Literal") {
          return {
            type: "InlineConstant",
            value: `${node.children[0].value}=${value.value}`,
            children: [],
          };
        }
      }

      if (node.children) {
        node.children = node.children.map(simplify);
      }

      return node;
    }

    return simplify(ast);
  }
}
