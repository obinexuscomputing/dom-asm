import { ASTNode } from "../ast/index";

export function validateAST(ast: ASTNode): boolean {
  if (ast.type === "Program") {
    return ast.children?.every(validateNode) ?? false;
  }
  return false;
}

function validateNode(node: ASTNode): boolean {
  switch (node.type) {
    case "Literal":
      return typeof node.value === "string";
    case "Block":
      return node.children?.every(validateNode) ?? false;
    default:
      return true; // Extend this with more validation logic
  }
}
