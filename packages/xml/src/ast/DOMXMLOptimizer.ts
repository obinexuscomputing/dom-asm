import { DOMXMLAST, DOMXMLASTNode } from '../ast';
// Helper type for optimization process
export interface OptimizationContext {
  stateMap: Map<string, DOMXMLASTNode>;
  equivalenceClasses: Map<number, Set<DOMXMLASTNode>>;
  currentClass: number;
}
export class DOMXMLOptimizer {
  public optimize(ast: DOMXMLAST): DOMXMLAST {
    // Create a new root to avoid modifying the original
    const optimizedRoot = { ...ast.root };
    optimizedRoot.children = this.optimizeChildren(ast.root.children || []);

    return {
      root: optimizedRoot,
      metadata: this.computeMetadata(optimizedRoot),
    };
  }

  private optimizeChildren(children: DOMXMLASTNode[]): DOMXMLASTNode[] {
    // First pass: Remove empty text nodes and elements with no content
    let optimized = children
      .filter((node) => {
        if (node.type === 'Text') {
          return node.value && node.value.trim() !== '';
        }
        if (node.type === 'Element') {
          const hasNonEmptyChildren = (node.children || []).some((child) =>
            child.type === 'Text'
              ? child.value && child.value.trim() !== ''
              : child.type === 'Element'
          );
          return hasNonEmptyChildren || Object.keys(node.attributes || {}).length > 0;
        }
        return true;
      })
      .map((node) => {
        if (node.type === 'Element' && node.children) {
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
        optimized.splice(i + 1, 1);
      } else {
        i++;
      }
    }

    return optimized;
  }

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
