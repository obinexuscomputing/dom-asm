import { JSToken, JSTokenType } from '../types';

export class JSTokenizer {
  private keywords = new Set(['const', 'let', 'var', 'if', 'else', 'function', 'return']);
  private operators = new Set(['=', '+', '-', '*', '/', '%', '===', '!==', '<', '>', '==', '!=']);
  private delimiters = new Set(['(', ')', '{', '}', '[', ']']);

  public tokenize(input: string): JSToken[] {
    const tokens: JSToken[] = [];
    let current = 0;

    const addToken = (type: JSTokenType, value: string) => {
      tokens.push({ type, value });
    };

    input = input.trim();

    while (current < input.length) {
      const char = input[current];

      if (this.delimiters.has(char)) {
        addToken(JSTokenType.Delimiter, char);
        current++;
        continue;
      }

      if (/\s/.test(char)) {
        current++;
        continue;
      }

      if (char === ';') {
        addToken(JSTokenType.Delimiter, char);
        current++;
        continue;
      }

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

      if (/[0-9]/.test(char)) {
        let value = '';
        while (current < input.length && /[0-9.]/.test(input[current])) {
          value += input[current++];
        }
        addToken(JSTokenType.Literal, value);
        continue;
      }

      const multiCharOp = this.matchMultiCharOperator(input.slice(current));
      if (multiCharOp) {
        addToken(JSTokenType.Operator, multiCharOp);
        current += multiCharOp.length;
        continue;
      }

      if (this.operators.has(char)) {
        addToken(JSTokenType.Operator, char);
        current++;
        continue;
      }

      throw new Error(`Unexpected character: ${char}`);
    }

    addToken(JSTokenType.EndOfStatement, 'EOF');
    return tokens;
  }

  private matchMultiCharOperator(input: string): string | null {
    const multiCharOperators = ['===', '!==', '==', '!='];
    return multiCharOperators.find(op => input.startsWith(op)) || null;
  }
}

export { JSToken, JSTokenType };