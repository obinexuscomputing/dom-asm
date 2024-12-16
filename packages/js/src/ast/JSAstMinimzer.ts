import { JSASTNode } from "./JSAst";

export class JSAstMinimizer {
  private uniqueNodes = new Map<string, JSASTNode>();

  public minimize(ast: JSASTNode): JSASTNode {
    // Reset unique nodes for each minimize operation
    this.uniqueNodes.clear();

    return this.traverse(ast);
  }

  public optimize(ast: JSASTNode): JSASTNode {
    return this.traverse(ast, true);
  }

  private traverse(node: JSASTNode, optimize: boolean = false): JSASTNode {
    // Generate a unique key for the node
    const key = `${node.type}:${node.value || ""}`;

    // Check for existing unique node
    if (this.uniqueNodes.has(key)) {
      return this.uniqueNodes.get(key)!;
    }

    // Create a new node with processed children
    let processedNode: JSASTNode = { ...node };

    // Optimize and process children if they exist
    if (node.children) {
      processedNode.children = node.children.map((child: any) => 
        this.traverse(child, optimize)
      );
    }

    // Additional optimization steps
    if (optimize) {
      processedNode = this.performOptimization(processedNode);
    }

    // Store and return the processed node
    this.uniqueNodes.set(key, processedNode);
    return processedNode;
  }

  private performOptimization(node: JSASTNode): JSASTNode {
    // Program-level optimization
    if (node.type === "Program") {
      return {
        ...node,
        children: node.children?.map(this.simplifyNode) || []
      };
    }

    // Variable declaration optimization
    if (node.type === "VariableDeclaration" && node.children) {
      const [identifier, value] = node.children;

      if (value.type === "Literal") {
        return {
          type: "InlineConstant",
          value: `${identifier.value}=${value.value}`,
          children: []
        };
      }
    }

    return node;
  }

  private simplifyNode(node: JSASTNode): JSASTNode {
    // Additional node simplification logic
    if (node.type === "EmptyStatement") {
      return node; // Remove or skip empty statements
    }

    // Add more specific node simplification rules as needed
    return node;
  }
}