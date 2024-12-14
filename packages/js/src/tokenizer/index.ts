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

    while (current < input.length) {
      let char = input[current];


      if (
        char === '\n' &&
        this.previousToken &&
        this.previousToken.type !== TokenType.Delimiter &&
        this.previousToken.type !== TokenType.Comment &&
        this.previousToken.type !== TokenType.TemplateLiteral
      ) {
        console.log('ASI triggered after:', this.previousToken);
        addToken(TokenType.Delimiter, ';');
      }

      console.log('ASI Debug:', {
        previousToken: this.previousToken,
        char,
      });
      
      // Handle Whitespace
      if (/\s/.test(char)) {
        if (
          char === '\n' &&
          this.previousToken &&
          this.previousToken.type !== TokenType.Delimiter &&
          this.previousToken.type !== TokenType.Comment &&
          this.previousToken.type !== TokenType.TemplateLiteral &&
          this.previousToken.type !== TokenType.Literal // Prevent ASI after Literal in certain contexts
        ) {
          addToken(TokenType.Delimiter, ';'); // Trigger ASI for valid statement endings
        }
        current++;
        continue;
      }


      // Handle Comments
      if (char === '/') {
        const nextChar = input[current + 1];
        if (nextChar === '/') {
          let comment = '';
          current += 2; // Skip `//`
          while (current < input.length && input[current] !== '\n') {
            comment += input[current++];
          }
          addToken(TokenType.Comment, comment);
          continue;
        } else if (nextChar === '*') {
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
        addToken(TokenType.TemplateLiteral, template); // Set `previousToken` to TemplateLiteral
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


    // Add EOF token
    if (this.previousToken && this.previousToken.type !== TokenType.Delimiter) {
      addToken(TokenType.Delimiter, ';');
    }
    addToken(TokenType.EndOfStatement, 'EOF');

    return tokens;
  }
}
