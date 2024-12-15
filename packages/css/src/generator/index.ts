
import { ASTNode } from "../ast";

/**
 * import { Tokenizer } from "../tokenizer";
import { ASTBuilder } from "../ast";
import { Optimizer } from "../optimizer";

const cssInput = `/* Example CSS \*\/
body {
    background: white;
    color: black;
    color: black;
  }
  
  const tokenizer = new Tokenizer(cssInput);
  const tokens = tokenizer.tokenize();
  const astBuilder = new ASTBuilder(tokens);
  let ast = astBuilder.buildAST();
  
  const optimizer = new Optimizer(ast);
  ast = optimizer.optimize();
  
  const generator = new CodeGenerator(ast);
  const cssOutput = generator.generate();
  
  console.log(cssOutput);
  **/
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
  