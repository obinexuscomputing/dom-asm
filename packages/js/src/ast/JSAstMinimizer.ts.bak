import { JSASTNode } from "src/types";
import { NodeType } from "./JSAstNode";

export class JSAstMinimizer {
  private uniqueNodes = new Map<string, JSASTNode>();

  public minimize(ast: JSASTNode): JSASTNode {
    this.uniqueNodes.clear();
    return this.traverse(ast);
  }

  public optimize(ast: JSASTNode): JSASTNode {
    return this.traverse(ast, true);
  }

  private traverse(node: JSASTNode, optimize: boolean = false): JSASTNode {
    const key = `${node.type}:${node.value || ""}`;
    
    if (this.uniqueNodes.has(key)) {
      return this.uniqueNodes.get(key)!;
    }

    const processedNode: JSASTNode = { ...node };

    if (node.children) {
      processedNode.children = node.children.map(child =>
        this.traverse(child, optimize)
      );
    }

    if (optimize) {
      return this.performOptimization(processedNode);
    }

    this.uniqueNodes.set(key, processedNode);
    return processedNode;
  }

  private performOptimization(node: JSASTNode): JSASTNode {
    if (node.type === NodeType.Program) {
      return {
        ...node,
        children: node.children?.map(child => this.simplifyNode(child)) || []
      };
    }

    if (node.type === NodeType.VariableDeclaration && node.children) {
      const [identifier, value] = node.children;
      if (value.type === NodeType.Literal) {
        return {
          type: NodeType.InlineConstant,
          value: `${identifier.value}=${value.value}`,
          children: []
        };
      }
    }

    return node;
  }

  private simplifyNode(node: JSASTNode): JSASTNode {
    if (!Object.values(NodeType).includes(node.type)) {
      return node;
    }
    return node;
  }
}