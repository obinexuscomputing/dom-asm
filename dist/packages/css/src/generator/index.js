// dom-css/packages/dom-css/src/generator/index.ts
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
export class CodeGenerator {
    ast;
    constructor(ast) {
        this.ast = ast;
    }
    generateStylesheet(node) {
        return node.children.map((child) => this.generateRule(child)).join("\n");
    }
    generateRule(node) {
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
    generateSelector(node) {
        return node.value || "";
    }
    generateDeclaration(node) {
        const property = node.children.find((child) => child.type === 'property');
        const value = node.children.find((child) => child.type === 'value');
        if (!property || !value) {
            throw new Error("Declaration missing a property or value.");
        }
        return `${property.value}: ${value.value};`;
    }
    generate() {
        if (this.ast.type !== 'stylesheet') {
            throw new Error("AST root node must be of type 'stylesheet'.");
        }
        return this.generateStylesheet(this.ast);
    }
}
// Example usage:
//# sourceMappingURL=index.js.map