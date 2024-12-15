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

    while (this.position < this.input.length) {
      const location = this.getCurrentLocation();
      const char = this.peek();

      if (char === '<') {
        if (this.input.startsWith('<!--', this.position)) {
          tokens.push(this.readComment());
        } else if (this.input.startsWith('<!DOCTYPE', this.position)) {
          tokens.push(this.readDoctype());
        } else if (this.peek(1) === '/') {
          tokens.push(this.readEndTag());
        } else {
          tokens.push(this.readStartTag());
        }
      } else {
        const textToken = this.readText();
        if (textToken.value && textToken.value.trim()) {
          tokens.push(textToken);
        }
      }
    }

    return tokens;
  }

  private readStartTag(): DOMXMLToken {
    const location = this.getCurrentLocation();
    this.consume(); // Skip '<'
    const name = this.readUntil(/[\s\/>]/);
    const attributes = this.readAttributes();
    let selfClosing = false;

    this.skipWhitespace();
    if (this.peek() === '/') {
      selfClosing = true;
      this.consume(); // Skip '/'
    } else if (name && DOMXMLTokenizer.VOID_ELEMENTS.has(name.toLowerCase())) {
      selfClosing = true;
    }

    if (this.peek() === '>') {
      this.consume(); // Skip '>'
    }

    return {
      type: 'StartTag',
      name,
      attributes,
      selfClosing,
      location
    };
  }

  private readEndTag(): DOMXMLToken {
    const location = this.getCurrentLocation();
    this.consume(); // Skip '<'
    this.consume(); // Skip '/'
    const name = this.readUntil('>');
    this.consume(); // Skip '>'

    return {
      type: 'EndTag',
      name: name.trim(),
      location
    };
  }

  private readAttributes(): Record<string, string> {
    const attributes: Record<string, string> = {};

    while (this.position < this.input.length) {
      this.skipWhitespace();
      
      if (this.peek() === '>' || this.peek() === '/' || !this.peek()) {
        break;
      }

      const name = this.readUntil(/[\s=\/>]/);
      if (!name) break;

      this.skipWhitespace();
      let value = '';
      
      if (this.peek() === '=') {
        this.consume(); // Skip '='
        this.skipWhitespace();
        
        const quote = this.peek();
        if (quote === '"' || quote === "'") {
          this.consume(); // Skip opening quote
          value = this.readUntil(quote);
          this.consume(); // Skip closing quote
        } else {
          value = this.readUntil(/[\s>]/);
        }
      } else {
        value = 'true'; // Boolean attribute
      }

      attributes[name] = value;
    }

    return attributes;
  }

  private readText(): DOMXMLToken {
    const location = this.getCurrentLocation();
    const value = this.readUntil('<');

    return {
      type: 'Text',
      value,
      location
    };
  }

  private readComment(): DOMXMLToken {
    const location = this.getCurrentLocation();
    this.position += 4; // Skip '<!--'
    const value = this.readUntil('-->');
    this.position += 3; // Skip '-->'

    return {
      type: 'Comment',
      value: value.trim(),
      location
    };
  }

  private readDoctype(): DOMXMLToken {
    const location = this.getCurrentLocation();
    this.position += 9; // Skip '<!DOCTYPE'
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