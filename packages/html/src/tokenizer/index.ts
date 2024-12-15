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

  public tokenize(): HTMLToken[] {
    const tokens: HTMLToken[] = [];
    while (this.position < this.input.length) {
      const char = this.peek();

      if (char === "<") {
        if (this.match("<!--")) {
          tokens.push(this.readComment());
        } else if (this.match("<!DOCTYPE")) {
          tokens.push(this.readDoctype());
        } else if (this.peek(1) === "/") {
          tokens.push(this.readEndTag());
        } else {
          tokens.push(this.readStartTag());
        }
      } else {
        tokens.push(this.readText());
      }
    }
    return tokens;
  }

  private readDoctype(): HTMLToken {
    const { line, column } = this.getCurrentLocation();
    this.consume(9); // Skip '<!DOCTYPE'
    const value = this.readUntil(">").trim();
    this.consume(); // Skip '>'
    return { type: "Doctype", value, line, column };
  }


  private readEndTag(): HTMLToken {
    const { line, column } = this.getCurrentLocation();
    this.consume(2); // Skip '</'
    const name = this.readUntil(">").toLowerCase().trim(); // HTML tag names are case-insensitive
    this.consume(); // Skip '>'
    return { type: "EndTag", name, line, column };
  }
  private readStartTag(): HTMLToken {
    const { line, column } = this.getCurrentLocation();
    this.consume(); // Skip '<'
  
    // Read tag name
    const name = this.readUntil(/[ \/>]/).toLowerCase().trim();
    if (!name) {
      throw new Error(`Invalid start tag at line ${line}, column ${column}`);
    }
  
    const attributes: Record<string, string> = {};
    let selfClosing = false;
  
    // Process attributes and self-closing marker
    while (this.peek() && this.peek() !== ">") {
      this.skipWhitespace();
  
      if (this.peek() === "/") {
        selfClosing = true;
        this.consume(); // Skip '/'
        break;
      }
  
      const attrName = this.readUntil(/[= \/>]/).trim();
      if (!attrName) break;
  
      // Handle attribute value or boolean attributes
      if (this.peek() === "=") {
        this.consume(); // Skip '='
        const quote = this.peek();
        if (quote === '"' || quote === "'") {
          this.consume(); // Skip opening quote
          const attrValue = this.readUntil(quote);
          this.consume(); // Skip closing quote
          attributes[attrName] = attrValue;
        } else {
          attributes[attrName] = this.readUntil(/[ \/>]/);
        }
      } else {
        attributes[attrName] = "true"; // Boolean attribute
      }
    }
  
    // Ensure the tag ends with '>'
    if (this.peek() === ">") {
      this.consume(); // Skip '>'
    } else {
      throw new Error(`Unclosed tag: <${name} at line ${line}, column ${column}`);
    }
  
    return { type: "StartTag", name, attributes, selfClosing, line, column };
  }
  
  private readComment(): HTMLToken {
    const { line, column } = this.getCurrentLocation();
    this.consume(4); // Skip '<!--'
    const value = this.readUntil("-->");
    this.consume(3); // Skip '-->'
    return { type: "Comment", value, line, column };
  }

  private readText(): HTMLToken {
    const { line, column } = this.getCurrentLocation();
    const value = this.readUntil("<").trim();
    return { type: "Text", value, line, column };
  }

  private readUntil(stop: string | RegExp): string {
    const start = this.position;
    while (
      this.position < this.input.length &&
      !(typeof stop === "string"
        ? this.input[this.position] === stop
        : stop.test(this.input.slice(this.position, this.position + 1)))
    ) {
      this.consume();
    }
    return this.input.slice(start, this.position);
  }
  
  private peek(offset: number = 0): string {
    return this.input[this.position + offset] || "";
  }

  private match(str: string): boolean {
    return this.input.startsWith(str, this.position);
  }

  private matches(pattern: string | RegExp): boolean {
    const slice = this.input.slice(this.position);
    return typeof pattern === "string" ? slice.startsWith(pattern) : pattern.test(slice);
  }

  private consume(count: number = 1): string {
    let result = "";
    for (let i = 0; i < count; i++) {
      const char = this.input[this.position];
      if (char === "\n") {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      result += char;
      this.position++;
    }
    return result;
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.peek())) {
      this.consume();
    }
  }
  private addError(message: string): void {
    console.error(`Error at line ${this.line}, column ${this.column}: ${message}`);
  }
  
  private getCurrentLocation(): { line: number; column: number } {
    return { line: this.line, column: this.column };
  }
}
