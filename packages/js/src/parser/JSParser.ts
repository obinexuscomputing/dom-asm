import { JSASTNode } from "../ast";


export type NodeType = 
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

export interface TypedJSASTNode extends JSASTNode {
  type: NodeType;
  value?: string;
  children?: TypedJSASTNode[];
  line?: number;
  column?: number;
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
        return ast.value || "";
    }
  }

  private parseProgram(ast: TypedJSASTNode): string[] {
    return ast.children?.map(child => this.parse(child))
      .filter((result): result is string => result !== null) || [];
  }

  private parseStatement(ast: TypedJSASTNode): string {
    if (ast.value) {
      return ast.value;
    }
    const childResults = ast.children?.map(child => this.parse(child))
      .filter((result): result is string => result !== null);
    return childResults?.length ? 
      `Statement: ${childResults.join("; ")}` : 
      "Statement: ";  // Always include space after colon
  }

  private parseExpression(ast: TypedJSASTNode): string {
    if (ast.value) {
      return ast.value;
    }
    const childResults = ast.children?.map(child => this.parse(child))
      .filter((result): result is string => result !== null);
    return childResults?.length ? 
      `Expression: ${childResults.join(" ")}` : 
      "Expression: ";  // Always include space after colon
  }

  private parseVariableDeclaration(ast: TypedJSASTNode): string {
    const childResults = ast.children?.map(child => this.parse(child))
      .filter((result): result is string => result !== null);
    return `Declare ${childResults?.join(" ") || ""}`.trimEnd();
  }

  private parseInlineConstant(ast: TypedJSASTNode): string {
    return `Inline ${ast.value || ""}`.trimEnd();
  }

  private parseBinaryExpression(ast: TypedJSASTNode): string {
    const leftChild = ast.children?.[0];
    const rightChild = ast.children?.[1];
    const operator = ast.value;

    const left = leftChild ? this.parse(leftChild) : "";
    const right = rightChild ? this.parse(rightChild) : "";

    return `(${left} ${operator} ${right})`.trimEnd();
  }

  private parseBlockStatement(ast: TypedJSASTNode): string {
    const childResults = ast.children?.map(child => this.parse(child))
      .filter((result): result is string => result !== null);
    return `{${childResults?.length ? ' ' + childResults.join("; ") + ' ' : ' '}}`;
  }

  private parseIfStatement(ast: TypedJSASTNode): string {
    const [condition, thenBranch, elseBranch] = ast.children || [];
    
    const conditionStr = condition ? this.parse(condition) : "";
    const thenStr = thenBranch ? this.parse(thenBranch) : "";
    const elseStr = elseBranch ? ` else ${this.parse(elseBranch)}` : "";

    return `if (${conditionStr}) ${thenStr}${elseStr}`;
  }

  private parseFunctionDeclaration(ast: TypedJSASTNode): string {
    const name = ast.value;
    const body = ast.children?.[0];
    const bodyStr = body ? this.parse(body) : "";

    return `function ${name || ""} ${bodyStr}`.trimEnd();
  }

  private parseReturnStatement(ast: TypedJSASTNode): string {
    const expression = ast.children?.[0];
    const exprStr = expression ? this.parse(expression) : "";

    return `return ${exprStr}`.trimEnd();
  }
}