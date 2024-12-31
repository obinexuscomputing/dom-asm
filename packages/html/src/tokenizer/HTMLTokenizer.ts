export type TokenType = 
  | 'StartTag'
  | 'EndTag'
  | 'Text'
  | 'Comment'
  | 'ConditionalComment'
  | 'Doctype'
  | 'CDATA'
  | 'EOF';

export interface BaseToken {
  type: TokenType;
  start: number;
  end: number;
  line: number;
  column: number;
}

export interface StartTagToken extends BaseToken {
  type: 'StartTag';
  name: string;
  attributes: Map<string, string>;
  selfClosing: boolean;
  namespace?: string;
}

export interface EndTagToken extends BaseToken {
  type: 'EndTag';
  name: string;
  namespace?: string;
}

export interface TextToken extends BaseToken {
  type: 'Text';
  content: string;
  isWhitespace: boolean;
}

export interface CommentToken extends BaseToken {
  type: 'Comment';
  data: string;
  isConditional?: boolean;
}

export interface ConditionalCommentToken extends BaseToken {
  type: 'ConditionalComment';
  condition: string;
  content: string;
}

export interface DoctypeToken extends BaseToken {
  type: 'Doctype';
  name: string;
  publicId?: string;
  systemId?: string;
}

export interface CDATAToken extends BaseToken {
  type: 'CDATA';
  content: string;
}

export interface EOFToken extends BaseToken {
  type: 'EOF';
}

export type HTMLToken =
  | StartTagToken
  | EndTagToken
  | TextToken
  | CommentToken
  | ConditionalCommentToken
  | DoctypeToken
  | CDATAToken
  | EOFToken;

export interface TokenizerError {
  message: string;
  severity: 'warning' | 'error';
  line: number;
  column: number;
  start: number;
  end: number;
}

export interface TokenizerOptions {
  xmlMode?: boolean;
  recognizeCDATA?: boolean;
  recognizeConditionalComments?: boolean;
  preserveWhitespace?: boolean;
  allowUnclosedTags?: boolean;
  advanced?: boolean;
}

export interface TokenizerResult {
  tokens: HTMLToken[];
  errors: { message: string; line: number; column: number }[];
}

export class HTMLTokenizer {
  private input: string;
  private position: number;
  private line: number;
  private column: number;
  private tokens: HTMLToken[];
  private errors: TokenizerError[];
  private options: Required<TokenizerOptions>;

  constructor(input: string, options: TokenizerOptions = {}) {
    this.input = input;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
    this.errors = [];
    this.options = {
      xmlMode: false,
      recognizeCDATA: true,
      recognizeConditionalComments: true,
      preserveWhitespace: false,
      allowUnclosedTags: true,
      advanced: false,
      ...options
    };
  }

