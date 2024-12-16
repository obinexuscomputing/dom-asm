import { TypedJSASTNode, NodeType, JSToken, JSASTNode, JSTokenType } from "../types";



export class JSParser {
  public current: number=0;
  public parse(tokens: JSToken[]): JSASTNode {
    this.current = 0;
    const ast: JSASTNode = {
      type: NodeType.Program,
      children: [],
    };

    while (this.current < tokens.length) {
      const node = this.walk(tokens);
      if (node) {
        ast.children?.push(node);
      }
    }

    return ast;
  }

   private parseKeyword(tokens: JSToken[]): JSASTNode {
    const token = tokens[this.current];

    if (token.value === "const" || token.value === "let" || token.value === "var") {
      this.current++;
      const identifier = this.consume(tokens, JSTokenType.Identifier, "Expected identifier after declaration keyword");
      const operator = this.consume(tokens, JSTokenType.Operator, "Expected '=' after identifier");

      if (operator.value !== "=") {
        throw new Error(`Unexpected operator '${operator.value}', expected '='`);
      }

      const valueToken = this.consume(tokens, JSTokenType.Literal, "Expected literal value after '='");
      this.consume(tokens, JSTokenType.Delimiter, "Expected ';' after declaration");

      return {
        type: NodeType.VariableDeclaration,
        value: token.value,
        children: [
          { type: NodeType.Identifier, value: identifier.value },
          { type: NodeType.Literal, value: valueToken.value },
        ],
      };
    }

    throw new Error(`Unexpected keyword: ${token.value}`);
  }
  private walk(tokens: JSToken[]): JSASTNode {
    const token = tokens[this.current];

    if (!token) {
      throw new Error("Unexpected end of input");
    }

    switch (token.type) {
      case JSTokenType.Keyword:
        return this.parseKeyword(tokens);

      case JSTokenType.Identifier:
        return this.parseIdentifier(tokens);

      case JSTokenType.Literal:
        return this.parseLiteral(tokens);

      default:
        throw new Error(`Unexpected token type: ${token.type} at position ${this.current}`);
    }
  }

   private consume(tokens: JSToken[], expectedType: JSTokenType, errorMessage: string): JSToken {
    const token = tokens[this.current];
    if (!token || token.type !== expectedType) {
      throw new Error(`${errorMessage}. Found '${token?.value ?? "end of input"}'`);
    }
    this.current++;
    return token;
  }
  private parseIdentifier(tokens: JSToken[]): JSASTNode {
    const token = tokens[this.current++];
    return { type: NodeType.Identifier, value: token.value };
  }

  private parseLiteral(tokens: JSToken[]): JSASTNode {
    const token = tokens[this.current++];
    return { type: NodeType.Literal, value: token.value };
  }
  
   private parseProgram(node: TypedJSASTNode): string[] {
     return node.children?.map((child) => this.parse(child) as string).filter(Boolean) ?? [];
   }
 
   private parseStatement(node: TypedJSASTNode): string {
     return node.children?.map((child) => this.parse(child)).join("; ") + ";";
   }
 
   private parseExpression(node: TypedJSASTNode): string {
     return node.children?.map((child) => this.parse(child)).join(" ") ?? "";
   }
 
   private parseVariableDeclaration(node: TypedJSASTNode): string {
     const [identifier, value] = node.children ?? [];
     return `${node.value} ${this.parse(identifier as TypedJSASTNode)} = ${this.parse(
       value as TypedJSASTNode
     )};`;
   }
 
   private parseInlineConstant(node: TypedJSASTNode): string {
     return `${node.value}`;
   }
 
   private parseBinaryExpression(node: TypedJSASTNode): string {
     if (node.children?.length === 2) {
       const [left, right] = node.children;
       return `${this.parse(left as TypedJSASTNode)} ${node.value} ${this.parse(right as TypedJSASTNode)}`;
     }
     return "";
   }
 
   private parseBlockStatement(node: TypedJSASTNode): string {
     const body = node.children?.map((child) => this.parse(child)).join("\n");
     return `{\n${body}\n}`;
   }
 
   private parseIfStatement(node: TypedJSASTNode): string {
     const [condition, consequence, alternate] = node.children ?? [];
     const ifPart = `if (${this.parse(condition as TypedJSASTNode)}) ${this.parse(
       consequence as TypedJSASTNode
     )}`;
     const elsePart = alternate ? ` else ${this.parse(alternate as TypedJSASTNode)}` : "";
     return `${ifPart}${elsePart}`;
   }
 
   private parseFunctionDeclaration(node: TypedJSASTNode): string {
     const [identifier, ...paramsAndBody] = node.children ?? [];
     const params = paramsAndBody.slice(0, paramsAndBody.length - 1).map((param) => this.parse(param));
     const body = this.parse(paramsAndBody[paramsAndBody.length - 1] as TypedJSASTNode);
     return `function ${this.parse(identifier as TypedJSASTNode)}(${params.join(", ")}) ${body}`;
   }
 
   private parseReturnStatement(node: TypedJSASTNode): string {
     return `return ${this.parse(node.children?.[0] as TypedJSASTNode)};`;
   }
   
public buildASTFromTokens(tokens: JSToken[]): TypedJSASTNode {
  // Convert tokens into a TypedJSASTNode (mock implementation for illustration)
  return {
    type: NodeType.Program,
    children: tokens.map((token) => ({
      type: NodeType[token.type as keyof typeof NodeType] || NodeType.Literal,
      value: token.value,
      line: token.line,
      column: token.column,
    })),
  } as TypedJSASTNode;
}

}