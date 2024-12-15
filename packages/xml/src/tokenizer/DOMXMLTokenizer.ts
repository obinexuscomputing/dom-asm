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
  private static readonly VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  public tokenize(): DOMXMLToken[] {
    const tokens: DOMXMLToken[] = [];
    let textStart: { line: number; column: number } | null = null;
    let textContent = '';

    while (this.position < this.input.length) {
      const char = this.peek();

      if (char === '<') {
        // Handle any accumulated text before processing tag
        if (textContent) {
          const trimmed = textContent.trim();
          if (trimmed) {
            tokens.push({
              type: 'Text',
              value: trimmed,
              location: textStart!
            });
          }
          textContent = '';
          textStart = null;
        }

        const tagStart = this.getCurrentLocation();
        
        if (this.matches('<!--')) {
          tokens.push(this.readComment());
        } else if (this.matches('<!DOCTYPE')) {
          tokens.push(this.readDoctype());
        } else if (this.peek(1) === '/') {
          tokens.push(this.readEndTag(tagStart));
        } else {
          tokens.push(this.readStartTag(tagStart));
        }
      } else {
        if (!textStart) {
          textStart = this.getCurrentLocation();
        }
        textContent += this.consume();
      }
    }

    // Handle any remaining text
    if (textContent && textContent.trim()) {
      tokens.push({
        type: 'Text',
        value: textContent.trim(),
        location: textStart!
      });
    }

    return tokens;
  }

  private readStartTag(location: { line: number; column: number }): DOMXMLToken {
    this.consume(); // Skip '<'
    const name = this.readTagName();
    const attributes = this.readAttributes();
    let selfClosing = false;

    this.skipWhitespace();
    if (this.peek() === '/') {
      selfClosing = true;
      this.consume();
    } else if (name && DOMXMLTokenizer.VOID_ELEMENTS.has(name.toLowerCase())) {
      selfClosing = true;
    }

    if (this.peek() === '>') {
      this.consume();
    }

    return {
      type: 'StartTag',
      name,
      attributes,
      selfClosing,
      location
    };
  }

  private readEndTag(location: { line: number; column: number }): DOMXMLToken {
    this.consumeSequence(2); // Skip '</'
    const name = this.readTagName();
    this.skipWhitespace();
    if (this.peek() === '>') {
      this.consume();
    }

    return {
      type: 'EndTag',
      name,
      location
    };
  }

  private readTagName(): string {
    return this.readWhile(char => this.isNameChar(char));
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

      let value: string;
      this.skipWhitespace();
      
      if (this.peek() === '=') {
        this.consume(); // Skip '='
        this.skipWhitespace();
        value = this.readAttributeValue();
      } else {
        value = name; // For boolean attributes, use the name as the value
      }

      attributes[name] = value;
    }

    return attributes;
  }

  private readAttributeName(): string {
    return this.readWhile(char => this.isNameChar(char));
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

  private readComment(): DOMXMLToken {
    const location = this.getCurrentLocation();
    this.consumeSequence(4); // Skip '<!--'
    const value = this.readUntil('-->');
    this.consumeSequence(3); // Skip '-->'
    return {
      type: 'Comment',
      value: value.trim(),
      location
    };
  }

  private readDoctype(): DOMXMLToken {
    const location = this.getCurrentLocation();
    this.consumeSequence(9); // Skip '<!DOCTYPE'
    this.skipWhitespace();
    const value = this.readUntil('>');
    this.consume(); // Skip '>'
    return {
      type: 'Doctype',
      value: value.trim(),
      location
    };
  }
}