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
  
    protected abstract tokenize(): unknown[];
  
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
          ? this.peek() === stop
          : stop.test(this.peek()))
      ) {
        result += this.consume();
      }
      return result;
    }
  
    protected readWhile(predicate: (char: string) => boolean): string {
      let result = '';
      while (this.position < this.input.length && predicate(this.peek())) {
        result += this.consume();
      }
      return result;
    }
  
    protected skipWhitespace(): void {
      this.readWhile(char => /\s/.test(char));
    }
  
    protected getCurrentLocation(): { line: number; column: number } {
      return { line: this.line, column: this.column };
    }
  }