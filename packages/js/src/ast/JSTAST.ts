import { JSToken, JSTokenType } from "../tokenizer/JSTokenizer";

export interface JSASTNode {
  type: string;
  value?: string;
  children?: JSASTNode[];
}

export class JSASTBuilder {
  private tokens: JSToken[];
  private position: number;

  constructor(tokens: JSToken[]) {
    this.tokens = tokens;
    this.position = 0;
  }

  private currentToken(): JSToken | null {
    return this.position < this.tokens.length ? this.tokens[this.position] : null;
  }

  private consumeToken(): JSToken {
    if (this.position >= this.tokens.length) {
      throw new Error('Unexpected end of input');
    }
    return this.tokens[this.position++];
  }

  private peekToken(): JSToken | null {
    return this.position + 1 < this.tokens.length ? this.tokens[this.position + 1] : null;
  }
  private parseProgram(): JSASTNode {
    const program: JSASTNode = { type: "Program", children: [] }; // Ensure children is initialized
    while (this.position < this.tokens.length - 1) { // -1 to exclude EOF
      const statement = this.parseStatement();
      if (statement) {
        program.children!.push(statement); // Use non-null assertion since children is always initialized
      }
    }
    return program;
  }
  
  private parseStatement(): JSASTNode | null {
    const token = this.currentToken();
    
    if (!token) {
      return null;
    }

    if (token.type === JSTokenType.Keyword && token.value === "const") {
      return this.parseVariableDeclaration();
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }

  private parseVariableDeclaration(): JSASTNode {
    this.consumeToken(); // Consume 'const'
    
    const identifier = this.consumeToken();
    if (!identifier || identifier.type !== JSTokenType.Identifier) {
      throw new Error("Expected identifier after 'const'");
    }

    const equals = this.consumeToken();
    if (!equals || equals.type !== JSTokenType.Operator || equals.value !== "=") {
      throw new Error("Expected '=' after identifier");
    }

    const value = this.consumeToken();
    if (!value || value.type !== JSTokenType.Literal) {
      throw new Error("Expected literal value after '='");
    }

    const semicolon = this.consumeToken();
    if (!semicolon || semicolon.type !== JSTokenType.Delimiter || semicolon.value !== ";") {
      throw new Error("Expected ';' after value");
    }

    return {
      type: "VariableDeclaration",
      children: [
        { type: "Identifier", value: identifier.value, children: [] },
        { type: "Literal", value: value.value, children: [] },
      ],
    };
  }

  public buildAST(): JSASTNode {
    return this.parseProgram();
  }
}
