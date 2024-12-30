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

//     // Usage
// const input = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <title>Document</title>
// </head>
// <body>
//   <p>Hello, world!</p>
// </body>
// </html>
// `;

// const tokenizer = new HTMLTokenizer(input);
// const { tokens, errors } = tokenizer.tokenize();

// console.log(tokens);
// console.log(errors);
    
export class HTMLTokenizer {
  private static readonly VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  private input: string;
  private position: number;
  private line: number;
  private column: number;
  private lastTokenEnd: number;
  private errors: TokenizerError[];
  private openTags: string[];
  
  private options: {
    xmlMode: boolean;
    recognizeCDATA: boolean;
    recognizeConditionalComments: boolean;
    preserveWhitespace: boolean;
    validateClosing: boolean;
  };

  constructor(input: string, options: Partial<HTMLTokenizer['options']> = {}) {
    this.input = input;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.lastTokenEnd = 0;
    this.errors = [];
    this.openTags = [];
    this.options = {
      xmlMode: false,
      recognizeCDATA: false,
      recognizeConditionalComments: true,
      preserveWhitespace: false,
      validateClosing: true,
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
                const text = this.input.slice(textStart, this.position);
                const textToken = this.createTextToken(text, textStart);
                if (this.shouldAddTextToken(textToken)) {
                  tokens.push(textToken);
                }
              }
              
              if (this.match("<!--")) {
                tokens.push(this.readComment());
              } else if (this.match("<![CDATA[") && this.options.recognizeCDATA) {
                tokens.push(this.readCDATA());
              } else if (this.match("<!DOCTYPE")) {
                tokens.push(this.readDoctype());
              } else if (this.peek(1) === "/") {
                const endTag = this.readEndTag();
                tokens.push(endTag);
                if (this.options.validateClosing) {
                  const lastOpenTagIndex = this.openTags.lastIndexOf(endTag.name);
                  if (lastOpenTagIndex !== -1) {
                    this.openTags.splice(lastOpenTagIndex, 1);
                  }
                }
              } else {
                const startTag = this.readStartTag();
                tokens.push(startTag);
                if (!startTag.selfClosing) {
                  this.openTags.push(startTag.name);
                }
              }
              
              textStart = this.position;
            } else {
              this.advance();
            }
          }
          
          // Handle remaining text
          if (textStart < this.position) {
            const text = this.input.slice(textStart, this.position);
            const textToken = this.createTextToken(text, textStart);
            if (this.shouldAddTextToken(textToken)) {
              tokens.push(textToken);
            }
          }
          
          // Check for unclosed tags
          if (this.options.validateClosing) {
            this.openTags.forEach(tag => {
              if (!HTMLTokenizer.VOID_ELEMENTS.has(tag.toLowerCase())) {
                this.addError(`Unclosed tag: ${tag}`);
              }
            });
          }
          
        } catch (error) {
          if (error instanceof Error) {
            this.addError(error.message);
          }
        }
        
        return { tokens, errors: this.errors };
      }

  private readEndTag(): Extract<HTMLToken, { type: "EndTag" }> {
    const { line, column } = this.getCurrentLocation();
    this.advance(2); // Skip '</'
    
    const name = this.readTagName();
    if (!name) {
      this.addError("Missing tag name in end tag");
    }
    
    this.skipWhitespace();
    
    // Check for proper closing of end tag
    if (this.peek() !== '>') {
      this.addError(`Malformed end tag: ${name}`);
    } else {
      this.advance(); // Skip '>'
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
  } private readStartTag(): Extract<HTMLToken, { type: "StartTag" }> {
    const { line, column } = this.getCurrentLocation();
    this.consume(); // Skip '<'
    
    const name = this.readTagName();
    const attributes = new Map<string, string>();
    let selfClosing = false;
    let namespace: string | undefined;
    
    try {
      while (this.position < this.input.length) {
        this.skipWhitespace();
        
        // Check for tag endings
        if (this.match("/>")) {
          selfClosing = true;
          this.advance(2); // Skip "/>"
          break;
        }
        
        if (this.match(">")) {
          this.advance(); // Skip ">"
          break;
        }
        
        // Read attribute if we haven't reached the end
        if (this.position < this.input.length && !/[\s>]/.test(this.peek())) {
          const attrName = this.readAttributeName();
          if (!attrName) continue;
          
          this.skipWhitespace();
          let value = attrName; // Default value for boolean attributes
          
          // Handle attribute value if present
          if (this.peek() === "=") {
            this.advance(); // Skip '='
            this.skipWhitespace();
            
            const quote = this.peek();
            if (quote === '"' || quote === "'") {
              // Quoted attribute value
              this.advance(); // Skip opening quote
              value = '';
              
              while (this.position < this.input.length) {
                if (this.peek() === quote) {
                  this.advance(); // Skip closing quote
                  break;
                }
                value += this.advance();
              }
            } else {
              // Unquoted attribute value
              value = '';
              while (this.position < this.input.length) {
                const char = this.peek();
                if (/[\s\/>]/.test(char)) break;
                value += this.advance();
              }
            }
          }
          
          // Store the attribute, converting name to lowercase
          if (!attributes.has(attrName.toLowerCase())) {
            attributes.set(attrName.toLowerCase(), value);
          } else {
            this.addError(`Duplicate attribute: ${attrName}`);
          }
        }
      }
      
      // Handle end of input without proper tag closure
      if (this.position >= this.input.length) {
        this.addError(`Unexpected end of input in tag ${name}`);
      }
      
      // Auto-close void elements
      if (HTMLTokenizer.VOID_ELEMENTS.has(name.toLowerCase())) {
        selfClosing = true;
      }
      
      return {
        type: "StartTag",
        name: name.toLowerCase(),
        attributes,
        selfClosing,
        line,
        column,
        namespace
      };
      
    } catch (error) {
      // Error recovery - return what we have so far
      if (error instanceof Error) {
        this.addError(error.message);
      }
      
      return {
        type: "StartTag",
        name: name.toLowerCase(),
        attributes,
        selfClosing: HTMLTokenizer.VOID_ELEMENTS.has(name.toLowerCase()) || selfClosing,
        line,
        column,
        namespace
      };
    }
  }

  private isValidUnquotedAttributeValue(char: string): boolean {
    return /[a-zA-Z0-9-]/.test(char);
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
          return value;
        }
        value += this.advance();
      }
      this.addError("Unclosed attribute value");
      return value;
    }
    
    // Handle unquoted attribute values
    while (this.position < this.input.length) {
      const char = this.peek();
      if (/[\s\/>]/.test(char)) break;
      value += this.advance();
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
    this.openTags = [];
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

