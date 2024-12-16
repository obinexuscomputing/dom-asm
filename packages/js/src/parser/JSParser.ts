import { JSToken, JSTokenType, TypedJSASTNode } from "../types";
import { JSASTNode, NodeType } from "../types";

export class JSParser {
  private tokens: JSToken[];
  private current: number;

  constructor(tokens: JSToken[]) {
    this.tokens = tokens;
    this.current = 0;
  }

  public parse(): TypedJSASTNode {
    const children: TypedJSASTNode[] = [];

    while (this.current < this.tokens.length) {
      children.push(this.walk());
    }

    return {
      type: NodeType.Program,
      children,
    };
  }
  private walk(): TypedJSASTNode {
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
      default:
        throw new Error(`Unexpected token: ${token.value}`);
    }
  }


  private parseKeyword(): TypedJSASTNode {
    const token = this.tokens[this.current];

    switch (token.value) {
      case "if":
        return this.parseIfStatement();
      case "function":
        return this.parseFunctionDeclaration();
      case "const":
      case "let":
      case "var":
        return this.parseVariableDeclaration();
      default:
        throw new Error(`Unexpected keyword: ${token.value}`);
    }
  }


  private parseVariableDeclaration(): TypedJSASTNode {
    const keyword = this.tokens[this.current];
    this.current++; // Skip 'const', 'let', or 'var'

    const identifier = this.tokens[this.current];
    if (!identifier || identifier.type !== JSTokenType.Identifier) {
      throw new Error("Expected variable name");
    }

    this.current++;
    if (this.tokens[this.current]?.value !== "=") {
      throw new Error("Expected '=' after variable name");
    }

    this.current++; // Skip '='
    const initializer = this.walk();

    if (this.tokens[this.current]?.value !== ";") {
      throw new Error("Expected ';' after variable declaration");
    }

    this.current++; // Skip ';'

    return {
      type: NodeType.VariableDeclaration,
      value: keyword.value,
      children: [
        { type: NodeType.Identifier, value: identifier.value },
        initializer,
      ],
    };
  }

  private parseBlockStatement(): TypedJSASTNode {
    if (this.tokens[this.current]?.value !== "{") {
      throw new Error("Expected '{' to start block statement");
    }

    this.current++; // Skip '{'
    const children: TypedJSASTNode[] = [];

    while (this.tokens[this.current]?.value !== "}") {
      if (this.current >= this.tokens.length) {
        throw new Error("Expected '}' to close block statement");
      }
      children.push(this.walk());
    }

    this.current++; // Skip '}'

    return {
      type: NodeType.BlockStatement,
      children,
    };
  }

private parseIfStatement(): TypedJSASTNode {
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

  let alternate: TypedJSASTNode | undefined;
  if (this.tokens[this.current]?.value === "else") {
    this.current++; // Skip 'else'
    alternate = this.walk();
  }

  return {
    type: NodeType.IfStatement,
    children: [condition, consequence, ...(alternate ? [alternate] : [])],
  };
}

private parseFunctionDeclaration(): TypedJSASTNode {
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

  const parameters: TypedJSASTNode[] = [];
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