  tokenize(): TokenizerResult {
    while (this.position < this.input.length) {
      const char = this.input[this.position];

      if (char === '<') {
        this.processTag();
      } else {
        this.processText();
      }
    }

    // Push EOF token
    this.tokens.push({
      type: 'EOF',
      line: this.line,
      column: this.column,
      start: this.position,
      end: this.position,
    });

    return { tokens: this.tokens, errors: this.errors };
  }
  private skipUntil(char: string) {
    while (this.position < this.input.length && this.input[this.position] !== char) {
      this.advance();
    }
    this.advance(); // Skip target char
  }
  private processTag() {
    const start = this.position;
    this.advance(); // Skip '<'

    if (this.input[this.position] === '/') {
      this.advance(); // Skip '/'
      const tagName = this.readTagName();

      if (tagName) {
        this.tokens.push({
          type: 'EndTag',
          name: tagName,
          line: this.line,
          column: this.column,
          start,
          end: this.position,
        });
      } else {
        this.addError('Malformed end tag', start);
      }

      this.skipUntil('>');
    } else {
      const tagName = this.readTagName();

      if (tagName) {
        const attributes = this.readAttributes();
        const selfClosing = this.input[this.position] === '/';
        if (selfClosing) this.advance(); // Skip '/'

        this.tokens.push({
          type: 'StartTag',
          name: tagName,
          attributes,
          selfClosing,
          line: this.line,
          column: this.column,
          start,
          end: this.position,
        });
      } else {
        this.addError('Malformed start tag', start);
      }

      this.skipUntil('>');
    }
  }
  private processText() {
    const start = this.position;
    let content = '';

    while (this.position < this.input.length && this.input[this.position] !== '<') {
      content += this.input[this.position];
      this.advance();
    }

    if (content.trim() || this.options.preserveWhitespace) {
      this.tokens.push({
        type: 'Text',
        content,
        isWhitespace: !content.trim(),
        line: this.line,
        column: this.column,
        start,
        end: this.position,
      });
    }
  }
  private readAttributes(): Map<string, string> {
    const attributes = new Map<string, string>();

    while (this.position < this.input.length) {
      this.skipWhitespace();

      if (this.peek() === '>' || this.peek() === '/' || this.peek() === '<') break;

      const name = this.readAttributeName();
      if (!name) break;

      let value = '';
      this.skipWhitespace();

      if (this.peek() === '=') {
        this.advance();
        this.skipWhitespace();
        value = this.readAttributeValue();
      }

      attributes.set(name.toLowerCase(), value);
    }

    return attributes;
  }

  private readAttributeName(): string {
    let name = '';
    while (this.position < this.input.length) {
      const char = this.peek();
      if (/[\s=>\/]/.test(char)) break;
      name += this.advance();
    }
    return name;
  }
  
  private handleStartTag(): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    
    this.advance(); // Skip '<'
    const name = this.readTagName();
    let namespace: string | undefined;
    
    // Handle XML namespace
    if (this.options.xmlMode && name.includes(':')) {
      const [ns, localName] = name.split(':');
      namespace = ns;
    }
    
    if (!name) {
      this.reportError('Invalid start tag name', start, this.position);
      return;
    }

    const attributes = this.readAttributes();
    let selfClosing = false;

    this.skipWhitespace();
    if (this.peek() === '/') {
      selfClosing = true;
      this.advance();
    }

    const token: StartTagToken = {
      type: 'StartTag',
      name: name.toLowerCase(),
      attributes,
      selfClosing,
      namespace,
      start,
      end: this.position,
      line: startLine,
      column: startColumn
    };

