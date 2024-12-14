export enum TokenType {
  Keyword,
  Identifier,
  Operator,
  Delimiter,
  Literal,
  TemplateLiteral,
  Comment,
  EndOfStatement,
}

export interface Token {
  type: TokenType;
  value: string;
}

export class Tokenizer {
  private keywords = new Set(['const', 'let', 'var', 'if', 'else', 'function', 'return', 'for', 'while']);
  private operators = new Set(['=', '+', '-', '*', '/', '%', '===', '!==', '<', '>', '&&', '||', '!']);
  private delimiters = new Set([';', '{', '}', '(', ')', '[', ']']);
  private singleCharDelimiters = new Set([';', '{', '}', '(', ')', '[', ']']);

  tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let current = 0;

    const addToken = (type: TokenType, value: string) => {
      tokens.push({ type, value });
    };

    while (current < input.length) {
      let char = input[current];

      // Handle Whitespace
      if (/\s/.test(char)) {
        current++;
        continue;
      }

      // Handle Comments
      if (char === '/') {
        const nextChar = input[current + 1];
        if (nextChar === '/') {
          // Single-line comment
          let comment = '';
          current += 2; // Skip `//`
          while (current < input.length && input[current] !== '\n') {
            comment += input[current++];
          }
          addToken(TokenType.Comment, comment);
          continue;
        } else if (nextChar === '*') {
          // Multi-line comment
          let comment = '';
          current += 2; // Skip `/*`
          while (current < input.length && !(input[current] === '*' && input[current + 1] === '/')) {
            comment += input[current++];
          }
          current += 2; // Skip `*/`
          addToken(TokenType.Comment, comment);
          continue;
        }
      }

      // Handle Delimiters
      if (this.singleCharDelimiters.has(char)) {
        addToken(TokenType.Delimiter, char);
        current++;
        continue;
      }

      // Handle Operators
      let operator = '';
      while (this.operators.has(operator + input[current])) {
        operator += input[current++];
      }
      if (operator) {
        addToken(TokenType.Operator, operator);
        continue;
      }

      // Handle Template Literals
      if (char === '`') {
        let template = '';
        current++; // Skip initial `
        while (current < input.length && input[current] !== '`') {
          if (input[current] === '$' && input[current + 1] === '{') {
            // Handle template interpolation
            template += '${';
            current += 2; // Skip `${`
            while (current < input.length && input[current] !== '}') {
              template += input[current++];
            }
            template += '}';
            current++; // Skip `}`
          } else {
            template += input[current++];
          }
        }
        current++; // Skip closing `
        addToken(TokenType.TemplateLiteral, template);
        continue;
      }

      // Handle Keywords and Identifiers
      if (/[a-zA-Z_$]/.test(char)) {
        let identifier = '';
        while (/[a-zA-Z0-9_$]/.test(input[current])) {
          identifier += input[current++];
        }
        addToken(this.keywords.has(identifier) ? TokenType.Keyword : TokenType.Identifier, identifier);
        continue;
      }

      // Handle Literals (Numbers)
      if (/[0-9]/.test(char)) {
        let number = '';
        while (/[0-9.]/.test(input[current])) {
          number += input[current++];
        }
        addToken(TokenType.Literal, number);
        continue;
      }

      // Handle Unexpected Characters
      throw new Error(`Unexpected character: ${char}`);
    }

    // Handle End of File
    addToken(TokenType.EndOfStatement, 'EOF');
    return tokens;
  }
}
