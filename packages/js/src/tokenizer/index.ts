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
  private operators = new Set(['=', '+', '-', '*', '/', '%', '===', '!==', '<', '>', '&&', '||', '!', '==', '=>']);
  private delimiters = new Set([';', '{', '}', '(', ')', '[', ']']);
  private singleCharDelimiters = new Set([';', '{', '}', '(', ')', '[', ']']);
  private previousToken: Token | null = null;

  private isValidOperatorChar(char: string): boolean {
    return /[=!<>&|+\-*/%]/.test(char);
  }

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

    const readOperator = () => {
      let operator = '';
      let tempCurrent = current;
      let maxOperator = '';

      while (tempCurrent < input.length && this.isValidOperatorChar(input[tempCurrent])) {
        operator += input[tempCurrent];
        if (this.operators.has(operator)) {
          maxOperator = operator;
        }
        tempCurrent++;
      }

      if (!maxOperator) {
        throw new Error(`Unexpected character: ${input[current]}`);
      }

      current += maxOperator.length;
      return maxOperator;
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
        let depth = 1;
        
        while (current < input.length && depth > 0) {
          if (input[current] === '/' && input[current + 1] === '*') {
            depth++;
            comment += '/*';
            current += 2;
          } else if (input[current] === '*' && input[current + 1] === '/') {
            depth--;
            if (depth > 0) {
              comment += '*/';
            }
            current += 2;
          } else {
            comment += input[current++];
          }
          
          if (current >= input.length && depth > 0) {
            throw new Error('Unexpected character: EOF');
          }
        }
        addToken(TokenType.Comment, comment);
        continue;
      }

      // Handle Template Literals
      if (char === '`') {
        let template = '';
        current++; // Skip the opening backtick
        let depth = 1;
        
        while (current < input.length && depth > 0) {
          if (input[current] === '`') {
            depth--;
            if (depth > 0) {
              template += '`';
            }
            current++;
          } else if (input[current] === '$' && input[current + 1] === '{') {
            template += '${';
            current += 2;
            let braceDepth = 1;
            while (current < input.length && braceDepth > 0) {
              if (input[current] === '{') braceDepth++;
              if (input[current] === '}') braceDepth--;
              if (braceDepth > 0) template += input[current];
              current++;
            }
            template += '}';
          } else {
            template += input[current++];
          }
        }
        
        if (depth > 0) {
          throw new Error('Unterminated template literal');
        }
        
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
      if (this.isValidOperatorChar(char)) {
        const operator = readOperator();
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