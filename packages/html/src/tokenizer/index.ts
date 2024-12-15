export interface HTMLToken {
  type: "StartTag" | "EndTag" | "Text" | "Comment";
  name?: string; // For StartTag or EndTag
  value?: string; // For Text or Comment
  attributes?: Record<string, string>; // For StartTag
}

export class HTMLTokenizer {
  private input: string;
  private position: number;

  constructor(input: string) {
    this.input = input;
    this.position = 0;
  }

  public tokenize(): HTMLToken[] {
    const tokens: HTMLToken[] = [];

    while (this.position < this.input.length) {
      const char = this.input[this.position];

      if (char === "<") {
        if (this.input[this.position + 1] === "/") {
          tokens.push(this.readEndTag());
        } else if (this.input[this.position + 1] === "!") {
          tokens.push(this.readComment());
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

    while (this.input[this.position] !== ">" && this.input[this.position] !== "/") {
      const attrName = this.readUntil("=").trim();
      this.position++; // Skip '='
      const quote = this.input[this.position];
      this.position++; // Skip opening quote
      const attrValue = this.readUntil(new RegExp(`${quote}`));
      attributes[attrName] = attrValue;
      this.position++; // Skip closing quote
    }

    if (this.input[this.position] === "/") {
      this.position++; // Skip '/'
    }

    this.position++; // Skip '>'
    return { type: "StartTag", name, attributes };
  }

  private readEndTag(): HTMLToken {
    this.position += 2; // Skip '</'
    const name = this.readUntil(">");
    this.position++; // Skip '>'
    return { type: "EndTag", name };
  }

  private readComment(): HTMLToken {
    this.position += 4; // Skip '<!--'
    const value = this.readUntil("-->");
    this.position += 3; // Skip '-->'
    return { type: "Comment", value };
  }

  private readText(): HTMLToken {
    const value = this.readUntil("<");
    return { type: "Text", value };
  }

  private readUntil(stopChar: string | RegExp): string {
    const start = this.position;
    while (
      this.position < this.input.length &&
      !(typeof stopChar === "string" ? this.input[this.position] === stopChar : stopChar.test(this.input[this.position]))
    ) {
      this.position++;
    }
    return this.input.slice(start, this.position);
  }
}
