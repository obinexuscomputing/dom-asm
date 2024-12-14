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
  private keywords = new Set(['const', 'let', 'var', 'if', 'else', 'function', 'return', 'for', 'while', 'true', 'false']);
  private operators = new Set(['=', '+', '-', '*', '/', '%', '===', '!==', '<', '>', '&&', '||', '!', '==', '=>', '+=', '-=', '*=', '/=', '||=', '&&=', '??', '?.']);
  private delimiters = new Set([';', '{', '}', '(', ')', '[', ']']);
  private singleCharDelimiters = new Set([';', '{', '}', '(', ')', '[', ']']);
  private previousToken: Token | null = null;

  private isNumericStart(char: string): boolean {
    return /[0-9]/.test(char);
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

    const readNumber = () => {
      let number = '';
      let hasDot = false;

      // Handle leading decimal point
      if (input[current] === '.') {
        if (!/[0-9]/.test(input[current + 1])) {
          throw new Error(`Unexpected character: ${input[current]}`);
        }
        number = '.';
        current++;
      }

      // Read digits before decimal point
      while (current < input.length && /[0-9]/.test(input[current])) {
        number += input[current++];
      }

      // Handle decimal point if not already handled
      if (current < input.length && input[current] === '.' && !hasDot) {
        hasDot = true;
        number += input[current++];
        
        // Read digits after decimal point
        while (current < input.length && /[0-9]/.test(input[current])) {
          number += input[current++];
        }
      }

      // Handle scientific notation
      if (current < input.length && (input[current] === 'e' || input[current] === 'E')) {
        number += input[current++];
        
        if (current < input.length && (input[current] === '+' || input[current] === '-')) {
          number += input[current++];
        }
        
        let hasDigitsAfterE = false;
        while (current < input.length && /[0-9]/.test(input[current])) {
          hasDigitsAfterE = true;
          number += input[current++];
        }
        
        if (!hasDigitsAfterE) {
          throw new Error('Invalid number format');
        }
      }

      // Additional validation
      if (number.endsWith('.')) {
        throw new Error('Invalid number format');
      }

      return number;
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
        let value = '';
        current += 2; // Skip //
        
        while (current < input.length && input[current] !== '\n') {
          value += input[current++];
        }
        
        // Remove any trailing \r
        if (value.endsWith('\r')) {
          value = value.slice(0, -1);
        }
        
        addToken(TokenType.Comment, value);
        continue;
      }

      // Handle Multi-Line Comments
      if (char === '/' && input[current + 1] === '*') {
        let value = '';
        current += 2; // Skip /*
        let depth = 1;
        
        while (current < input.length && depth > 0) {
          if (input[current] === '/' && input[current + 1] === '*') {
            depth++;
            value += '/*';
            current += 2;
          } else if (input[current] === '*' && input[current + 1] === '/') {
            depth--;
            if (depth > 0) {
              value += '*/';
            }
            current += 2;
          } else {
            value += input[current++];
          }
        }

        if (depth > 0) {
          throw new Error('Unexpected character: EOF');
        }

        addToken(TokenType.Comment, value);
        continue;
      }

      // Handle Template Literals
      if (char === '`') {
        let value = '';
        current++; // Skip opening backtick
        
        while (current < input.length && input[current] !== '`') {
          if (input[current] === '\\') {
            const nextChar = input[current + 1];
            if (!['`', '$', '\\'].includes(nextChar)) {
              throw new Error('Invalid escape sequence');
            }
            value += '\\' + nextChar;
            current += 2;
          } else if (input[current] === '$' && input[current + 1] === '{') {
            let braceCount = 1;
            const start = current;
            current += 2;
            while (current < input.length && braceCount > 0) {
              if (input[current] === '{') braceCount++;
              if (input[current] === '}') braceCount--;
              current++;
            }
            value += input.slice(start, current);
          } else {
            value += input[current++];
          }
        }

        if (current >= input.length) {
          throw new Error('Unterminated template literal');
        }
        
        current++; // Skip closing backtick
        addToken(TokenType.TemplateLiteral, value);
        continue;
      }

      // Handle Numbers
      if (this.isNumericStart(char) || (char === '.' && this.isNumericStart(input[current + 1]))) {
        const number = readNumber();
        addToken(TokenType.Literal, number);
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
      let maxOperator = '';
      let tempCurrent = current;
      
      while (tempCurrent < input.length && /[=!<>&|+\-*/%?.]/.test(input[tempCurrent])) {
        operator += input[tempCurrent];
        if (this.operators.has(operator)) {
          maxOperator = operator;
        }
        tempCurrent++;
      }
      
      if (operator.includes('=>') && !this.operators.has(operator)) {
        throw new Error('Unexpected character: >');
      }
      
      if (maxOperator) {
        current += maxOperator.length;
        addToken(TokenType.Operator, maxOperator);
        continue;
      }

      // Handle Keywords and Identifiers
      if (/[a-zA-Z_$]/.test(char)) {
        let identifier = '';
        while (current < input.length && /[a-zA-Z0-9_$]/.test(input[current])) {
          identifier += input[current++];
        }
        
        const type = this.keywords.has(identifier) ? TokenType.Keyword : TokenType.Identifier;
        addToken(type, identifier);
        continue;
      }

      throw new Error(`Unexpected character: ${char}`);
    }

    if (shouldAddSemicolon()) {
      addToken(TokenType.Delimiter, ';');
    }
    addToken(TokenType.EndOfStatement, 'EOF');

    return tokens;
  }
}