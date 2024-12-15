import { XMLBaseTokenizer } from '../tokenize/XMLBaseTokenizer';

export interface DOMXMLToken {
  type: 'StartTag' | 'EndTag' | 'Text' | 'Comment' | 'Doctype';
  value?: string;
  name?: string;
  namespace?: string;
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
            tokens.push({ ...this.readComment(), location });
          } else if (this.input.startsWith('<!DOCTYPE', this.position)) {
            tokens.push({ ...this.readDoctype(), location });
          }
        } else if (this.peek(1) === '/') {
          tokens.push({ ...this.readEndTag(), location });
        } else {
          tokens.push({ ...this.readStartTag(), location });
        }
      } else {
        const textToken = this.readText();
        if (textToken.value.trim()) {
          tokens.push({ ...textToken, location });
        }
      }
    }

    return tokens;
  }

  private readStartTag(): Omit<DOMXMLToken, 'location'> {
    this.consume(); // Skip '<'
    const nameWithNs = this.readUntil(/[\s\/>]/);
    const [namespace, name] = this.parseNameWithNamespace(nameWithNs);
    const attributes = this.readAttributes();
    let selfClosing = false;

    this.skipWhitespace();
    if (this.peek() === '/') {
      selfClosing = true;
      this.consume(); // Skip '/'
    }
    this.consume(); // Skip '>'

    return {
      type: 'StartTag',
      name,
      namespace,
      attributes,
      selfClosing
    };
  }

  private readEndTag(): Omit<DOMXMLToken, 'location'> {
    this.consume(); // Skip '<'
    this.consume(); // Skip '/'
    const nameWithNs = this.readUntil('>');
    const [namespace, name] = this.parseNameWithNamespace(nameWithNs);
    this.consume(); // Skip '>'

    return {
      type: 'EndTag',
      name,
      namespace
    };
  }

  private readText(): Omit<DOMXMLToken, 'location'> {
    return {
      type: 'Text',
      value: this.readUntil('<')
    };
  }

  private readComment(): Omit<DOMXMLToken, 'location'> {
    this.position += 4; // Skip '<!--'
    const value = this.readUntil('-->');
    this.position += 3; // Skip '-->'
    return {
      type: 'Comment',
      value
    };
  }

  private readDoctype(): Omit<DOMXMLToken, 'location'> {
    this.position += 9; // Skip '<!DOCTYPE'
    const value = this.readUntil('>');
    this.consume(); // Skip '>'
    return {
      type: 'Doctype',
      value
    };
  }

  private readAttributes(): Record<string, string> {
    const attributes: Record<string, string> = {};
    
    while (this.position < this.input.length) {
      this.skipWhitespace();
      
      if (this.peek() === '>' || this.peek() === '/' || this.peek() === undefined) {
        break;
      }

      const nameWithNs = this.readUntil(/[\s=>/]/);
      if (!nameWithNs) break;
      
      const [namespace, name] = this.parseNameWithNamespace(nameWithNs);
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
        }
      }

      const attrName = namespace ? `${namespace}:${name}` : name;
      attributes[attrName] = value;
    }

    return attributes;
  }

  private parseNameWithNamespace(name: string): [string | undefined, string] {
    const parts = name.split(':');
    return parts.length > 1 ? [parts[0], parts[1]] : [undefined, parts[0]];
  }
}