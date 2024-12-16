import { JSASTNode } from "./JSAst";

export class JSASTOptimizer {
  constructor() {}

  public optimize(ast: JSASTNode): JSASTNode {
    function simplify(node: JSASTNode): JSASTNode {
      if (node.type === "Program") {
        return {
          type: "Program",
          children: node.children.map(simplify)
        };
      }

      if (node.type === "VariableDeclaration" && node.children) {
        const identifier = node.children[0];
        const value = node.children[1];
        
        if (value.type === "Literal") {
          return {
            type: "InlineConstant",
            value: `${identifier.value}=${value.value}`,
            children: []
          };
        }
      }

      if (node.children) {
        return {
          ...node,
          children: node.children.map(simplify)
        };
      }

      return node;
    }

    return simplify(ast);
  }
}
