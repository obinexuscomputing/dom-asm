import { JSToken, JSASTNode, JSTokenType } from "src/types";
import { JSAstNode } from "./JSAstNode";

// Define the JSAst class
export class JSAst {
  public root: JSAstNode;

  constructor(root: JSAstNode) {
    this.root = root;
  }

  public minimize(): JSAst {
    this.root = this.root.minimize();
    return this;
  }
}

// Define the JSAstBuilder class

export class JSASTBuilder {
  private tokens: JSToken[];
  private position: number = 0;

  constructor(tokens: JSToken[]) {
    this.tokens = tokens;
  }

  private currentToken(): JSToken | null {
    return this.tokens[this.position] || null;
  }

  private consumeToken(): JSToken {
    if (this.position >= this.tokens.length) {
      throw new Error('Unexpected end of input');
    }
    return this.tokens[this.position++];
  }

  public peekToken(): JSToken | null {
    return this.tokens[this.position + 1] || null;
  }

  private parseProgram(): JSASTNode {
    const program: JSASTNode = {
      type: NodeType.Program,
      children: []
    };

    while (this.position < this.tokens.length) {
      const statement = this.parseStatement();
      if (statement) {
        program.children!.push(statement);
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

    return null;
  }

  private parseVariableDeclaration(): JSASTNode {
    this.consumeToken(); // consume 'const'
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
      type: NodeType.VariableDeclaration,
      children: [
        { type: NodeType.Identifier, value: identifier.value, children: [] },
        { type: NodeType.Literal, value: value.value, children: [] },
      ],
    };
  }

  public buildAST(): JSASTNode {
    return this.parseProgram();
  }
}

export { JSASTNode };
