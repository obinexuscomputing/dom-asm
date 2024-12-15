export enum JSTokenType {
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

export interface JSToken {
  type: JSTokenType;
  value: string;
}

export class JSTokenizer {
  private keywords = new Set(['const', 'let', 'var', 'if', 'else', 'function', 'return', 'for', 'while', 'true', 'false']);
  private operators = new Set(['=', '+', '-', '*', '/', '%', '===', '!==', '<', '>', '&&', '||', '!', '==', '=>', '+=', '-=', '*=', '/=', '||=', '&&=', '??', '?.']);
  private singleCharDelimiters = new Set([';', '{', '}', '(', ')', '[', ']']);
  private previousToken: JSToken | null = null;

  constructor() {}

  public shouldAddSemicolon(tokens: JSToken[]): boolean {
    if (!this.previousToken) {
      return false; // No semicolon should be added if there is no previous token.
    }
  
    return (
      this.previousToken.type !== JSTokenType.Delimiter &&
      !tokens.some(token => token.type === JSTokenType.Delimiter && token.value === ';')
    );
  }
  
  private readOperator(input: string, start: number): [string, number] {
    let operator = '';
    let maxOperator = '';
    let current = start;
  
    while (current < input.length && /[=!<>&|+\-*/%?.]/.test(input[current])) {
      operator += input[current];
      if (this.operators.has(operator)) {
        maxOperator = operator;
      }
      current++;
    }
  
    if (maxOperator) {
      return [maxOperator, maxOperator.length];
    }
  
    // Handle single-character operators like "="
    if (this.operators.has(input[start])) {
      return [input[start], 1];
    }
  
    throw new Error(`Unexpected character: ${input[start]}`);
  }
  

  public tokenize(input: string): JSToken[] {
    const tokens: JSToken[] = [];
    let current = 0;

    const addToken = (type: JSTokenType, value: string) => {
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
        addToken(JSTokenType.Comment, value);
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
        addToken(JSTokenType.Comment, value);
        continue;
      }

      // Handle numbers
      if (/[0-9]/.test(char)) {
        let value = '';
        while (current < input.length && /[0-9.]/.test(input[current])) {
          value += input[current++];
        }
        addToken(JSTokenType.Literal, value);
        continue;
      }

      // Handle keywords and identifiers
      if (/[a-zA-Z_$]/.test(char)) {
        let value = '';
        while (current < input.length && /[a-zA-Z0-9_$]/.test(input[current])) {
          value += input[current++];
        }
        if (this.keywords.has(value)) {
          addToken(JSTokenType.Keyword, value);
        } else {
          addToken(JSTokenType.Identifier, value);
        }
        continue;
      }

      // Handle operators
      const operator = input.slice(current, current + 2);
      if (this.operators.has(operator)) {
        addToken(JSTokenType.Operator, operator);
        current += 2;
        continue;
      }

      // Handle single-character delimiters
      if (this.singleCharDelimiters.has(char)) {
        addToken(JSTokenType.Delimiter, char);
        current++;
        continue;
      }

      throw new Error(`Unexpected character: ${char}`);
    }

    addToken(JSTokenType.EndOfStatement, 'EOF');
    return tokens;
  }
}
