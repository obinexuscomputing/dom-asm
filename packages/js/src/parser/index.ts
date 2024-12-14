import { ASTNode } from "../ast";

export class Parser {
    parse(ast: ASTNode): any {
      // Example: Convert AST into an intermediate representation (IR)
      if (ast.type === 'Program') {
        return ast.children?.map((child) => this.parse(child));
      }
  
      if (ast.type === 'VariableDeclaration') {
        return `Declare ${ast.value} ${ast.children?.map((child) => this.parse(child)).join(' ')}`;
      }
  
      if (ast.type === 'InlineConstant') {
        return `Inline ${ast.value}`;
      }
  
      return ast.value;
    }
  }
  