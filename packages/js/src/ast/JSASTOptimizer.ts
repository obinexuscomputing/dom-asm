import { JSASTNode } from "./JSASTNode"; // Use correct import path
export class JSASTOptimizer {
  constructor() {}
  public optimize(ast: JSASTNode): JSASTNode {
    function simplify(node: JSASTNode): JSASTNode {
      if (node.type === "Program") {
        return {
          type: "Program",
          children: node.children?.map(simplify) || [] // Add null check
        };
      }
  
      if (node.type === "VariableDeclaration" && node.children) {
        const [identifier, value] = node.children; // Destructure safely
  
        if (value.type === "Literal") {
          return {
            type: "InlineConstant",
            value: `${identifier.value}=${value.value}`, // Fix template literal syntax
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
