type Token = 
  | { type: 'StartTag'; name: string; attributes: Record<string, string> }
  | { type: 'EndTag'; name: string }
  | { type: 'Text'; value: string }
  | { type: 'Comment'; value: string };

/**
 * import { HTMLTokenizer } from "./tokenizer/index";
import { AST } from "./ast/index";

const htmlInput = `
<html:html>
  <html:head>
    <html:title>Sample HTML6 Document</html:title>
  </html:head>
  <html:body>
    <html:media type="image" src="logo.png" />
    <html:p>This is a sample document.</html:p>
  </html:body>
</html:html>
`;

const tokenizer = new HTMLTokenizer(htmlInput);
const tokens = tokenizer.tokenize();

console.log("Tokens:", tokens);

const astBuilder = new AST();
const ast = astBuilder.buildAST(tokens);

console.log("AST:");
astBuilder.printAST();

 */
class HTMLTokenizer {
  private input: string;
  private position: number = 0;

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.position < this.input.length) {
      const char = this.input[this.position];

      if (char === '<') {
        if (this.input[this.position + 1] === '/') {
          tokens.push(this.readEndTag());
        } else if (this.input[this.position + 1] === '!') {
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

  private readStartTag(): Token {
    this.position++; // Skip '<'
    const name = this.readUntil(/[ \/>]/);
    const attributes: Record<string, string> = {};

    while (this.input[this.position] !== '>' && this.input[this.position] !== '/') {
      const attrName = this.readUntil('=').trim();
      this.position++; // Skip '='
      const quote = this.input[this.position];
      this.position++; // Skip opening quote
      const attrValue = this.readUntil(new RegExp(`${quote}`));
      attributes[attrName] = attrValue;
      this.position++; // Skip closing quote
    }

    if (this.input[this.position] === '/') {
      this.position++; // Skip '/'
    }

    this.position++; // Skip '>'
    return { type: 'StartTag', name, attributes };
  }

  private readEndTag(): Token {
    this.position += 2; // Skip '</'
    const name = this.readUntil('>');
    this.position++; // Skip '>'
    return { type: 'EndTag', name };
  }

  private readComment(): Token {
    this.position += 4; // Skip '<!--'
    const value = this.readUntil('-->');
    this.position += 3; // Skip '-->'
    return { type: 'Comment', value };
  }

  private readText(): Token {
    const value = this.readUntil('<');
    return { type: 'Text', value };
  }

  private readUntil(stopChar: string | RegExp): string {
    const start = this.position;
    while (
      this.position < this.input.length &&
      !(typeof stopChar === 'string' ? this.input[this.position] === stopChar : stopChar.test(this.input[this.position]))
    ) {
      this.position++;
    }
    return this.input.slice(start, this.position);
  }
}

// Exporting the tokenizer class for usage in the `dom-html` library.
export { HTMLTokenizer, Token };
