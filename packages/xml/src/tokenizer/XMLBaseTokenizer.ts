export abstract class XMLBaseTokenizer {
  protected input: string;
  protected position: number;
  protected line: number;
  protected column: number;

  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.line = 1;
    this.column = 1;
  }

  public abstract tokenize(): unknown[];

  protected peek(offset: number = 0): string {
    return this.input[this.position + offset] || '';
  }

  protected consume(): string {
    const char = this.peek();
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    this.position++;
    return char;
  }

  protected readUntil(stop: string | RegExp): string {
    let result = '';
    while (
      this.position < this.input.length &&
      !(typeof stop === 'string'
        ? this.input.startsWith(stop, this.position)
        : stop.test(this.peek()))
    ) {
      result += this.consume();
    }
    return result;
  }

  protected skipWhitespace(): void {
    while (/\s/.test(this.peek())) {
      this.consume();
    }
  }

  protected getCurrentLocation(): { line: number; column: number } {
    return { line: this.line, column: this.column };
  }
}