// dom-css/packages/dom-css/src/ast/index.ts

import { Token } from "../tokenizer";

export type ASTNode = {
  type: string; // e.g., 'stylesheet', 'rule', 'selector', 'declaration', 'value'
  value?: string; // Optional value for the node, e.g., a selector name or property value
  children: ASTNode[]; // Child nodes for nested structures
};


export class ASTBuilder {
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

  private parseStylesheet(): ASTNode {
    const stylesheet: ASTNode = { type: 'stylesheet', children: [] };

    while (this.currentToken()) {
      const rule = this.parseRule();
      if (rule) {
        stylesheet.children.push(rule);
      }
    }

    return stylesheet;
  }

  private parseRule(): ASTNode | null {
    const selector = this.parseSelector();
    if (!selector) return null;

    const rule: ASTNode = { type: 'rule', children: [selector] };

    const token = this.currentToken();
    if (token?.type === 'other' && token.value === '{') {
      this.consumeToken(); // Consume '{'
      const declarations = this.parseDeclarations();
      rule.children.push(...declarations);

      const closingBrace = this.currentToken();
      if (closingBrace?.type === 'other' && closingBrace.value === '}') {
        this.consumeToken(); // Consume '}'
      } else {
        throw new Error(`Unexpected token: expected '}' but found ${closingBrace?.value}`);
      }
    }

    return rule;
  }

  private parseSelector(): ASTNode | null {
    const token = this.currentToken();
    if (token?.type === 'other') {
      this.consumeToken();
      return { type: 'selector', value: token.value, children: [] };
    }
    return null;
  }

  private parseDeclarations(): ASTNode[] {
    const declarations: ASTNode[] = [];

    while (this.currentToken() && this.currentToken()?.value !== '}') {
      const declaration = this.parseDeclaration();
      if (declaration) {
        declarations.push(declaration);
      }
    }

    return declarations;
  }

  private parseDeclaration(): ASTNode | null {
    const property = this.parseProperty();
    if (!property) return null;

    const token = this.currentToken();
    if (token?.type === 'other' && token.value === ':') {
      this.consumeToken(); // Consume ':'
      const value = this.parseValue();

      if (value) {
        const declaration: ASTNode = { type: 'declaration', children: [property, value] };

        const semicolon = this.currentToken();
        if (semicolon?.type === 'other' && semicolon.value === ';') {
          this.consumeToken(); // Consume ';'
        }

        return declaration;
      }
    }

    return null;
  }

  private parseProperty(): ASTNode | null {
    const token = this.currentToken();
    if (token?.type === 'other') {
      this.consumeToken();
      return { type: 'property', value: token.value, children: [] };
    }
    return null;
  }

  private parseValue(): ASTNode | null {
    const token = this.currentToken();
    if (token?.type === 'other') {
      this.consumeToken();
      return { type: 'value', value: token.value, children: [] };
    }
    return null;
  }

  public buildAST(): ASTNode {
    return this.parseStylesheet();
  }
}

// 