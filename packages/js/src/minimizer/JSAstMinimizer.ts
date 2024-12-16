import { JSASTNode } from "../ast/JSAST"; // Import missing type

export class JSAstMinimizer {
  public minimize(ast: JSASTNode): JSASTNode {
    const uniqueNodes = new Map<string, JSASTNode>();

    function traverse(node: JSASTNode): JSASTNode {
      const key = `${node.type}:${node.value || ""}`;
      if (uniqueNodes.has(key)) {
        return uniqueNodes.get(key)!;
      }
      const minimizedNode = { ...node, children: node.children?.map(traverse) };
      uniqueNodes.set(key, minimizedNode);
      return minimizedNode;
    }

    return traverse(ast);
  }
}
