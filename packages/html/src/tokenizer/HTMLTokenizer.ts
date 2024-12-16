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
    private createTextToken(content: string, startPos: number): HTMLToken {
      let column = 1;
      let line = 1;
      
      // Calculate correct line and column by scanning from input start
      for (let i = 0; i < startPos; i++) {
        if (this.input[i] === '\n') {
          line++;
          column = 1;
        } else {
          column++;
        }
      }
      
      return {
        type: "Text",
        value: content.trim(),
        line,
        column
      };
    }
    public tokenize(): HTMLToken[] {
      this.position = 0;
      this.line = 1;
      this.column = 1;
      
      const tokens: HTMLToken[] = [];
      let textStart = 0;
      
      while (this.position < this.input.length) {
        const char = this.peek();
  
        if (char === "<") {
          // Read any accumulated text before processing tag
          if (textStart < this.position) {
            const textContent = this.input.slice(textStart, this.position);
            const textToken = this.createTextToken(textContent, textStart);
            if (textToken.value) {
              tokens.push(textToken);
            }
          }
  
          if (this.match("<!--")) {
            tokens.push(this.readComment());
          } else if (this.match("<!DOCTYPE")) {
            tokens.push(this.readDoctype());
          } else if (this.peek(1) === "/") {
            tokens.push(this.readEndTag());
          } else {
            tokens.push(this.readStartTag());
          }
          textStart = this.position;
        } else {
          this.position++;
          if (char === '\n') {
            this.line++;
            this.column = 1;
          } else {
            this.column++;
          }
        }
      }
  
      // Handle any remaining text
      if (textStart < this.position) {
        const textContent = this.input.slice(textStart, this.position);
        const textToken = this.createTextToken(textContent, textStart);
        if (textToken.value) {
          tokens.push(textToken);
        }
      }
  
      return tokens;
    }
  
    private readStartTag(): HTMLToken {
      const { line, column } = this.getCurrentLocation();
      this.consume(); // Skip '<'
      
      const name = this.readTagName();
      const attributes: Record<string, string> = {};
      let selfClosing = false;
      
      // Track the original position for accurate nested element positioning
      const startPosition = this.position;
      
      while (this.position < this.input.length && !this.match(">")) {
        this.skipWhitespace();
        
        if (this.match("/>")) {
          selfClosing = true;
          this.position += 2;
          this.column += 2;
          break;
        }
        
        if (this.peek() === "/") {
          selfClosing = true;
          this.consume();
          continue;
        }
        
        // Read attribute
        const attrName = this.readUntil(/[\s=\/>]/).trim();
        if (!attrName) break;
        
        this.skipWhitespace();
        
        if (this.peek() === "=") {
          this.consume(); // Skip '='
          this.skipWhitespace();
          
          let value: string;
          const quote = this.peek();
          
          if (quote === '"' || quote === "'") {
            this.consume(); // Skip opening quote
            value = this.readUntil(quote);
            this.consume(); // Skip closing quote
          } else {
            value = this.readUntil(/[\s\/>]/);
          }
          
          attributes[attrName] = value;
        } else {
          attributes[attrName] = "true";
        }
        
        this.skipWhitespace();
      }
      
      if (this.peek() === ">") {
        this.consume();
      }
      
      return { type: "StartTag", name, attributes, selfClosing, line, column };
    }
  
    private readComment(): HTMLToken {
      const { line, column } = this.getCurrentLocation();
      this.consume(4); // Skip '<!--'
      let value = '';
      
      while (this.position < this.input.length) {
        if (this.match("-->")) {
          break;
        }
        value += this.consume();
      }
      
      this.consume(3); // Skip '-->'
      return { type: "Comment", value: value.trim(), line, column };
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
      const startPosition = this.position;
      
      this.consume(2); // Skip '</'
      const name = this.readTagName();
      this.skipWhitespace();
      
      if (this.peek() === '>') {
        this.consume();
      }
      
      return {
        type: "EndTag",
        name,
        line,
        column: startPosition === 0 ? 1 : column
      };
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