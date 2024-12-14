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

  private isValidNumber(value: string): boolean {
    const decimalPoints = (value.match(/\./g) || []).length;
    if (decimalPoints > 1) return false;

    if (/[eE]/.test(value)) {
      const parts = value.split(/[eE]/);
      if (parts.length !== 2) return false;
      
      const [base, exponent] = parts;
      if (!this.isValidNumber(base)) return false;
      
      const cleanExponent = exponent.replace(/^[+-]/, '');
      if (!/^\d+$/.test(cleanExponent)) return false;
    }

    return true;
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
      let hasExponent = false;

      if (input[current] === '.') {
        if (!/[0-9]/.test(input[current + 1])) {
          throw new Error(`Unexpected character: ${input[current]}`);
        }
        number = '.';
        current++;
      }

      while (current < input.length) {
        const char = input[current];
        const nextChar = input[current + 1];

        if (/[0-9]/.test(char)) {
          number += char;
        } else if (char === '.' && !hasDot && !hasExponent) {
          hasDot = true;
          number += char;
        } else if ((char === 'e' || char === 'E') && !hasExponent) {
          hasExponent = true;
          number += char;
          if (nextChar === '+' || nextChar === '-') {
            number += nextChar;
            current++;
          }
        } else if (char === '.' && hasDot) {
          throw new Error('Invalid number format');
        } else {
          break;
        }
        current++;
      }

      if (!this.isValidNumber(number)) {
        throw new Error('Invalid number format');
      }

      return number;
    };

    while (current < input.length) {
      let char = input[current];

      if (/\s/.test(char)) {
        if (char === '\n' && shouldAddSemicolon()) {
          addToken(TokenType.Delimiter, ';');
        }
        current++;
        continue;
      }

      if (char === '/' && input[current + 1] === '/') {
        let value = '';
        current += 2;
        
        while (current < input.length && input[current] !== '\n') {
          value += input[current++];
        }
        
        if (value.endsWith('\r')) {
          value = value.slice(0, -1);
        }
        
        addToken(TokenType.Comment, value);
        continue;
      }

      if (char === '/' && input[current + 1] === '*') {
        let value = '';
        current += 2;
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

      if (char === '`') {
        let value = '';
        current++;
        
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
        
        current++;
        addToken(TokenType.TemplateLiteral, value);
        continue;
      }

      if (this.isNumericStart(char) || (char === '.' && this.isNumericStart(input[current + 1]))) {
        const number = readNumber();
        addToken(TokenType.Literal, number);
        continue;
      }

      if (this.singleCharDelimiters.has(char)) {
        addToken(TokenType.Delimiter, char);
        current++;
        continue;
      }

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
  let value = '';
  while (current < input.length && /[a-zA-Z0-9_$]/.test(input[current])) {
    value += input[current++];
  }

  if (value === 'true' || value === 'false') {
    // Treat boolean literals as literals, not keywords
    addToken(TokenType.Literal, value);
  } else {
    const type = this.keywords.has(value) ? TokenType.Keyword : TokenType.Identifier;
    addToken(type, value);
  }
  continue;
}
    }
    if (shouldAddSemicolon()) {
      addToken(TokenType.Delimiter, ';');
    }
    addToken(TokenType.EndOfStatement, 'EOF');

    return tokens;
  }
}