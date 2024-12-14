import { ASTNode } from "../ast/index";

export function optimizeAST(ast: ASTNode): ASTNode {
  if (ast.type === "Program") {
    ast.children = ast.children?.map(optimizeNode).filter(Boolean);
  }
  return ast;
}

function optimizeNode(node: ASTNode): ASTNode | null {
  if (node.type === "Block" && (!node.children || node.children.length === 0)) {
    // Remove empty blocks
    return null;
  }
  if (node.type === "Literal") {
    // Example: Simplify numeric literals (e.g., converting string to number)
    node.value = optimizeLiteral(node.value);
  }
  return node;
}

function optimizeLiteral(value: string | undefined): string | undefined {
  if (value && /^\d+$/.test(value)) {
    return String(parseInt(value, 10));
  }
  return value;
}
