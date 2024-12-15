import { ASTNode } from "../ast";

export class JSASTOptimizer {
  constructor() {}

  public optimize(ast: ASTNode): ASTNode {
    function simplify(node: ASTNode): ASTNode {
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
