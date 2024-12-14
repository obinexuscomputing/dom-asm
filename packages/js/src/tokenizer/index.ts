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
      let hasE = false;

      // Handle leading decimal point
      if (input[current] === '.') {
        if (!/[0-9]/.test(input[current + 1])) {
          throw new Error(`Unexpected character: ${input[current]}`);
        }
        number = '0.';
        current++;
      }

      while (current < input.length) {
        const char = input[current];

        if (/[0-9]/.test(char)) {
          number += char;
        } else if (char === '.' && !hasDot) {
          if (hasE) {
            break;
          }
          hasDot = true;
          number += char;
        } else if ((char === 'e' || char === 'E') && !hasE) {
          const next = input[current + 1];
          if (!number.length || !/[0-9]/.test(number[number.length - 1])) {
            break;
          }
          hasE = true;
          number += char;
          if (next === '+' || next === '-') {
            number += next;
            current++;
          }
        } else {
          break;
        }
        current++;
      }

      if (number.endsWith('e') || number.endsWith('E') || number.endsWith('+') || number.endsWith('-') || number.endsWith('.')) {
        throw new Error('Invalid number format');
      }

      return number;
    };

    const readOperator = () => {
      let operator = '';
      let maxOperator = '';
      let tempCurrent = current;

      while (tempCurrent < input.length && this.isValidOperatorChar(input[tempCurrent])) {
        operator += input[tempCurrent];
        if (this.operators.has(operator)) {
          maxOperator = operator;
        }
        tempCurrent++;
      }

      if (!maxOperator) {
        const lookahead = input.slice(current, current + 3);
        if (lookahead === '==>' || lookahead.startsWith('>>')) {
          throw new Error(`Unexpected character: >`);
        }
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
        current += 2;
        while (current < input.length && input[current] !== '\n') {
          comment += input[current++];
        }
        addToken(TokenType.Comment, comment);
        continue;
      }

      // Handle Multi-Line Comments
      if (char === '/' && input[current + 1] === '*') {
        let comment = '';
        current += 2;
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
        current++;
        
        while (current < input.length && input[current] !== '`') {
          if (input[current] === '\\') {
            const next = input[current + 1];
            if (next !== '`' && next !== '$' && next !== '\\') {
              throw new Error('Invalid escape sequence');
            }
            template += input[current] + next;
            current += 2;
          } else if (input[current] === '$' && input[current + 1] === '{') {
            template += '${';
            current += 2;
            let braceCount = 1;
            while (current < input.length && braceCount > 0) {
              if (input[current] === '{') braceCount++;
              if (input[current] === '}') braceCount--;
              template += input[current];
              current++;
            }
          } else {
            template += input[current++];
          }
        }

        if (current >= input.length) {
          throw new Error('Unterminated template literal');
        }
        current++;
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

      // Handle Numbers
      if (/[0-9.]/.test(char)) {
        const number = readNumber();
        addToken(TokenType.Literal, number);
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