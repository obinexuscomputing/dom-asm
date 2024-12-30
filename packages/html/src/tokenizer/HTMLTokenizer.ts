// Enhanced token types with more specific information
export type HTMLToken =
  | { 
      type: "Doctype"; 
      value: string; 
      line: number; 
      column: number;
      publicId?: string;
      systemId?: string;
    }
  | { 
      type: "StartTag"; 
      name: string; 
      attributes: Map<string, string>; // Using Map for better attribute handling
      selfClosing: boolean; 
      line: number; 
      column: number;
      namespace?: string; // Added for XML/SVG support
    }
  | { 
      type: "EndTag"; 
      name: string; 
      line: number; 
      column: number;
      namespace?: string;
    }
  | { 
      type: "Text"; 
      value: string; 
      line: number; 
      column: number;
      isWhitespace: boolean; // Flag for pure whitespace text
    }
  | { 
      type: "Comment"; 
      value: string; 
      line: number; 
      column: number;
      isConditional: boolean; // For conditional comments
    }
  | {
      type: "CDATA";
      value: string;
      line: number;
      column: number;
    };

    export interface TokenizerError {
      message: string;
      line: number;
      column: number;
    }
    
    export class HTMLTokenizer {
      private input: string;
      private position: number = 0;
      private line: number = 1;
      private column: number = 1;
      private lastTokenEnd: number = 0;
      private errors: TokenizerError[] = [];
    
      // Configuration options
      private options: {
        xmlMode: boolean;
        recognizeCDATA: boolean;
        recognizeConditionalComments: boolean;
        preserveWhitespace: boolean;
      };
    
      constructor(input: string, options: Partial<HTMLTokenizer['options']> = {}) {
        this.input = input;
        this.options = {
          xmlMode: false,
          recognizeCDATA: false,
          recognizeConditionalComments: true,
          preserveWhitespace: false,
          ...options
        };
      }
    

  public tokenize(): { tokens: HTMLToken[]; errors: TokenizerError[] } {
    this.reset();
    const tokens: HTMLToken[] = [];
    let textStart = 0;
    
    try {
      while (this.position < this.input.length) {
        const char = this.peek();

        if (char === "<") {
          // Handle text before tag
          if (textStart < this.position) {
            const textToken = this.createTextToken(
              this.input.slice(textStart, this.position), 
              textStart
            );
            if (this.shouldAddTextToken(textToken)) {
              tokens.push(textToken);
            }
          }

          const tagStart = this.position;
          if (this.match("<!--")) {
            tokens.push(this.readComment());
          } else if (this.match("<![CDATA[") && this.options.recognizeCDATA) {
            tokens.push(this.readCDATA());
          } else if (this.match("<!DOCTYPE")) {
            tokens.push(this.readDoctype());
          } else if (this.peek(1) === "/") {
            tokens.push(this.readEndTag());
          } else {
            tokens.push(this.readStartTag());
          }
          
          textStart = this.position;
          this.lastTokenEnd = this.position;
        } else {
          this.advance();
        }
      }

      // Handle any remaining text
      if (textStart < this.position) {
        const textToken = this.createTextToken(
          this.input.slice(textStart, this.position),
          textStart
        );
        if (this.shouldAddTextToken(textToken)) {
          tokens.push(textToken);
        }
      }
    } catch (error) {
      this.addError(`Tokenization error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { tokens, errors: this.errors };
  }

  private readEndTag(): Extract<HTMLToken, { type: "EndTag" }> {
    const { line, column } = this.getCurrentLocation();
    this.advance(2); // Skip '</'
    
    const name = this.readTagName();
    this.skipWhitespace();
    
    if (this.peek() === '>') {
        this.advance(); // Skip '>'
    }
    
    // Add validation for malformed end tags
    if (!name) {
        this.addError("Missing tag name in end tag");
    }
    
    return { type: "EndTag", name, line, column };
}

  private readTagName(): string {
    let name = '';
    while (this.position < this.input.length) {
      const char = this.peek();
      if (/[\s\/>]/.test(char)) break;
      name += this.advance();
    }
    return name.toLowerCase().trim();
  }
  private createTextToken(value: string, start: number): Extract<HTMLToken, { type: "Text" }> {
    const isWhitespace = /^\s*$/.test(value);
    return {
      type: "Text",
      value,
      line: this.line,
      column: this.column,
      isWhitespace
    };
  }


  private shouldAddTextToken(token: Extract<HTMLToken, { type: "Text" }>): boolean {
    if (!token.value) return false;
    return this.options.preserveWhitespace || !token.isWhitespace;
  }


  private readStartTag(): Extract<HTMLToken, { type: "StartTag" }> {
    const { line, column } = this.getCurrentLocation();
    this.consume(); // Skip '<'
    
    const name = this.readTagName();
    const attributes = new Map<string, string>();
    let selfClosing = false;
    let namespace: string | undefined;
    
    try {
        while (this.position < this.input.length && !this.match(">")) {
            this.skipWhitespace();
            
            if (this.match("/>")) {
                selfClosing = true;
                this.advance(2);
                break;
            }
            
            const attrName = this.readAttributeName();
            if (!attrName) break;
            
            this.skipWhitespace();
            let value = "";
            
            if (this.peek() === "=") {
                this.advance(); // Skip '='
                this.skipWhitespace();
                value = this.readAttributeValue();
                // Validate attribute value
                if (!value && this.peek() === '"') {
                    this.addError(`Invalid attribute value for ${attrName}`);
                }
            } else {
                value = attrName; // Boolean attribute
            }
            
            // Convert to lowercase for consistency
            attributes.set(attrName.toLowerCase(), value);
            this.skipWhitespace();
        }
    } catch (error) {
        if (error instanceof Error) {
          this.addError(`Error parsing attributes for tag <${name}>: ${error.message}`);
        } else {
          this.addError(`Error parsing attributes for tag <${name}>: Unknown error`);
        }
    }
    
    if (this.peek() === ">") {
        this.advance();
    }
    
    return { type: "StartTag", name, attributes, selfClosing, line, column, namespace };
}

  private consume(): void {
    this.advance();
  }

  private readAttributeName(): string {
    let name = '';
    while (this.position < this.input.length) {
      const char = this.peek();
      if (/[\s=\/>]/.test(char)) break;
      name += this.advance();
    }
    return name.toLowerCase().trim();
  }

  private readAttributeValue(): string {
    const quote = this.peek();
    let value = '';
    
    if (quote === '"' || quote === "'") {
      this.advance(); // Skip opening quote
      while (this.position < this.input.length) {
        if (this.peek() === quote) {
          this.advance(); // Skip closing quote
          break;
        }
        value += this.advance();
      }
    } else {
      // Unquoted attribute value
      while (this.position < this.input.length) {
        const char = this.peek();
        if (/[\s\/>]/.test(char)) break;
        value += this.advance();
      }
    }
    
    return value;
  }

  private readCDATA(): Extract<HTMLToken, { type: "CDATA" }> {
    const { line, column } = this.getCurrentLocation();
    this.advance(9); // Skip '<![CDATA['
    
    let value = '';
    while (this.position < this.input.length) {
      if (this.match("]]>")) {
        this.advance(3);
        break;
      }
      value += this.advance();
    }
    
    return { type: "CDATA", value, line, column };
  }

  private readComment(): Extract<HTMLToken, { type: "Comment" }> {
    const { line, column } = this.getCurrentLocation();
    this.advance(4); // Skip '<!--'
    
    let value = '';
    let isConditional = false;
    
    // Check for conditional comments
    if (this.options.recognizeConditionalComments && this.match("[if")) {
      isConditional = true;
    }
    
    while (this.position < this.input.length) {
      if (this.match("-->")) {
        this.advance(3);
        break;
      }
      value += this.advance();
    }
    
    return { type: "Comment", value: value.trim(), line, column, isConditional };
  }

  private readDoctype(): Extract<HTMLToken, { type: "Doctype" }> {
    const { line, column } = this.getCurrentLocation();
    this.advance(9); // Skip '<!DOCTYPE'
    this.skipWhitespace();
    
    let value = '';
    let publicId: string | undefined;
    let systemId: string | undefined;
    
    // Read doctype name
    while (this.position < this.input.length && !this.match(">")) {
      const char = this.peek();
      if (char === "P" && this.match("PUBLIC")) {
        this.advance(6);
        this.skipWhitespace();
        publicId = this.readQuotedString();
        this.skipWhitespace();
        if (this.peek() !== ">") {
          systemId = this.readQuotedString();
        }
        break;
      } else if (char === "S" && this.match("SYSTEM")) {
        this.advance(6);
        this.skipWhitespace();
        systemId = this.readQuotedString();
        break;
      } else {
        value += this.advance();
      }
    }
    
    while (this.position < this.input.length && this.peek() !== ">") {
      this.advance();
    }
    this.advance(); // Skip '>'
    
    return { 
      type: "Doctype", 
      value: value.trim(), 
      publicId, 
      systemId, 
      line, 
      column 
    };
  }

  private readQuotedString(): string {
    const quote = this.peek();
    if (quote !== '"' && quote !== "'") {
      this.addError("Expected quoted string");
      return "";
    }
    
    let value = "";
    this.advance(); // Skip opening quote
    
    while (this.position < this.input.length && this.peek() !== quote) {
      value += this.advance();
    }
    
    this.advance(); // Skip closing quote
    return value;
  }

  private advance(count: number = 1): string {
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
  private addError(message: string): void {
    this.errors.push({
      message,
      line: this.line,
      column: this.column
    });
  }

  private reset(): void {
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.lastTokenEnd = 0;
    this.errors = [];
  }

  private peek(offset: number = 0): string {
    return this.input[this.position + offset] || '';
  }

  private match(str: string): boolean {
    return this.input.startsWith(str, this.position);
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  private getCurrentLocation(): { line: number; column: number } {
    return { line: this.line, column: this.column };
  }
}