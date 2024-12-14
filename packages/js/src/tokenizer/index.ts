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
  private previousToken: Token | null = null;

  tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let current = 0;

    const addToken = (type: TokenType, value: string) => {
      this.previousToken = { type, value };
      tokens.push(this.previousToken);
    };

    const shouldAddSemicolon = () => {
      return (
        this.previousToken &&
        this.previousToken.type !== TokenType.Delimiter &&
        this.previousToken.type !== TokenType.Comment &&
        this.previousToken.type !== TokenType.TemplateLiteral &&
        !tokens.some(token => 
          token.type === TokenType.Delimiter && 
          token.value === ';' && 
          tokens.indexOf(token) === tokens.length - 1
        )
      );
    };

    while (current < input.length) {
      let char = input[current];

      // Handle Whitespace and ASI
      if (/\s/.test(char)) {
        if (char === '\n' && shouldAddSemicolon()) {
          addToken(TokenType.Delimiter, ';');
        }
        current++;
        continue;
      }

      // Handle Single-Line Comments
      if (char === '/' && input[current + 1] === '/') {
        let comment = '';
        current += 2; // Skip `//`
        while (current < input.length && input[current] !== '\n') {
          comment += input[current++];
        }
        addToken(TokenType.Comment, comment);
        continue;
      }

      // Handle Multi-Line Comments
      if (char === '/' && input[current + 1] === '*') {
        let comment = '';
        current += 2; // Skip `/*`
        let newlines = 0;
        
        while (current < input.length && !(input[current] === '*' && input[current + 1] === '/')) {
          if (input[current] === '\n') {
            newlines++;
            if (newlines === 1) {
              comment += '\n';
            }
          } else if (newlines === 0) {
            comment += input[current];
          } else {
            comment += input[current].trimStart();
          }
          current++;
          if (current >= input.length) {
            throw new Error('Unexpected character: EOF');
          }
        }
        current += 2; // Skip `*/`
        addToken(TokenType.Comment, comment);
        continue;
      }

      // Handle Template Literals
      if (char === '`') {
        let template = '';
        current++; // Skip the opening backtick
        while (current < input.length && input[current] !== '`') {
          if (input[current] === '$' && input[current + 1] === '{') {
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
        if (current >= input.length) {
          throw new Error('Unterminated template literal');
        }
        current++; // Skip the closing backtick
        addToken(TokenType.TemplateLiteral, template);
        continue;
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

      // Handle Keywords and Identifiers
      if (/[a-zA-Z_$]/.test(char)) {
        let identifier = '';
        while (current < input.length && /[a-zA-Z0-9_$]/.test(input[current])) {
          identifier += input[current++];
        }
        addToken(this.keywords.has(identifier) ? TokenType.Keyword : TokenType.Identifier, identifier);
        continue;
      }

      // Handle Literals (Numbers)
      if (/[0-9]/.test(char)) {
        let number = '';
        while (current < input.length && /[0-9.]/.test(input[current])) {
          number += input[current++];
        }
        addToken(TokenType.Literal, number);
        continue;
      }

      throw new Error(`Unexpected character: ${char}`);
    }

    // Add EOF Token
    if (shouldAddSemicolon()) {
      addToken(TokenType.Delimiter, ';');
    }
    addToken(TokenType.EndOfStatement, 'EOF');

    return tokens;
  }
}