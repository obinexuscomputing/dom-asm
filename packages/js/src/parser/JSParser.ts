import { TypedJSASTNode, NodeType, JSToken, JSASTNode, JSTokenType } from "../types";



export class JSParser {
  private tokens: JSToken[];
  private current: number;

  constructor() {
    this.tokens = [];
    this.current = 0;
  }
  public parse(tokens: JSToken[]): JSASTNode {
    const ast: JSASTNode = {
      type: NodeType.Program,
      children: [],
    };

    let current = 0;

    const walk = (): JSASTNode => {
      const token = tokens[current];

      if (!token) {
        throw new Error("Unexpected end of input");
      }

      switch (token.type) {
        case JSTokenType.Keyword:
          return this.parseDeclaration();

        case JSTokenType.Identifier:
          current++;
          return { type: NodeType.Identifier, value: token.value };

        case JSTokenType.Literal:
          current++;
          return { type: NodeType.Literal, value: token.value };

        case JSTokenType.Operator:
          return this.parseExpression();

        case JSTokenType.Delimiter:
          if (token.value === ";") {
            current++;
            return { type: NodeType.InlineConstant, value: ";" };
          }
          throw new Error(`Unexpected delimiter: ${token.value}`);

        default:
          throw new Error(`Unexpected token type: ${token.type}`);
      }
    };

    while (current < tokens.length) {
      ast.children?.push(walk());
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

  
  private handleVariableDeclaration(keyword: string): JSASTNode {
    this.current++;
    const identifier = this.tokens[this.current];

    if (!identifier || identifier.type !== JSTokenType.Identifier) {
      throw new Error("Expected identifier after declaration keyword");
    }

    this.current++;
    const operator = this.tokens[this.current];

    if (!operator || operator.value !== "=") {
      throw new Error("Expected '=' after identifier");
    }

    this.current++;
    const valueToken = this.tokens[this.current];

    if (!valueToken || valueToken.type !== JSTokenType.Literal) {
      throw new Error("Expected literal value after '='");
    }

    this.current++;
    if (this.tokens[this.current]?.value !== ";") {
      throw new Error("Expected ';' after declaration");
    }

    this.current++;

    return {
      type: NodeType.VariableDeclaration,
      value: keyword,
      children: [
        { type: NodeType.Identifier, value: identifier.value },
        { type: NodeType.Literal, value: valueToken.value },
      ],
    };
  }
  
  private handleBinaryExpression(): JSASTNode {
    const leftToken = this.tokens[this.current - 1];
    const operatorToken = this.tokens[this.current];
    const rightToken = this.tokens[this.current + 1];

    if (!leftToken || !rightToken || operatorToken.type !== JSTokenType.Operator) {
      throw new Error("Invalid binary expression");
    }

    this.current += 2;

    return {
      type: NodeType.BinaryExpression,
      value: operatorToken.value,
      children: [
        { type: NodeType.Literal, value: leftToken.value },
        { type: NodeType.Literal, value: rightToken.value },
      ],
    };
  }
  
  private handleFunctionDeclaration(): JSASTNode {
    this.current++;
    const identifier = this.tokens[this.current];

    if (!identifier || identifier.type !== JSTokenType.Identifier) {
      throw new Error("Expected identifier after 'function'");
    }

    this.current++;
    if (this.tokens[this.current]?.value !== "(") {
      throw new Error("Expected '(' after function name");
    }

    this.current++;
    const params: JSASTNode[] = [];

    while (this.tokens[this.current]?.value !== ")") {
      const param = this.tokens[this.current];
      if (!param || param.type !== JSTokenType.Identifier) {
        throw new Error("Expected identifier in function parameters");
      }
      params.push({ type: NodeType.Identifier, value: param.value });
      this.current++;
      if (this.tokens[this.current]?.value === ",") {
        this.current++;
      }
    }

    this.current++;
    if (this.tokens[this.current]?.value !== "{") {
      throw new Error("Expected '{' after function parameters");
    }

    this.current++;
    const body: JSASTNode[] = [];
    while (this.tokens[this.current]?.value !== "}") {
      body.push(this.walk()!);
    }

    this.current++;

    return {
      type: NodeType.FunctionDeclaration,
      value: identifier.value,
      children: [...params, ...body],
    };
  }

  private handleKeyword(): JSASTNode {
    const token = this.tokens[this.current];

    if (token.value === "const" || token.value === "let" || token.value === "var") {
      return this.handleVariableDeclaration(token.value);
    }

    if (token.value === "function") {
      return this.handleFunctionDeclaration();
    }

    throw new Error(`Unexpected keyword: ${token.value}`);
  }

  
  
  private walk(): JSASTNode | null {
    const token = this.tokens[this.current];

    if (!token) {
      throw new Error("Unexpected end of input");
    }

    switch (token.type) {
      case JSTokenType.Keyword:
        return this.handleKeyword();

      case JSTokenType.Identifier:
        this.current++;
        return { type: NodeType.Identifier, value: token.value };

      case JSTokenType.Literal:
        this.current++;
        return { type: NodeType.Literal, value: token.value };

      case JSTokenType.Operator:
        return this.handleBinaryExpression();

      case JSTokenType.Delimiter:
        if (token.value === ";") {
          this.current++;
          return null;
        }
        throw new Error(`Unexpected delimiter: ${token.value}`);

      default:
        throw new Error(`Unexpected token type: ${token.type}`);
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
     return node.children?.map((child : TypedJSASTNode) => this.parse(child ) as unknown as string).filter(Boolean) ?? [];
   }
 
   private parseStatement(node: TypedJSASTNode): string {
     return node.children?.map((child) => this.parse(child )).join("; ") + ";";
   }
 
 
   private parseExpression(): JSASTNode {
    const left = this.walkExpression();
    const operator = this.tokens[this.current];
    if (!operator || operator.type !== JSTokenType.Operator) {
      throw new Error(`Expected operator, got: ${operator?.value}`);
    }

    this.current++;
    const right = this.walkExpression();

    return {
      type: NodeType.BinaryExpression,
      value: operator.value,
      children: [left, right],
    };
  }

  private walkExpression(): JSASTNode {
    const token = this.tokens[this.current];
    if (token.type === JSTokenType.Identifier) {
      this.current++;
      return { type: NodeType.Identifier, value: token.value };
    } else if (token.type === JSTokenType.Literal) {
      this.current++;
      return { type: NodeType.Literal, value: token.value };
    } else {
      throw new Error(`Unexpected token in expression: ${token.type}`);
    }
  }
 
   private parseVariableDeclaration(node: TypedJSASTNode): string {
     const [identifier, value] = node.children ?? [];
     return `${node.value} ${this.parse(identifier )} = ${this.parse(
       value
     )};`;
   }
 
   private parseInlineConstant(node: TypedJSASTNode): string {
     return `${node.value}`;
   }
 
   private parseBinaryExpression(node: TypedJSASTNode): string {
     if (node.children?.length === 2) {
       const [left, right] = node.children;
       return `${this.parse(left)} ${node.value} ${this.parse(right )}`;
     }
     return "";
   }
 
   private parseBlockStatement(node: TypedJSASTNode): string {
     const body = node.children?.map((child) => this.parse(child)).join("\n");
     return `{\n${body}\n}`;
   }
 
   private parseIfStatement(node: TypedJSASTNode): string {
     const [condition, consequence, alternate] = node.children ?? [];
     const ifPart = `if (${this.parse(condition)}) ${this.parse(
       consequence
     )}`;
     const elsePart = alternate ? ` else ${this.parse(alternate)}` : "";
     return `${ifPart}${elsePart}`;
   }
 
   private parseFunctionDeclaration(node: TypedJSASTNode): string {
     const [identifier, ...paramsAndBody] = node.children ?? [];
     const params = paramsAndBody.slice(0, paramsAndBody.length - 1).map((param) => this.parse(param));
     const body = this.parse(paramsAndBody[paramsAndBody.length - 1] );
     return `function ${this.parse(identifier )}(${params.join(", ")}) ${body}`;
   }
 
   private parseReturnStatement(node: { children: JSToken[][]; }): string {
     return `return ${this.parse(node.children?.[0] )};`;
   } private parseDeclaration(): JSASTNode {
    const token = this.tokens[this.current];
    if (!["const", "let", "var"].includes(token.value)) {
      throw new Error(`Unexpected keyword: ${token.value}`);
    }

    this.current++;
    const identifier = this.tokens[this.current];
    if (!identifier || identifier.type !== JSTokenType.Identifier) {
      throw new Error("Expected identifier after declaration keyword");
    }

    this.current++;
    const operator = this.tokens[this.current];
    if (!operator || operator.value !== "=") {
      throw new Error("Expected '=' after identifier");
    }

    this.current++;
    const valueToken = this.tokens[this.current];
    if (!valueToken || valueToken.type !== JSTokenType.Literal) {
      throw new Error("Expected literal value after '='");
    }

    this.current++;
    if (this.tokens[this.current]?.value !== ";") {
      throw new Error("Expected ';' after declaration");
    }

    this.current++;

    return {
      type: NodeType.VariableDeclaration,
      value: token.value,
      children: [
        { type: NodeType.Identifier, value: identifier.value },
        { type: NodeType.Literal, value: valueToken.value },
      ],
    };
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