// src/tokenizer/DOMXMLTokenizer.ts
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
  public tokenize(): DOMXMLToken[] {
    const tokens: DOMXMLToken[] = [];

    while (this.position < this.input.length) {
      const location = this.getCurrentLocation();
      
      if (this.peek() === '<') {
        if (this.peek(1) === '!') {
          if (this.input.startsWith('<!--', this.position)) {
            const token = this.readComment();
            tokens.push({ ...token, location });
          } else if (this.input.startsWith('<!DOCTYPE', this.position)) {
            const token = this.readDoctype();
            tokens.push({ ...token, location });
          }
        } else if (this.peek(1) === '/') {
          const token = this.readEndTag();
          tokens.push({ ...token, location });
        } else {
          const token = this.readStartTag();
          tokens.push({ ...token, location });
        }
      } else {
        const token = this.readText();
        if (token.value && token.value.trim()) {
          tokens.push({ ...token, location });
        }
      }
    }

    return tokens;
  }

  private readStartTag(): DOMXMLToken {
    this.consume(); // Skip '<'
    const tagName = this.readUntil(/[\s\/>]/);
    const attributes: Record<string, string> = {};
    let selfClosing = false;

    this.readAttributes(attributes);

    // Check for self-closing tag
    this.skipWhitespace();
    if (this.peek() === '/') {
      selfClosing = true;
      this.consume(); // Skip '/'
    }
    this.consume(); // Skip '>'

    return {
      type: 'StartTag',
      name: tagName,
      attributes,
      selfClosing,
      location: this.getCurrentLocation()
    };
  }

  private readEndTag(): DOMXMLToken {
    this.consume(); // Skip '<'
    this.consume(); // Skip '/'
    const tagName = this.readUntil(/[\s>]/);
    this.skipWhitespace();
    this.consume(); // Skip '>'

    return {
      type: 'EndTag',
      name: tagName,
      location: this.getCurrentLocation()
    };
  }

  private readText(): DOMXMLToken {
    return {
      type: 'Text',
      value: this.readUntil('<'),
      location: this.getCurrentLocation()
    };
  }

  private readComment(): DOMXMLToken {
    this.consume(); // Skip '<'
    this.consume(); // Skip '!'
    this.consume(); // Skip '-'
    this.consume(); // Skip '-'
    
    const value = this.readUntil('-->');
    this.consume(); // Skip '-'
    this.consume(); // Skip '-'
    this.consume(); // Skip '>'

    return {
      type: 'Comment',
      value,
      location: this.getCurrentLocation()
    };
  }

  private readDoctype(): DOMXMLToken {
    this.consume(); // Skip '<'
    this.consume(); // Skip '!'
    this.readUntil(/\s/); // Skip 'DOCTYPE'
    this.skipWhitespace();
    
    const value = this.readUntil('>');
    this.consume(); // Skip '>'

    return {
      type: 'Doctype',
      value: value.trim(),
      location: this.getCurrentLocation()
    };
  }

  private readAttributes(attributes: Record<string, string>): void {
    while (this.position < this.input.length) {
      this.skipWhitespace();
      
      if (this.peek() === '>' || this.peek() === '/' || this.peek() === undefined) {
        break;
      }

      const name = this.readUntil(/[\s=>/]/);
      if (!name) break;

      let value = '';
      this.skipWhitespace();
      
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
  }
}