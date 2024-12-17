
import { ASTNode } from "../ast";

  export class CSSCodeGenerator {
    private ast: ASTNode;
  
    constructor(ast: ASTNode) {
      this.ast = ast;
    }
  
    private generateStylesheet(node: ASTNode): string {
      return node.children.map((child) => this.generateRule(child)).join("\n");
    }
  
    private generateRule(node: ASTNode): string {
      const selector = node.children.find((child) => child.type === 'selector');
      const declarations = node.children.filter((child) => child.type === 'declaration');
  
      if (!selector) {
        throw new Error("Rule missing a selector.");
      }
  
      const selectorText = this.generateSelector(selector);
      const declarationsText = declarations.map((declaration) => this.generateDeclaration(declaration)).join("\n  ");
  
      return `${selectorText} {
    ${declarationsText}
  }`;
    }
  
    private generateSelector(node: ASTNode): string {
      return node.value || "";
    }
  
    private generateDeclaration(node: ASTNode): string {
      const property = node.children.find((child) => child.type === 'property');
      const value = node.children.find((child) => child.type === 'value');
  
      if (!property || !value) {
        throw new Error("Declaration missing a property or value.");
      }
  
      return `${property.value}: ${value.value};`;
    }
  
    public generate(): string {
      if (this.ast.type !== 'stylesheet') {
        throw new Error("AST root node must be of type 'stylesheet'.");
      }
  
      return this.generateStylesheet(this.ast);
    }
  }
  