    this.addToken(token);
  }


  private handleEndTag(): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    
    this.advance(); // Skip '</'
    const name = this.readTagName();

    if (!name) {
      this.reportError('Invalid end tag name', start, this.position);
      return;
    }

    this.skipWhitespace();
    if (this.peek() === '>') {
      this.advance();
      this.addToken({
        type: 'EndTag',
        name: name.toLowerCase(),
        start,
        end: this.position,
        line: startLine,
        column: startColumn
      });
    } else {
      this.reportError('Expected ">" at end of end tag', start, this.position);
    }
  }

  private processAdvancedTokens(): HTMLToken[] {
    return this.tokens.map(token => {
      if (token.type === 'Text') {
        return {
          ...token,
          content: token.content.trim(),
          isWhitespace: /^\s*$/.test(token.content)
        };
      }
      return token;
    });
  }
  
  private handleComment() {
    const start = this.position;
    this.advance(); // Skip '<!'
    let content = '';

    while (this.position < this.input.length && !this.match('-->')) {
      content += this.advance();
    }
    this.advance(); // Skip '-->'

    this.tokens.push({
      type: 'Comment',
      data: content.trim(),
      line: this.line,
      column: this.column,
      start,
      end: this.position,
    });
  }

  private handleConditionalComment() {
    const start = this.position;
    this.advance(); // Skip '<!--'
    let content = '';

    while (this.position < this.input.length && !this.match('-->')) {
      content += this.advance();
    }
    this.advance(); // Skip '-->'

    this.tokens.push({
      type: 'ConditionalComment',
      condition: '',
      content,
      line: this.line,
      column: this.column,
      start,
      end: this.position,
    });
  }
  private handleDoctype() {
    const start = this.position;
    this.advance(); // Skip '<!DOCTYPE'
    this.skipWhitespace();

    const name = this.readTagName();
    this.tokens.push({
      type: 'Doctype',
      name,
      line: this.line,
      column: this.column,
      start,
      end: this.position,
    });
  }

  private readTagName(): string {
    let name = '';
    while (this.position < this.input.length) {
      const char = this.peek();
      if (!/[a-zA-Z0-9:-]/.test(char)) break;
      name += this.advance();
    }
    return name;
  }

  private handleText(): void {
    const start = this.position;
    const startLine = this.line;
    const startColumn = this.column;
    let content = '';

    while (this.position < this.input.length) {
      const char = this.peek();
      if (char === '<') break;
      content += this.advance();
    }

    const isWhitespace = /^\s*$/.test(content);
    
    // Always create text tokens, but mark whitespace appropriately
    this.addToken({
      type: 'Text',
      content,
      isWhitespace,
      start,
      end: this.position,
      line: startLine,
      column: startColumn
    });
  }
  private readAttributeValue(): string {
    const quote = this.peek();
    if (quote === '"' || quote === "'") {
      this.advance();
      let value = '';
      
      while (this.position < this.input.length) {
        if (this.peek() === quote) {
          this.advance();
          break;
        }
        value += this.advance();
      }
      
      return value;
    }

    // Unquoted attribute value
    let value = '';
    while (this.position < this.input.length) {
      const char = this.peek();
      if (/[\s>]/.test(char)) break;
      value += this.advance();
    }
    
    return value;
  }

  private readQuotedString(): string {
    const quote = this.peek();
    if (quote !== '"' && quote !== "'") {
      return '';
    }

    this.advance();
    let value = '';
    
    while (this.position < this.input.length) {
      if (this.peek() === quote) {
        this.advance();
        break;
      }
      value += this.advance();
    }
    
    return value;
  }

  private hasUnclosedTags(): boolean {
    // Check if there are any unclosed tags in the tokens
    const stack: string[] = [];
    for (const token of this.tokens) {
      if (token.type === 'StartTag' && !token.selfClosing) {
        stack.push(token.name);
      } else if (token.type === 'EndTag') {
        if (stack.length > 0 && stack[stack.length - 1] === token.name) {
          stack.pop();
        }
      }
    }
    return stack.length > 0;
  }

  private handleCDATA() {
    const start = this.position;
    this.advance(); // Skip '<![CDATA['
    let content = '';

    while (this.position < this.input.length && !this.match(']]>')) {
      content += this.advance();
    }
    this.advance(); // Skip ']]>'

    this.tokens.push({
      type: 'CDATA',
      content,
      line: this.line,
      column: this.column,
      start,
      end: this.position,
    });
  }

 

  private addToken(token: HTMLToken): void {
    this.tokens.push(token);
  }



  private isAlphaNumeric(char: string): boolean {
    return /[a-zA-Z0-9]/.test(char);
  }

  private peek(offset: number = 0): string {
    return this.input[this.position + offset] || '';
  }

  private match(str: string): boolean {
    return this.input.startsWith(str, this.position);
  }

  private skipWhitespace() {
    while (this.isWhitespace(this.input[this.position])) {
      this.advance();
    }
  }

  private isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }

  
  private advance(): string {
    const char = this.input[this.position];
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    this.position++;
    return char;
  }

  private addError(message: string, start: number) {
    this.errors.push({
      message,
      line: this.line,
      column: this.column,
      severity: "error",
      start,
      end: this.position
    });
  }
  private reportError(
    message: string,
    start: number,
    end: number,
    severity: TokenizerError['severity'] = 'error'
  ): void {
    this.errors.push({
      message,
      severity,
      start,
      end,
      line: this.line,
      column: this.column
    });
  }
}
