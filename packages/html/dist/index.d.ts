type Token = {
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
    tokenize(): Token[];
    private readStartTag;
    private readEndTag;
    private readComment;
    private readText;
    private readUntil;
}
//# sourceMappingURL=index.d.ts.map

type ASTNodeType = "Element" | "Text" | "Comment";
interface ASTNode {
    type: ASTNodeType;
    name?: string;
    value?: string;
    attributes?: Record<string, string>;
    children: ASTNode[];
    parent: ASTNode | null;
}
declare class AST {
    private root;
    constructor();
    buildAST(tokens: Token[]): ASTNode;
    getRoot(): ASTNode;
    printAST(node?: ASTNode, depth?: number): void;
}
//# sourceMappingURL=index.d.ts.map

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
type ValidationResult = {
    valid: boolean;
    errors: string[];
};
declare class Validator {
    private namespaceRules;
    private attributeRules;
    private validationCache;
    registerNamespace(namespace: string, tags: string[]): void;
    registerAttributes(tag: string, attributes: string[]): void;
    validateAST(ast: ASTNode): ValidationResult;
    private traverseAST;
    private validateElement;
    private getCacheKey;
}
//# sourceMappingURL=index.d.ts.map

declare class ASTOptimizer {
    optimize(node: ASTNode): ASTNode;
    private removeEmptyNodes;
    private mergeTextNodes;
    private isSelfClosingTag;
}
//# sourceMappingURL=index.d.ts.map

declare class CodeGenerator {
    generateHTML(node: ASTNode): string;
    private generateAttributes;
    private isSelfClosingTag;
}
//# sourceMappingURL=index.d.ts.map

type ErrorHandler = (error: ParserError) => void;
declare class ParserError extends Error {
    token: Token;
    position: number;
    constructor(message: string, token: Token, position: number);
}
declare class Parser {
    private tokenizer;
    private astBuilder;
    private validator;
    private errorHandler;
    private shouldThrow;
    constructor(options?: {
        throwOnError: boolean;
    });
    setErrorHandler(handler: ErrorHandler): void;
    private handleError;
    private isWhitespace;
    parse(input: string): ASTNode;
    private cleanWhitespace;
    private isElementNode;
    private buildASTWithRecovery;
}

export { AST, type ASTNode, CodeGenerator, HTMLTokenizer, ASTOptimizer as Optimizer, Parser, ParserError, Validator };
