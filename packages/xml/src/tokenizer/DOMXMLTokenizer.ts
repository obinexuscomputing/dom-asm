import { XMLBaseTokenizer } from './XMLBaseTokenizer';

export interface DOMXMLToken {
  type: 'StartTag' | 'EndTag' | 'Text' | 'Comment' | 'Doctype';
  name?: string;
  value?: string;
  attributes?: Record<string, string>;
  selfClosing?: boolean;
  location: { line: number; column: number };
}

export class DOMXMLTokenizer extends XMLBaseTokenizer {
  constructor(input: string) {
    super(input);
  }
  

  public tokenize(): DOMXMLToken[] {
    const tokens: DOMXMLToken[] = [];
    let textStart: { line: number; column: number } | null = null;
    let textContent = '';

    while (this.position < this.input.length) {
      const char = this.peek();
      const currentPosition = { line: this.line, column: this.column };

      if (char === '<') {
        // Flush accumulated text content
        if (textContent.trim()) {
          tokens.push({
            type: 'Text',
            value: textContent.trim(),
            location: textStart!,
          });
        }
        textContent = '';
        textStart = null;

        // Process tags
        if (this.matches('<!--')) {
          tokens.push(this.readComment(currentPosition));
        } else if (this.matches('<!DOCTYPE')) {
          tokens.push(this.readDoctype(currentPosition));
        } else if (this.peek(1) === '/') {
          tokens.push(this.readEndTag(currentPosition));
        } else {
          tokens.push(this.readStartTag(currentPosition));
        }
      } else {
        // Accumulate text content
        if (!textStart) {
          textStart = { ...currentPosition };
        }
        textContent += this.consume();
      }
    }

    // Add remaining text content
    if (textContent.trim()) {
      tokens.push({
        type: 'Text',
        value: textContent.trim(),
        location: textStart!,
      });
    }

    return tokens;
  }
  public readText(): DOMXMLToken {
    const startLocation = this.getCurrentLocation();
    const value = this.readUntil('<', { includeStop: false }); // Stop before the next tag
  
    return {
      type: 'Text',
      value: value.trim(),
      location: startLocation, // Correct start position of the text
    };
  }
  
  private readStartTag(startLocation: { line: number; column: number }): DOMXMLToken {
    this.consume(); // Skip '<'
    const name = this.readTagName();
    const attributes = this.readAttributes();
    let selfClosing = false;
  
    this.skipWhitespace();
    if (this.peek() === '/') {
      selfClosing = true;
      this.consume(); // Skip '/'
    }
    if (this.peek() === '>') {
      this.consume(); // Skip '>'
    }
  
    return {
      type: 'StartTag',
      name,
      attributes,
      selfClosing,
      location: startLocation, // Correctly tracks initial position
    };
  }
  
  
  private readEndTag(startLocation: { line: number; column: number }): DOMXMLToken {
    this.consumeSequence(2); // Skip '</'
    const name = this.readTagName();
    this.skipWhitespace();
    if (this.peek() === '>') {
      this.consume();
    }

    return {
      type: 'EndTag',
      name,
      location: startLocation,
    };
  }

  private readComment(startLocation: { line: number; column: number }): DOMXMLToken {
    this.consumeSequence(4); // Skip '<!--'
    const value = this.readUntil('-->');
    this.consumeSequence(3); // Skip '-->'
    return {
      type: 'Comment',
      value: value.trim(),
      location: startLocation,
    };
  }

  private readDoctype(startLocation: { line: number; column: number }): DOMXMLToken {
    this.consumeSequence(9); // Skip '<!DOCTYPE'
    this.skipWhitespace();
    const value = this.readUntil('>');
    this.consume(); // Skip '>'
    return {
      type: 'Doctype',
      value: value.trim(),
      location: startLocation,
    };
  }

  private readAttributes(): Record<string, string> {
    const attributes: Record<string, string> = {};

    while (this.position < this.input.length) {
      this.skipWhitespace();
      if (this.peek() === '>' || this.peek() === '/' || !this.peek()) {
        break;
      }

      const name = this.readAttributeName();
      if (!name) break;

      this.skipWhitespace();
      if (this.peek() === '=') {
        this.consume(); // Skip '='
        this.skipWhitespace();
        attributes[name] = this.readAttributeValue();
      } else {
        attributes[name] = 'true'; // Boolean attribute
      }
    }

    return attributes;
  }
  
  private readTagName(): string {
    return this.readWhile((char) => this.isNameChar(char));
  }

  private readAttributeName(): string {
    return this.readWhile((char) => this.isNameChar(char));
  }

  private readAttributeValue(): string {
    const quote = this.peek();
    if (quote === '"' || quote === "'") {
      this.consume(); // Skip opening quote
      const value = this.readUntil(quote);
      this.consume(); // Skip closing quote
      return value;
    }
    return this.readUntil(/[\s>\/]/);
  }
}
