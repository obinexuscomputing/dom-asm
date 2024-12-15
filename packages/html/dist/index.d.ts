interface HTMLASTNode {
    type: "Element" | "Text" | "Comment";
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

type HTMLToken = {
    type: "StartTag";
    name: string;
    attributes: Record<string, string>;
} | {
    type: "EndTag";
    name: string;
} | {
    type: "Text";
    value: string;
} | {
    type: "Comment";
    value: string;
};
declare class HTMLTokenizer {
    private input;
    private position;
    constructor(input: string);
    tokenize(): HTMLToken[];
    private readStartTag;
    private readEndTag;
    private readComment;
    private readText;
    private readUntil;
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

declare class HTMLCodeGenerator {
    private selfClosingTags;
    constructor(selfClosingTags?: string[]);
    generateHTML(node: HTMLASTNode): string;
    private generateAttributes;
    private isSelfClosingTag;
}

declare class HTMLParserError extends Error {
    token: HTMLToken;
    position: number;
    constructor(message: string, token: HTMLToken, position: number);
}
interface HTMLElementNode {
    type: "Element";
    name: string;
    attributes: Record<string, string>;
    children: HTMLASTNode[];
}
interface HTMLTextNode {
    type: "Text";
    value: string;
}
interface HTMLCommentNode {
    type: "Comment";
    value: string;
}
declare class HTMLParser {
    private tokenizer;
    constructor();
    parse(input: string): HTMLASTNode;
    private buildAST;
}

export { type HTMLAST, type HTMLASTNode, HTMLCodeGenerator, type HTMLCommentNode, type HTMLElementNode, HTMLParser, HTMLParserError, type HTMLTextNode, type HTMLToken, HTMLTokenizer, type HTMLValidationResult, HTMLValidator };
