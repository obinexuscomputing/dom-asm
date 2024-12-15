// Import the Token type from the tokenizer module
import { Token, TokenType } from "../tokenizer";

export type ASTNode = {
  type: string; // e.g., 'Program', 'VariableDeclaration', 'InlineConstant', etc.
  value?: string; // Optional value for the node, e.g., a variable name or constant value
  children: ASTNode[]; // Child nodes for nested structures
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
    const token = this.currentToken();
    if (token) this.position++;
    return token!;
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

    if (token?.type === TokenType.Literal) {
      return this.parseInlineConstant();
    }

    return null;
  }

  private parseVariableDeclaration(): ASTNode {
    this.consumeToken(); // Consume 'const'
    const identifier = this.currentToken();
    if (!identifier || identifier.type !== TokenType.Identifier) {
      throw new Error("Expected identifier after 'const'");
    }
    this.consumeToken();

    const equals = this.currentToken();
    if (!equals || equals.value !== "=") {
      throw new Error("Expected '=' after identifier");
    }
    this.consumeToken();

    const value = this.parseValue();
    if (!value) {
      throw new Error("Expected value after '='");
    }

    return {
      type: "VariableDeclaration",
      children: [
        { type: "Identifier", value: identifier.value, children: [] },
        value,
      ],
    };
  }

  private parseInlineConstant(): ASTNode {
    const token = this.consumeToken();
    return { type: "InlineConstant", value: token.value, children: [] };
  }

  private parseValue(): ASTNode | null {
    const token = this.currentToken();

    if (token?.type === TokenType.Literal) {
      return this.parseInlineConstant();
    }

    return null;
  }

  public buildAST(): ASTNode {
    return this.parseProgram();
  }
}
