type HTMLToken = {
    type: "Doctype";
    value: string;
    line: number;
    column: number;
} | {
    type: "StartTag";
    name: string;
    attributes: Record<string, string>;
    selfClosing: boolean;
    line: number;
    column: number;
} | {
    type: "EndTag";
    name: string;
    line: number;
    column: number;
} | {
    type: "Text";
    value: string;
    line: number;
    column: number;
} | {
    type: "Comment";
    value: string;
    line: number;
    column: number;
};
declare class HTMLTokenizer {
    private input;
    private position;
    private line;
    private column;
    constructor(input: string);
    tokenize(): HTMLToken[];
    private readDoctype;
    private readStartTag;
    private readEndTag;
    private readComment;
    private readText;
    private readUntil;
    private peek;
    private match;
    private matches;
    private consume;
    private skipWhitespace;
    private getCurrentLocation;
}

interface HTMLASTNode {
    type: "Element" | "Text" | "Comment" | "Doctype";
    name?: string;
    value?: string;
    attributes?: Record<string, string>;
    children?: HTMLASTNode[];
}
interface HTMLAST {
    root: HTMLASTNode;
    metadata?: {
        nodeCount: number;
        elementCount: number;
        textCount: number;
        commentCount: number;
    };
}

declare class HTMLParser {
    private tokenizer;
    constructor();
    parse(input: string): HTMLASTNode;
    private buildAST;
}

/**
 * import { HTMLTokenizer } from "./tokenizer/index";
import { AST } from "./ast/index";
import { Validator } from "./validator/index";

const htmlInput = `
<html:html>
  <html:head>
    <html:title>Sample HTML6 Document</html:title>
  </html:head>
  <html:body>
    <html:media src="logo.png" type="image" />
    <html:p>This is a sample document.</html:p>
    <invalid:tag>Oops!</invalid:tag>
  </html:body>
</html:html>
`;

const tokenizer = new HTMLTokenizer(htmlInput);
const tokens = tokenizer.tokenize();

const astBuilder = new AST();
const ast = astBuilder.buildAST(tokens);

const validator = new Validator();
const validationResult = validator.validateAST(ast);

if (validationResult.valid) {
  console.log("The document is valid.");
} else {
  console.error("Validation errors:");
  validationResult.errors.forEach((error) => console.error(error));
}

 */

interface HTMLValidationResult {
    valid: boolean;
    errors: string[];
}
declare class HTMLValidator {
    validate(ast: HTMLASTNode): HTMLValidationResult;
    private traverse;
}

declare class HTMLASTOptimizer {
    optimize(ast: HTMLAST): HTMLAST;
    private removeEmptyNodes;
    private mergeTextNodes;
}

declare class HTMLCodeGenerator {
    private selfClosingTags;
    constructor(selfClosingTags?: string[]);
    generateHTML(node: HTMLASTNode): string;
    private generateAttributes;
    private isSelfClosingTag;
}

export { HTMLASTOptimizer, HTMLCodeGenerator, HTMLParser, HTMLTokenizer, HTMLValidator };
