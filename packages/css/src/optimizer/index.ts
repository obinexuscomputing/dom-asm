import { ASTNode } from "../ast";

export class CSSASTOptimizer {
  private ast: ASTNode;

  constructor(ast: ASTNode) {
    this.ast = ast;
  }

  private removeDuplicateDeclarations(node: ASTNode): void {
    if (node.type === 'rule') {
      const declarations = node.children.filter((child) => child.type === 'declaration');
      const uniqueDeclarations: Record<string, ASTNode> = {};

      for (const declaration of declarations) {
        const propertyNode = declaration.children.find((child) => child.type === 'property');
        if (propertyNode && propertyNode.value) {
          uniqueDeclarations[propertyNode.value] = declaration;
        }
      }

      node.children = node.children.filter((child) => child.type !== 'declaration').concat(Object.values(uniqueDeclarations));
    }

    for (const child of node.children) {
      this.removeDuplicateDeclarations(child);
    }
  }

  private mergeAdjacentRules(node: ASTNode): void {
    if (node.type === 'stylesheet') {
      const ruleMap: Record<string, ASTNode> = {};

      node.children = node.children.filter((child) => {
        if (child.type === 'rule') {
          const selector = child.children.find((c) => c.type === 'selector');
          if (selector && selector.value) {
            if (ruleMap[selector.value]) {
              ruleMap[selector.value].children.push(
                ...child.children.filter((c) => c.type === 'declaration')
              );
              return false;
            } else {
              ruleMap[selector.value] = child;
            }
          }
        }
        return true;
      });
    }

    for (const child of node.children) {
      this.mergeAdjacentRules(child);
    }
  }

  public optimize(): ASTNode {
    this.removeDuplicateDeclarations(this.ast);
    this.mergeAdjacentRules(this.ast);
    return this.ast;
  }
}
