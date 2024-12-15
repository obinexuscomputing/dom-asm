export type HTMLToken = 
  | { type: "StartTag"; name: string; attributes: Record<string, string> }
  | { type: "EndTag"; name: string }
  | { type: "Text"; value: string }
  | { type: "Comment"; value: string };

export class HTMLTokenizer {
  private input: string;
  private position: number = 0;

  constructor(input: string) {
    this.input = input;
  }

  public tokenize(): HTMLToken[] {
    const tokens: HTMLToken[] = [];
    while (this.position < this.input.length) {
      const char = this.input[this.position];

      if (char === '<') {
        if (this.input.startsWith('<!--', this.position)) {
          tokens.push(this.readComment());
        } else if (this.input[this.position + 1] === '/') {
          tokens.push(this.readEndTag());
        } else {
          tokens.push(this.readStartTag());
        }
      } else {
        tokens.push(this.readText());
      }
    }
    return tokens;
  }

  private readStartTag(): HTMLToken {
    this.position++; // Skip '<'
    const name = this.readUntil(/[ \/>]/);
    const attributes: Record<string, string> = {};

    while (this.position < this.input.length && this.input[this.position] !== '>') {
      const attrName = this.readUntil('=').trim();
      this.position++; // Skip '='
      const quote = this.input[this.position];
      this.position++; // Skip opening quote
      const attrValue = this.readUntil(new RegExp(`${quote}`));
      attributes[attrName] = attrValue;
      this.position++; // Skip closing quote
    }

    this.position++; // Skip '>'
    return { type: "StartTag", name, attributes };
  }

  private readEndTag(): HTMLToken {
    this.position += 2; // Skip '</'
    const name = this.readUntil('>');
    this.position++; // Skip '>'
    return { type: "EndTag", name };
  }

  private readComment(): HTMLToken {
    this.position += 4; // Skip '<!--'
    const value = this.readUntil('-->');
    this.position += 3; // Skip '-->'
    return { type: "Comment", value };
  }

  private readText(): HTMLToken {
    const value = this.readUntil('<');
    return { type: "Text", value };
  }

  private readUntil(stop: string | RegExp): string {
    const start = this.position;
    while (
      this.position < this.input.length &&
      !(typeof stop === "string" ? this.input[this.position] === stop : stop.test(this.input[this.position]))
    ) {
      this.position++;
    }
    return this.input.slice(start, this.position);
  }
}
