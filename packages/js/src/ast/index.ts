export type JSASTNode = {
  type: string;
  value?: string;
  children: JSASTNode[];
};

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
    return this.tokens[this.position++];
  }

  private parseProgram(): JSASTNode {
    const program: JSASTNode = { type: "Program", children: [] };

    while (this.currentToken()) {
      const statement = this.parseStatement();
      if (statement) {
        program.children.push(statement);
      }
    }

    return program;
  }

  private parseStatement(): JSASTNode | null {
    const token = this.currentToken();
    if (token?.type === JSTokenType.Keyword && token.value === "const") {
      return this.parseVariableDeclaration();
    }
    return null;
  }

  private parseVariableDeclaration(): JSASTNode {
    this.consumeToken(); // Consume 'const'
    const identifier = this.consumeToken();
    if (!identifier || identifier.type !== JSTokenType.Identifier) {
      throw new Error("Expected identifier after 'const'");
    }

    const equals = this.consumeToken();
    if (!equals || equals.value !== "=") {
      throw new Error("Expected '=' after identifier");
    }

    const value = this.consumeToken();
    if (!value || value.type !== JSTokenType.Literal) {
      throw new Error("Expected value after '='");
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
