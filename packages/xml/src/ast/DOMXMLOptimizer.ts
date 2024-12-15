import { DOMXMLASTNode } from "./DOMXMLAST";

// Helper type for optimization process
export interface OptimizationContext {
  stateMap: Map<string, DOMXMLASTNode>;
  equivalenceClasses: Map<number, Set<DOMXMLASTNode>>;
  currentClass: number;
}

export class DOMXMLAST {
  root: DOMXMLASTNode;
  metadata?: {
    nodeCount: number;
    elementCount: number;
    textCount: number;
    commentCount: number;
    optimizationMetrics?: {
      originalStateCount: number;
      minimizedStateCount: number;
      reductionPercentage: number;
    };
  };

  constructor(root: DOMXMLASTNode) {
    this.root = root;
    this.metadata = this.computeMetadata();
  }

  /**
   * Compute metadata for the AST, including node counts and element types.
   */
  private computeMetadata(): DOMXMLAST['metadata'] {
    let nodeCount = 0;
    let elementCount = 0;
    let textCount = 0;
    let commentCount = 0;

    const traverse = (node: DOMXMLASTNode, isRoot = false): void => {
      if (!isRoot) {
        nodeCount++;
        switch (node.type) {
          case 'Element':
            elementCount++;
            break;
          case 'Text':
            textCount++;
            break;
          case 'Comment':
            commentCount++;
            break;
        }
      }

      if (node.children) {
        node.children.forEach((child) => traverse(child));
      }
    };

    traverse(this.root, true);

    return {
      nodeCount,
      elementCount,
      textCount,
      commentCount,
    };
  }

  /**
   * Add a new child node to a specific parent node by reference.
   */
  addChildNode(parent: DOMXMLASTNode, child: DOMXMLASTNode): void {
    parent.children = parent.children || [];
    parent.children.push(child);
    this.metadata = this.computeMetadata(); // Update metadata
  }

  /**
   * Remove a child node from a specific parent node by reference.
   */
  removeChildNode(parent: DOMXMLASTNode, child: DOMXMLASTNode): void {
    if (!parent.children) return;
    parent.children = parent.children.filter((c) => c !== child);
    this.metadata = this.computeMetadata(); // Update metadata
  }
}

export class DOMXMLASTOptimizer {
  /**
   * Optimize the given AST by removing redundant nodes, merging text nodes, and recalculating metadata.
   */
  public optimize(ast: DOMXMLAST): DOMXMLAST {
    // Deep clone the root to avoid modifying the original AST
    const optimizedRoot = { ...ast.root };
    optimizedRoot.children = this.optimizeChildren(ast.root.children || []);

    // Recalculate metadata after optimization
    return new DOMXMLAST(optimizedRoot);
  }

  /**
   * Optimize children nodes by removing empty nodes and merging adjacent text nodes.
   */
  private optimizeChildren(children: DOMXMLASTNode[]): DOMXMLASTNode[] {
    // First pass: Filter out empty nodes and optimize children recursively
    let optimized = children
      .filter((node) => {
        if (node.type === 'Text') {
          // Keep non-empty text nodes
          return node.value && node.value.trim() !== '';
        }
        if (node.type === 'Element') {
          // Keep elements with attributes or non-empty children
          const hasNonEmptyChildren = (node.children || []).some((child) =>
            child.type === 'Text'
              ? child.value && child.value.trim() !== ''
              : child.type === 'Element'
          );
          return hasNonEmptyChildren || Object.keys(node.attributes || {}).length > 0;
        }
        // Keep comments and other nodes
        return true;
      })
      .map((node) => {
        if (node.type === 'Element' && node.children) {
          // Optimize children recursively
          return {
            ...node,
            children: this.optimizeChildren(node.children),
          };
        }
        return node;
      });

    // Second pass: Merge adjacent text nodes
    let i = 0;
    while (i < optimized.length - 1) {
      if (optimized[i].type === 'Text' && optimized[i + 1].type === 'Text') {
        optimized[i].value = (optimized[i].value || '') + (optimized[i + 1].value || '');
        optimized.splice(i + 1, 1); // Remove the merged node
      } else {
        i++;
      }
    }

    return optimized;
  }

  /**
   * Compute metadata for the optimized AST, including counts for different node types.
   */
  private computeMetadata(root: DOMXMLASTNode): DOMXMLAST['metadata'] {
    let nodeCount = 0;
    let elementCount = 0;
    let textCount = 0;
    let commentCount = 0;

    const traverse = (node: DOMXMLASTNode, isRoot: boolean = false) => {
      if (!isRoot) {
        nodeCount++;
        switch (node.type) {
          case 'Element':
            elementCount++;
            break;
          case 'Text':
            textCount++;
            break;
          case 'Comment':
            commentCount++;
            break;
        }
      }

      if (node.children) {
        node.children.forEach((child) => traverse(child));
      }
    };

    traverse(root, true);

    return {
      nodeCount,
      elementCount,
      textCount,
      commentCount,
    };
  }
}
