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
  private operators = new Set(['=', '+', '-', '*', '/', '%', '===', '!==', '<', '>']);
  private delimiters = new Set([';', '{', '}', '(', ')', '[', ']']);

  public tokenize(input: string): JSToken[] {
    const tokens: JSToken[] = [];
    let current = 0;

    while (current < input.length) {
      let char = input[current];

      // Skip whitespace
      if (/\s/.test(char)) {
        current++;
        continue;
      }

      // Handle identifiers and keywords
      if (/[a-zA-Z_$]/.test(char)) {
        let value = '';
        while (current < input.length && /[a-zA-Z0-9_$]/.test(input[current])) {
          value += input[current++];
        }

        tokens.push({
          type: this.keywords.has(value) ? JSTokenType.Keyword : JSTokenType.Identifier,
          value
        });
        continue;
      }

      // Handle numbers
      if (/[0-9]/.test(char)) {
        let value = '';
        while (current < input.length && /[0-9.]/.test(input[current])) {
          value += input[current++];
        }
        tokens.push({ type: JSTokenType.Literal, value });
        continue;
      }

      // Handle operators
      if (this.operators.has(char)) {
        tokens.push({ type: JSTokenType.Operator, value: char });
        current++;
        continue;
      }

      // Handle delimiters
      if (this.delimiters.has(char)) {
        tokens.push({ type: JSTokenType.Delimiter, value: char });
        current++;
        continue;
      }

      throw new Error(`Unexpected character: ${char}`);
    }

    tokens.push({ type: JSTokenType.EndOfStatement, value: 'EOF' });
    return tokens;
  }
}
