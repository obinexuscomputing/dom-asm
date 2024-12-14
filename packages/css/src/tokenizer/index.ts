export type Token = {
  type: string; // e.g., 'selector', 'property', 'value', 'whitespace', 'comment', 'delimiter'
  value: string; // The actual content of the token
  position: { line: number; column: number }; // For error reporting and debugging
};

export class Tokenizer {
  private input: string;
  private position: number;
  private line: number;
  private column: number;

  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.line = 1;
    this.column = 1;
  }

  private isWhitespace(char: string): boolean {
    return char === ' ' || char === '\t' || char === '\n' || char === '\r';
  }

  private isCommentStart(): boolean {
    return this.input[this.position] === '/' && this.input[this.position + 1] === '*';
  }

  private isDelimiter(char: string): boolean {
    return ['{', '}', ':', ';', ','].includes(char);
  }

  private consumeWhitespace(): void {
    while (this.isWhitespace(this.input[this.position])) {
      if (this.input[this.position] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
  }

  private consumeComment(): Token {
    const start = this.position;
    this.position += 2; // Skip '/*'
    while (
      this.position < this.input.length &&
      !(this.input[this.position] === '*' && this.input[this.position + 1] === '/')
    ) {
      if (this.input[this.position] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.position++;
    }
    this.position += 2; // Skip '*/'
    return {
      type: 'comment',
      value: this.input.slice(start, this.position),
      position: { line: this.line, column: this.column },
    };
  }

  private consumeDelimiter(): Token {
    const char = this.input[this.position];
    this.position++;
    this.column++;
    return {
      type: 'delimiter',
      value: char,
      position: { line: this.line, column: this.column },
    };
  }

  private consumeOther(): Token {
    const start = this.position;
    while (
      this.position < this.input.length &&
      !this.isWhitespace(this.input[this.position]) &&
      !this.isCommentStart() &&
      !this.isDelimiter(this.input[this.position])
    ) {
      this.position++;
      this.column++;
    }
    return {
      type: 'other',
      value: this.input.slice(start, this.position),
      position: { line: this.line, column: this.column },
    };
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.position < this.input.length) {
      const char = this.input[this.position];

      if (this.isWhitespace(char)) {
        this.consumeWhitespace(); // Ignore whitespace tokens
      } else if (this.isCommentStart()) {
        tokens.push(this.consumeComment());
      } else if (this.isDelimiter(char)) {
        tokens.push(this.consumeDelimiter());
      } else {
        tokens.push(this.consumeOther());
      }
    }

    return tokens;
  }
}
