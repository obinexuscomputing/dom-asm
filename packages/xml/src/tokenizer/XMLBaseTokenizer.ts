export abstract class XMLBaseTokenizer {
  protected input: string;
  protected position: number;
  protected line: number;
  protected column: number;
  protected type: string | undefined;

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

  protected peekSequence(length: number): string {
    return this.input.slice(this.position, this.position + length);
  }

  protected matches(str: string): boolean {
    return this.input.startsWith(str, this.position);
  }
  protected consume(): string {
    const char = this.peek();
    if (char === '\n') {
      this.line++;
      this.column = 1; // Reset column on a new line
    } else {
      this.column++;
    }
    this.position++;
    return char;
  }
  
  
  protected consumeSequence(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += this.consume();
    }
    return result;
  }
  
  protected readUntil(
    stop: string | RegExp,
    options: { escape?: boolean; includeStop?: boolean; skipStop?: boolean } = {}
  ): string {
    const { escape = false, includeStop = false, skipStop = true } = options;
    let result = '';
    let escaped = false;
  
    while (this.position < this.input.length) {
      const current = this.peek();
  
      // Handle escape sequences if `escape` is enabled
      if (escape && current === '\\' && !escaped) {
        escaped = true;
        result += this.consume();
        continue;
      }
  
      const matches =
        typeof stop === 'string' ? this.matches(stop) : stop.test(current);
  
      // Check for the stop condition
      if (!escaped && matches) {
        if (includeStop) {
          if (typeof stop === 'string') {
            result += this.consumeSequence(stop.length); // Consume the stop string
          } else {
            result += this.consume(); // Consume the matching character
          }
        } else if (skipStop) {
          this.position += typeof stop === 'string' ? stop.length : 1; // Skip the stop character(s)
        }
        break; // Exit the loop once the stop condition is met
      }
  
      // Append the current character to the result
      result += this.consume();
      escaped = false; // Reset escape flag after consuming a character
    }
  
    return result;
  }
  

  protected readWhile(predicate: (char: string, index: number) => boolean): string {
    let result = '';
    let index = 0;
    
    while (this.position < this.input.length && predicate(this.peek(), index)) {
      result += this.consume();
      index++;
    }
    
    return result;
  }

  protected skipWhitespace(): void {
    this.readWhile(char => /\s/.test(char));
  }

  protected getCurrentLocation(): { line: number; column: number } {
    return { line: this.line, column: this.column };
  }

  protected isNameChar(char: string): boolean {
    return /[a-zA-Z0-9_\-:]/.test(char);
  }

  protected isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  protected isIdentifierPart(char: string): boolean {
    return /[a-zA-Z0-9_\-]/.test(char);
  }

  protected readIdentifier(): string {
    if (!this.isIdentifierStart(this.peek())) {
      return '';
    }
    return this.readWhile((char, index) => 
      index === 0 ? this.isIdentifierStart(char) : this.isIdentifierPart(char)
    );
  }

  protected readQuotedString(): string {
    const quote = this.peek();
    if (quote !== '"' && quote !== "'") {
      return '';
    }

    this.consume(); // Skip opening quote
    const value = this.readUntil(quote, { escape: true });
    this.consume(); // Skip closing quote
    return value;
  }

  protected hasMore(): boolean {
    return this.position < this.input.length;
  }

  protected addError(message: string): void {
    const location = this.getCurrentLocation();
    console.error(`Error at line ${location.line}, column ${location.column}: ${message}`);
  }

  protected saveState(): { position: number; line: number; column: number } {
    return {
      position: this.position,
      line: this.line,
      column: this.column
    };
  }

  protected restoreState(state: { position: number; line: number; column: number }): void {
    this.position = state.position;
    this.line = state.line;
    this.column = state.column;
  }
}