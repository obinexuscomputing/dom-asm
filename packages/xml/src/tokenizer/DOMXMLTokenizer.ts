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
        if (textContent.trim()) {
          tokens.push({
            type: 'Text',
            value: textContent.trim(),
            location: textStart!,
          });
        }
        textContent = '';
        textStart = null;

        // Process different types of tags
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
        if (!textStart) textStart = { ...currentPosition };
        textContent += this.consume();
      }
    }

    if (textContent.trim()) {
      tokens.push({
        type: 'Text',
        value: textContent.trim(),
        location: textStart!,
      });
    }

    return tokens;
  }

  private readStartTag(startLocation: { line: number; column: number }): DOMXMLToken {
    this.consume(); // Skip '<'
    const name = this.readTagName();
    const attributes = this.readAttributes();
    let selfClosing = false;

    this.skipWhitespace();
    if (this.peek() === '/') {
      selfClosing = true;
      this.consume();
    }

    if (this.peek() === '>') this.consume();

    return {
      type: 'StartTag',
      name,
      attributes,
      selfClosing,
      location: startLocation,
    };
  }

  private readEndTag(startLocation: { line: number; column: number }): DOMXMLToken {
    this.consumeSequence(2); // Skip '</'
    const name = this.readTagName();
    this.skipWhitespace();
    if (this.peek() === '>') this.consume();

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
}
