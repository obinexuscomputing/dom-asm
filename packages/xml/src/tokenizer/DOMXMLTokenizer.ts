export type DOMXMLToken =
  | { type: "StartTag"; name: string; attributes: Record<string, string>; selfClosing: boolean }
  | { type: "EndTag"; name: string }
  | { type: "Text"; value: string }
  | { type: "Comment"; value: string }
  | { type: "Doctype"; value: string };

import { BaseTokenizer } from "../BaseTokenizer";

export class DOMXMLTokenizer extends BaseTokenizer {
  public tokenize(): DOMXMLToken[] {
    const tokens: DOMXMLToken[] = [];

    while (this.position < this.input.length) {
      const char = this.input[this.position];

      if (char === "<") {
        if (this.input.startsWith("<!--", this.position)) {
          tokens.push(this.readComment());
        } else if (this.input.startsWith("<!DOCTYPE", this.position)) {
          tokens.push(this.readDoctype());
        } else if (this.input[this.position + 1] === "/") {
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

  private readStartTag(): DOMXMLToken {
    this.position++; // Skip '<'
    const name = this.readUntil(/[ \/>]/).trim();
    const attributes: Record<string, string> = {};
    let selfClosing = false;

    while (this.position < this.input.length && this.input[this.position] !== ">") {
      if (this.input[this.position] === "/") {
        selfClosing = true;
        this.position++;
        break;
      }

      const attrName = this.readUntil(/[= \/>]/).trim();
      if (this.input[this.position] === "=") {
        this.position++; // Skip '='
        const quote = this.input[this.position];
        this.position++; // Skip opening quote
        const attrValue = this.readUntil(new RegExp(`${quote}`));
        attributes[attrName] = attrValue;
        this.position++; // Skip closing quote
      }
    }

    this.position++; // Skip '>'
    return { type: "StartTag", name, attributes, selfClosing };
  }

  private readEndTag(): DOMXMLToken {
    this.position += 2; // Skip '</'
    const name = this.readUntil(">").trim();
    this.position++; // Skip '>'
    return { type: "EndTag", name };
  }

  private readComment(): DOMXMLToken {
    this.position += 4; // Skip '<!--'
    const value = this.readUntil("-->").trim();
    this.position += 3; // Skip '-->'
    return { type: "Comment", value };
  }

  private readDoctype(): DOMXMLToken {
    this.position += 9; // Skip '<!DOCTYPE'
    const value = this.readUntil(">").trim();
    this.position++; // Skip '>'
    return { type: "Doctype", value };
  }

  private readText(): DOMXMLToken {
    const value = this.readUntil("<").trim();
    return { type: "Text", value };
  }
}
