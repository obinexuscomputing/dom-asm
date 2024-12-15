export enum TokenType {
  Keyword,
  Identifier,
  Operator,
  Delimiter,
  Literal,
  TemplateLiteral,
  Comment,
  EndOfStatement,
  Number,
  String,
}

export interface Token {
  type: TokenType;
  value: string;
}

export class JSTokenizer {
  private keywords = new Set(['const', 'let', 'var', 'if', 'else', 'function', 'return', 'for', 'while', 'true', 'false']);
  private operators = new Set(['=', '+', '-', '*', '/', '%', '===', '!==', '<', '>', '&&', '||', '!', '==', '=>', '+=', '-=', '*=', '/=', '||=', '&&=', '??', '?.']);
  private singleCharDelimiters = new Set([';', '{', '}', '(', ')', '[', ']']);
  private previousToken: Token | null = null;

  constructor() {}

  private shouldAddSemicolon(tokens: Token[]): boolean {
    return (
      this.previousToken &&
      this.previousToken.type !== TokenType.Delimiter &&
      !tokens.some(token => token.type === TokenType.Delimiter && token.value === ';')
    );
  }

  public tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let current = 0;

    const addToken = (type: TokenType, value: string) => {
      this.previousToken = { type, value };
      tokens.push(this.previousToken);
    };

    while (current < input.length) {
      const char = input[current];

      // Skip whitespace
      if (/\s/.test(char)) {
        current++;
        continue;
      }

      // Handle single-line comments
      if (char === '/' && input[current + 1] === '/') {
        let value = '';
        current += 2;
        while (current < input.length && input[current] !== '\n') {
          value += input[current++];
        }
        addToken(TokenType.Comment, value);
        continue;
      }

      // Handle multi-line comments
      if (char === '/' && input[current + 1] === '*') {
        let value = '';
        current += 2;
        while (current < input.length && !(input[current] === '*' && input[current + 1] === '/')) {
          value += input[current++];
        }
        current += 2; // Skip closing '*/'
        addToken(TokenType.Comment, value);
        continue;
      }

      // Handle numbers
      if (/[0-9]/.test(char)) {
        let value = '';
        while (current < input.length && /[0-9.]/.test(input[current])) {
          value += input[current++];
        }
        addToken(TokenType.Literal, value);
        continue;
      }

      // Handle keywords and identifiers
      if (/[a-zA-Z_$]/.test(char)) {
        let value = '';
        while (current < input.length && /[a-zA-Z0-9_$]/.test(input[current])) {
          value += input[current++];
        }
        if (this.keywords.has(value)) {
          addToken(TokenType.Keyword, value);
        } else {
          addToken(TokenType.Identifier, value);
        }
        continue;
      }

      // Handle operators
      const operator = input.slice(current, current + 2);
      if (this.operators.has(operator)) {
        addToken(TokenType.Operator, operator);
        current += 2;
        continue;
      }

      // Handle single-character delimiters
      if (this.singleCharDelimiters.has(char)) {
        addToken(TokenType.Delimiter, char);
        current++;
        continue;
      }

      throw new Error(`Unexpected character: ${char}`);
    }

    addToken(TokenType.EndOfStatement, 'EOF');
    return tokens;
  }
}
