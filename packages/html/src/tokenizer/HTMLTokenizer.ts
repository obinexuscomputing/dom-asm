export type HTMLToken =
  | { type: "Doctype"; value: string; line: number; column: number }
  | { type: "StartTag"; name: string; attributes: Record<string, string>; selfClosing: boolean; line: number; column: number }
  | { type: "EndTag"; name: string; line: number; column: number }
  | { type: "Text"; value: string; line: number; column: number }
  | { type: "Comment"; value: string; line: number; column: number };
  export class HTMLTokenizer {
    private input: string;
    private position: number = 0;
    private line: number = 1;
    private column: number = 1;
  
    constructor(input: string) {
      this.input = input;
    }
  
    private readText(): HTMLToken {
      const { line, column } = this.getCurrentLocation();
      let value = '';
      const startPos = this.position;
      
      while (this.position < this.input.length && this.peek() !== "<") {
        value += this.input[this.position];
        this.position++;
      }
      
      // Don't adjust column/line position while collecting text
      const result = { type: "Text" as const, value: value.trim(), line, column };
      
      // Now update positions after collecting text
      for (let i = startPos; i < this.position; i++) {
        if (this.input[i] === '\n') {
          this.line++;
          this.column = 1;
        } else {
          this.column++;
        }
      }
      
      return result;
    }
  
    private readEndTag(): HTMLToken {
      const { line, column } = this.getCurrentLocation();
      const startPos = this.position;
      
      this.position += 2; // Skip '</'
      this.column += 2;
      
      const name = this.readTagName();
      this.skipWhitespace();
      
      // Skip '>'
      if (this.position < this.input.length) {
        this.position++;
        this.column++;
      }
      
      return { type: "EndTag", name, line, column };
    }
  
    private readTagName(): string {
      let name = '';
      while (this.position < this.input.length && !/[\s>\/]/.test(this.peek())) {
        name += this.input[this.position];
        this.position++;
        this.column++;
      }
      return name.toLowerCase().trim();
    }
  

  public readDoctype(): HTMLToken {
    const { line, column } = this.getCurrentLocation();
    this.consume(9); // Skip '<!DOCTYPE'
    const value = this.readUntil(">").trim();
    this.consume(); // Skip '>'
    return { type: "Doctype", value, line, column };
  }

  private peek(offset: number = 0): string {
    return this.input[this.position + offset] || '';
  }

  private match(str: string): boolean {
    return this.input.startsWith(str, this.position);
  }

  private readUntil(stop: string | RegExp): string {
    const start = this.position;
    while (this.position < this.input.length) {
      const char = this.peek();
      if (typeof stop === 'string' ? char === stop : stop.test(char)) {
        break;
      }
      this.consume();
    }
    return this.input.slice(start, this.position);
  }

  private consume(count: number = 1): string {
    let result = '';
    for (let i = 0; i < count && this.position < this.input.length; i++) {
      const char = this.input[this.position];
      result += char;
      
      if (char === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      
      this.position++;
    }
    return result;
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && /\s/.test(this.peek())) {
      this.consume();
    }
  }

  private getCurrentLocation(): { line: number; column: number } {
    return { line: this.line, column: this.column };
  }
}