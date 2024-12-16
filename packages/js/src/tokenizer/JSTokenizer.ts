export enum JSTokenType {
  Keyword = 'Keyword',
  Identifier = 'Identifier',
  Operator = 'Operator',
  Delimiter = 'Delimiter',
  Literal = 'Literal',
  TemplateLiteral = 'TemplateLiteral',
  Comment = 'Comment',
  EndOfStatement = 'EndOfStatement',
}

export interface JSToken {
  type: JSTokenType;
  value: string;
}

export class JSTokenizer {
  private keywords = new Set(['const', 'let', 'var', 'if', 'else', 'function', 'return']);
  private operators = new Set(['=', '+', '-', '*', '/', '%', '===', '!==', '<', '>', '==', '!=']);
  private delimiters = new Set([';', '{', '}', '(', ')', '[', ']']);

  public tokenize(input: string): JSToken[] {
    const tokens: JSToken[] = [];
    let current = 0;

    const addToken = (type: JSTokenType, value: string) => {
      tokens.push({ type, value });
    };

    while (current < input.length) {
      let char = input[current];

      // Skip whitespace
      if (/\s/.test(char)) {
        current++;
        continue;
      }

      // Check for multi-character delimiters or operators first
      const remainingInput = input.slice(current);
      const multiCharOp = this.matchMultiCharOperator(remainingInput);
      if (multiCharOp) {
        addToken(JSTokenType.Operator, multiCharOp);
        current += multiCharOp.length;
        continue;
      }

      // Handle single-character cases
      switch (true) {
        // Identifiers and keywords
        case /[a-zA-Z_$]/.test(char): {
          let value = '';
          while (current < input.length && /[a-zA-Z0-9_$]/.test(input[current])) {
            value += input[current++];
          }
          addToken(
            this.keywords.has(value) ? JSTokenType.Keyword : JSTokenType.Identifier, 
            value
          );
          continue;
        }

        // Numbers
        case /[0-9]/.test(char): {
          let value = '';
          while (current < input.length && /[0-9.]/.test(input[current])) {
            value += input[current++];
          }
          addToken(JSTokenType.Literal, value);
          continue;
        }

        // Operators
        case this.operators.has(char): {
          addToken(JSTokenType.Operator, char);
          current++;
          continue;
        }

        // Delimiters
        case this.delimiters.has(char): {
          addToken(JSTokenType.Delimiter, char);
          current++;
          continue;
        }

        // Unexpected character
        default:
          throw new Error(`Unexpected character: ${char}`);
      }
    }

    // Always add EOF token
    addToken(JSTokenType.EndOfStatement, 'EOF');
    return tokens;
  }

  private matchMultiCharOperator(input: string): string | null {
    const multiCharOperators = ['===', '!==', '==', '!='];
    return multiCharOperators.find(op => input.startsWith(op)) || null;
  }
}