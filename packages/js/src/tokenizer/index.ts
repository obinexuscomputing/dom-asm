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

  private isValidOperatorChar(char: string): boolean {
    return /[=!<>&|+\-*/%?.]/.test(char);
  }

  private readNumber(input: string, current: number): [string, number] {
    let value = '';
    let hasDot = false;
    let hasExponent = false;

    // Handle initial state
    if (input[current] === '.') {
      if (!/[0-9]/.test(input[current + 1])) {
        throw new Error('Invalid number format');
      }
      value = '.';
      current++;
    }

    // Main number parsing loop
    while (current < input.length) {
      const char = input[current];
      
      if (/[0-9]/.test(char)) {
        value += char;
      } else if (char === '.' && !hasDot && !hasExponent) {
        if (value.length === 0) value = '0';
        value += char;
        hasDot = true;
      } else if ((char === 'e' || char === 'E') && !hasExponent) {
        if (value.length === 0 || !/[0-9]/.test(value[value.length - 1])) break;
        value += char;
        hasExponent = true;
        if (current + 1 < input.length && (input[current + 1] === '+' || input[current + 1] === '-')) {
          value += input[++current];
        }
      } else {
        break;
      }
      current++;
    }

    // Validate final number format
    const hasTrailingE = /[eE][+-]?$/.test(value);
    const multipleDotsMatch = value.match(/\./g);
    const multipleDots = multipleDotsMatch && multipleDotsMatch.length > 1;
    
    if (hasTrailingE || multipleDots) {
      throw new Error('Invalid number format');
    }

    return [value, current];
  }

  tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let current = 0;

    const addToken = (type: TokenType, value: string) => {
      this.previousToken = { type, value };
      tokens.push(this.previousToken);
    };

    while (current < input.length) {
      const char = input[current];

      // Handle Whitespace
      if (/\s/.test(char)) {
        if (char === '\n' && 
            this.previousToken && 
            !['Delimiter', 'Comment', 'TemplateLiteral'].includes(TokenType[this.previousToken.type]) &&
            !(tokens.length > 0 && tokens[tokens.length - 1].type === TokenType.Delimiter && tokens[tokens.length - 1].value === ';')
        ) {
          addToken(TokenType.Delimiter, ';');
        }
        current++;
        continue;
      }

      // Handle Operators
      if (this.isValidOperatorChar(char)) {
        let op = '';
        let maxOp = '';
        let tempCurrent = current;

        while (tempCurrent < input.length && this.isValidOperatorChar(input[tempCurrent])) {
          op += input[tempCurrent];
          if (this.operators.has(op)) {
            maxOp = op;
          }
          tempCurrent++;
        }

        // Special case for arrow syntax
        if (op.startsWith('=') && op.includes('>')) {
          throw new Error('Unexpected character: >');
        }

        if (!maxOp) {
          throw new Error(`Unexpected character: ${input[current]}`);
        }

        current += maxOp.length;
        addToken(TokenType.Operator, maxOp);
        continue;
      }

      // Handle Numbers
      if (/[0-9.]/.test(char)) {
        try {
          const [value, newCurrent] = this.readNumber(input, current);
          current = newCurrent;
          addToken(TokenType.Literal, value);
          continue;
        } catch (e) {
          if (char === '.') {
            throw new Error(`Unexpected character: ${char}`);
          }
          throw e;
        }
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
            value += input.slice(current, current + 2);
            current += 2;
          } else if (input[current] === '$' && input[current + 1] === '{') {
            let braceCount = 1;
            const start = current;
            current += 2; // Skip ${
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

      // Handle Comments
      if (char === '/' && input[current + 1] === '/') {
        let comment = '';
        current += 2; // Skip //
        while (current < input.length && input[current] !== '\n') {
          comment += input[current++];
        }
        addToken(TokenType.Comment, comment);
        continue;
      }

      if (char === '/' && input[current + 1] === '*') {
        let comment = '';
        let depth = 1;
        current += 2; // Skip /*

        while (current < input.length && depth > 0) {
          if (input[current] === '/' && input[current + 1] === '*') {
            comment += '/*';
            depth++;
            current += 2;
          } else if (input[current] === '*' && input[current + 1] === '/') {
            depth--;
            if (depth > 0) comment += '*/';
            current += 2;
          } else {
            comment += input[current++];
          }
        }

        if (depth > 0) {
          throw new Error('Unexpected character: EOF');
        }

        addToken(TokenType.Comment, comment);
        continue;
      }

      // Handle Delimiters
      if (this.singleCharDelimiters.has(char)) {
        addToken(TokenType.Delimiter, char);
        current++;
        continue;
      }

      // Handle Identifiers and Keywords
      if (/[a-zA-Z_$]/.test(char)) {
        let value = '';
        while (current < input.length && /[a-zA-Z0-9_$]/.test(input[current])) {
          value += input[current++];
        }
        const type = this.keywords.has(value) ? TokenType.Keyword : TokenType.Identifier;
        addToken(type, value);
        continue;
      }

      throw new Error(`Unexpected character: ${char}`);
    }

    // Add final semicolon if needed
    if (this.previousToken && 
        !['Delimiter', 'Comment', 'TemplateLiteral'].includes(TokenType[this.previousToken.type]) &&
        !(tokens.length > 0 && tokens[tokens.length - 1].type === TokenType.Delimiter && tokens[tokens.length - 1].value === ';')) {
      addToken(TokenType.Delimiter, ';');
    }

    addToken(TokenType.EndOfStatement, 'EOF');
    return tokens;
  }
}