
export enum TokenType {
    Keyword,
    Identifier,
    Operator,
    Delimiter,
    Literal,
    EndOfStatement,
  }
  
  export interface Token {
    type: TokenType;
    value: string;
  }
  
  export class Tokenizer {
    private keywords = new Set(['const', 'let', 'var', 'if', 'else', 'function', 'return']);
    private operators = new Set(['=', '+', '-', '*', '/', '===', '!==', '<', '>']);
    private delimiters = new Set([';', '{', '}', '(', ')', '[', ']']);
  
    tokenize(input: string): Token[] {
      const tokens: Token[] = [];
      let current = 0;
  
      while (current < input.length) {
        const char = input[current];
  
        // Whitespace
        if (/\s/.test(char)) {
          current++;
          continue;
        }
  
        // Delimiters
        if (this.delimiters.has(char)) {
          tokens.push({ type: TokenType.Delimiter, value: char });
          current++;
          continue;
        }
  
        // Operators
        let operator = '';
        while (this.operators.has(operator + input[current])) {
          operator += input[current++];
        }
        if (operator) {
          tokens.push({ type: TokenType.Operator, value: operator });
          continue;
        }
  
        // Keywords and Identifiers
        if (/[a-zA-Z_$]/.test(char)) {
          let identifier = '';
          while (/[a-zA-Z0-9_$]/.test(input[current])) {
            identifier += input[current++];
          }
          tokens.push({
            type: this.keywords.has(identifier) ? TokenType.Keyword : TokenType.Identifier,
            value: identifier,
          });
          continue;
        }
  
        // Literals (numbers)
        if (/[0-9]/.test(char)) {
          let number = '';
          while (/[0-9.]/.test(input[current])) {
            number += input[current++];
          }
          tokens.push({ type: TokenType.Literal, value: number });
          continue;
        }
  
        throw new Error(`Unexpected character: ${char}`);
      }
  
      tokens.push({ type: TokenType.EndOfStatement, value: 'EOF' });
      return tokens;
    }
  }
  