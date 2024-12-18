import { JSToken, JSTokenType } from "src/types";
import { JSAstNode, NodeType } from "./JSAstNode";

interface JSASTNode extends JSAstNode {
  minimize(): JSAstNode;
}

// Define the JSAst class
export class JavaScriptAst {
  public root: JSAstNode;

  constructor(root: JSAstNode) {
    this.root = root;
  }

  public minimize(): JavaScriptAst {
    this.root = this.root.minimize();
    return this;
  }

  public static build(tokens: JSToken[]): JavaScriptAst {
    const builder = new JSASTBuilder(tokens);
    const root = builder.buildAST();
    return new JavaScriptAst(root);
  }
}

class JSASTBuilder {
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

  private parseProgram(): JSAstNode {
    const program: JSAstNode = {
      type: NodeType.Program,
      children: [],
      minimize: function (): JSAstNode {
        throw new Error("Function not implemented.");
      }
    };

    while (this.position < this.tokens.length) {
      const statement = this.parseStatement();
      if (statement) {
        program.children!.push(statement);
      }
    }

    return program;
  }

  private parseStatement(): JSAstNode | null {
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
        {
          type: NodeType.Identifier, value: identifier.value, children: [],
          minimize: function (): JSAstNode {
            throw new Error("Function not implemented.");
          }
        },
        { 
          type: NodeType.Literal, 
          value: value.value, 
          children: [], 
          minimize() { return this; } 
        },
      ],
    };
  }

  public buildAST(): JSASTNode {
    return this.parseProgram();
  }
}
