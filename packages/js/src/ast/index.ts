import { Token, TokenType } from "./JSTokenizer";

export type ASTNode = {
  type: string;
  value?: string;
  children: ASTNode[];
};

export class JSASTBuilder {
  private tokens: Token[];
  private position: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.position = 0;
  }

  private currentToken(): Token | null {
    return this.position < this.tokens.length ? this.tokens[this.position] : null;
  }

  private consumeToken(): Token {
    return this.tokens[this.position++];
  }

  private parseProgram(): ASTNode {
    const program: ASTNode = { type: "Program", children: [] };

    while (this.currentToken()) {
      const statement = this.parseStatement();
      if (statement) {
        program.children.push(statement);
      }
    }

    return program;
  }

  private parseStatement(): ASTNode | null {
    const token = this.currentToken();
    if (token?.type === TokenType.Keyword && token.value === "const") {
      return this.parseVariableDeclaration();
    }
    return null;
  }

  private parseVariableDeclaration(): ASTNode {
    this.consumeToken(); // Consume 'const'
    const identifier = this.consumeToken();
    if (!identifier || identifier.type !== TokenType.Identifier) {
      throw new Error("Expected identifier after 'const'");
    }

    const equals = this.consumeToken();
    if (!equals || equals.value !== "=") {
      throw new Error("Expected '=' after identifier");
    }

    const value = this.consumeToken();
    if (!value || value.type !== TokenType.Literal) {
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

  public buildAST(): ASTNode {
    return this.parseProgram();
  }
}
