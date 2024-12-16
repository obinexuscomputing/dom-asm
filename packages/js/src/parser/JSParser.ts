import { JSToken, JSTokenType } from "../types";
import { JSASTNode, NodeType } from "../types";

export class JSParser {
  private tokens: JSToken[] = [];
  private current: number = 0;

  public parse(tokens: JSToken[]): JSASTNode {
    this.tokens = tokens;
    this.current = 0;

    const ast: JSASTNode = {
      type: NodeType.Program,
      children: [],
    };

    while (this.current < this.tokens.length) {
      const node = this.walk();
      if (node) {
        ast.children?.push(node);
      }
    }

    return ast;
  }

  private walk(): JSASTNode | null {
    const token = this.tokens[this.current];

    if (!token) {
      throw new Error("Unexpected end of input");
    }

    switch (token.type) {
      case JSTokenType.Keyword:
        return this.parseKeyword();

      case JSTokenType.Identifier:
        this.current++;
        return { type: NodeType.Identifier, value: token.value };

      case JSTokenType.Literal:
        this.current++;
        return { type: NodeType.Literal, value: token.value };

      case JSTokenType.Delimiter:
        if (token.value === "{") {
          return this.parseBlockStatement();
        }
        throw new Error(`Unexpected delimiter: ${token.value}`);

      default:
        throw new Error(`Unexpected token type: ${token.type}`);
    }
  }

  private parseKeyword(): JSASTNode {
    const token = this.tokens[this.current];

    switch (token.value) {
      case "const":
      case "let":
      case "var":
        return this.parseVariableDeclaration();

      case "if":
        return this.parseIfStatement();

      case "function":
        return this.parseFunctionDeclaration();

      default:
        throw new Error(`Unexpected keyword: ${token.value}`);
    }
  }

  private parseVariableDeclaration(): JSASTNode {
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

  private parseBlockStatement(): JSASTNode {
    this.current++; // Skip '{'

    const block: JSASTNode = {
      type: NodeType.BlockStatement,
      children: [],
    };

    while (this.current < this.tokens.length && this.tokens[this.current].value !== "}") {
      const statement = this.walk();
      if (statement) {
        block.children?.push(statement);
      }
    }

    if (this.tokens[this.current]?.value !== "}") {
      throw new Error("Expected '}' to close block statement");
    }

    this.current++; // Skip '}'
    return block;
  }

  private parseIfStatement(): JSASTNode {
    this.current++; // Skip 'if'

    if (this.tokens[this.current]?.value !== "(") {
      throw new Error("Expected '(' after 'if'");
    }

    this.current++; // Skip '('
    const condition = this.walk();

    if (this.tokens[this.current]?.value !== ")") {
      throw new Error("Expected ')' after condition");
    }

    this.current++; // Skip ')'
    const consequence = this.walk();

    let alternate: JSASTNode | undefined;
    if (this.tokens[this.current]?.value === "else") {
      this.current++; // Skip 'else'
      alternate = this.walk();
    }

    return {
      type: NodeType.IfStatement,
      children: [condition, consequence, alternate].filter(Boolean) as JSASTNode[],
    };
  }

  private parseFunctionDeclaration(): JSASTNode {
    this.current++; // Skip 'function'

    const identifier = this.tokens[this.current];
    if (!identifier || identifier.type !== JSTokenType.Identifier) {
      throw new Error("Expected function name");
    }

    this.current++;
    if (this.tokens[this.current]?.value !== "(") {
      throw new Error("Expected '(' after function name");
    }

    this.current++; // Skip '('

    const parameters: JSASTNode[] = [];
    while (this.current < this.tokens.length && this.tokens[this.current]?.value !== ")") {
      const param = this.tokens[this.current];
      if (param.type !== JSTokenType.Identifier) {
        throw new Error("Expected parameter identifier");
      }

      parameters.push({ type: NodeType.Identifier, value: param.value });
      this.current++;

      if (this.tokens[this.current]?.value === ",") {
        this.current++; // Skip ','
      }
    }

    if (this.tokens[this.current]?.value !== ")") {
      throw new Error("Expected ')' after parameters");
    }

    this.current++; // Skip ')'
    const body = this.parseBlockStatement();

    return {
      type: NodeType.FunctionDeclaration,
      value: identifier.value,
      children: [...parameters, body],
    };
  }
}
