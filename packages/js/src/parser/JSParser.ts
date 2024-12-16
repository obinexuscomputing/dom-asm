import { JSASTNode } from "../ast";


// Define specific node types for better type safety
type NodeType = 
  | "Program"
  | "Statement"
  | "Expression"
  | "VariableDeclaration"
  | "InlineConstant"
  | "BinaryExpression"
  | "Identifier"
  | "Literal"
  | "FunctionDeclaration"
  | "ReturnStatement"
  | "IfStatement"
  | "BlockStatement";

interface TypedJSASTNode extends JSASTNode {
  type: NodeType;
}

export class JSParser {
  parse(ast: TypedJSASTNode): string | string[] | null {
    switch (ast.type) {
      case "Program":
        return this.parseProgram(ast);
      
      case "Statement":
        return this.parseStatement(ast);
      
      case "Expression":
        return this.parseExpression(ast);
      
      case "VariableDeclaration":
        return this.parseVariableDeclaration(ast);
      
      case "InlineConstant":
        return this.parseInlineConstant(ast);
      
      case "BinaryExpression":
        return this.parseBinaryExpression(ast);
      
      case "BlockStatement":
        return this.parseBlockStatement(ast);
      
      case "IfStatement":
        return this.parseIfStatement(ast);
      
      case "FunctionDeclaration":
        return this.parseFunctionDeclaration(ast);
      
      case "ReturnStatement":
        return this.parseReturnStatement(ast);
      
      default:
        return ast.value || null;
    }
  }

  private parseProgram(ast: TypedJSASTNode): string[] {
    return ast.children?.map(child => this.parse(child as TypedJSASTNode))
      .filter((result): result is string => result !== null) || [];
  }

  private parseStatement(ast: TypedJSASTNode): string {
    const childResults = ast.children?.map(child => this.parse(child as TypedJSASTNode))
      .filter((result): result is string => result !== null);
    return `Statement: ${childResults?.join("; ")}`;
  }

  private parseExpression(ast: TypedJSASTNode): string {
    const childResults = ast.children?.map(child => this.parse(child as TypedJSASTNode))
      .filter((result): result is string => result !== null);
    return `Expression: ${childResults?.join(" ")}`;
  }

  private parseVariableDeclaration(ast: TypedJSASTNode): string {
    const childResults = ast.children?.map(child => this.parse(child as TypedJSASTNode))
      .filter((result): result is string => result !== null);
    return `Declare ${childResults?.join(" ")}`;
  }

  private parseInlineConstant(ast: TypedJSASTNode): string {
    return `Inline ${ast.value}`;
  }

  private parseBinaryExpression(ast: TypedJSASTNode): string {
    const leftChild = ast.children?.[0];
    const rightChild = ast.children?.[1];
    const operator = ast.value;

    const left = leftChild ? this.parse(leftChild as TypedJSASTNode) : "";
    const right = rightChild ? this.parse(rightChild as TypedJSASTNode) : "";

    return `(${left} ${operator} ${right})`;
  }

  private parseBlockStatement(ast: TypedJSASTNode): string {
    const childResults = ast.children?.map(child => this.parse(child as TypedJSASTNode))
      .filter((result): result is string => result !== null);
    return `{ ${childResults?.join("; ")} }`;
  }

  private parseIfStatement(ast: TypedJSASTNode): string {
    const [condition, thenBranch, elseBranch] = ast.children || [];
    
    const conditionStr = condition ? this.parse(condition as TypedJSASTNode) : "";
    const thenStr = thenBranch ? this.parse(thenBranch as TypedJSASTNode) : "";
    const elseStr = elseBranch ? this.parse(elseBranch as TypedJSASTNode) : "";

    return `if (${conditionStr}) ${thenStr}${elseStr ? ` else ${elseStr}` : ""}`;
  }

  private parseFunctionDeclaration(ast: TypedJSASTNode): string {
    const name = ast.value;
    const body = ast.children?.[0];
    const bodyStr = body ? this.parse(body as TypedJSASTNode) : "";

    return `function ${name} ${bodyStr}`;
  }

  private parseReturnStatement(ast: TypedJSASTNode): string {
    const expression = ast.children?.[0];
    const exprStr = expression ? this.parse(expression as TypedJSASTNode) : "";

    return `return ${exprStr}`;
  }
}