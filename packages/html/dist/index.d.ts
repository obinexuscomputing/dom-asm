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
    private lastTokenEnd;
    constructor(input: string);
    tokenize(): HTMLToken[];
    private isTextToken;
    private isCommentToken;
    private createTextToken;
    private readStartTag;
    private readEndTag;
    private readComment;
    private readDoctype;
    private readTagName;
    private getColumnAtPosition;
    private peek;
    private match;
    private readUntil;
    private consume;
    private skipWhitespace;
    private getCurrentLocation;
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
interface HTMLAST {
    root: HTMLASTNode;
    metadata?: {
        nodeCount: number;
        elementCount: number;
        textCount: number;
        commentCount: number;
    };
}
declare class HTMLASTNode {
    type: "Element" | "Text" | "Comment" | "Doctype";
    name?: string;
    value?: string;
    attributes?: Record<string, string>;
    children: HTMLASTNode[];
    constructor(type: "Element" | "Text" | "Comment" | "Doctype", children?: HTMLASTNode[], options?: {
        name?: string;
        value?: string;
        attributes?: Record<string, string>;
    });
}

declare class HTMLParserError extends Error {
    token: HTMLToken;
    position: number;
    constructor(message: string, token: HTMLToken, position: number);
}
interface HTMLParserOptions {
    throwOnError?: boolean;
    errorHandler?: (error: HTMLParserError) => void;
}
declare class HTMLParser {
    private tokenizer;
    private options;
    constructor(options?: HTMLParserOptions);
    parse(input: string): HTMLAST;
    private buildAST;
    private handleError;
    private computeMetadata;
    setErrorHandler(handler: (error: HTMLParserError) => void): void;
}

type HTMLSpec = 'html5' | 'html6-xml';
interface ValidationOptions {
    spec?: HTMLSpec;
    strictMode?: boolean;
    allowCustomElements?: boolean;
    allowNamespaces?: boolean;
    customNamespaces?: string[];
}
interface HTMLValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
interface ValidationError {
    type: 'error';
    message: string;
    node?: HTMLASTNode;
    code: string;
}
interface ValidationWarning {
    type: 'warning';
    message: string;
    node?: HTMLASTNode;
    code: string;
}
/**
 * const validator = new HTMLValidator({
  spec: 'html6-xml',
  strictMode: true,
  allowCustomElements: true,
  allowNamespaces: true,
  customNamespaces: ['html', 'custom']
});

const result = validator.validate(ast);
if (!result.valid) {
  result.errors.forEach(error => {
    console.error(`${error.code}: ${error.message}`);
  });
  result.warnings.forEach(warning => {
    console.warn(`${warning.code}: ${warning.message}`);
  });
}
 */
declare class HTMLValidator {
    private options;
    private readonly voidElements;
    private readonly flowContent;
    private readonly metadataContent;
    private readonly defaultOptions;
    constructor(options?: ValidationOptions);
    validate(ast: HTMLASTNode): HTMLValidationResult;
    private validateNode;
    private validateElement;
    private validateTagName;
    private validateAttributes;
    private validateContentModel;
    private updateDocumentContext;
    private validateDocumentStructure;
    private isValidHTML5TagName;
    private isValidEventHandler;
    private isValidChild;
}

declare class HTMLCodeGenerator {
    private selfClosingTags;
    constructor(selfClosingTags?: string[]);
    generateHTML(node: HTMLASTNode): string;
    private generateAttributes;
    private isSelfClosingTag;
}

declare class HTMLASTOptimizer {
    optimize(ast: HTMLAST): void;
    private removeEmptyTextNodes;
    private isSignificantWhitespace;
    private mergeTextNodes;
    private shouldPreserveWhitespace;
}

export { type HTMLAST, HTMLASTOptimizer, HTMLCodeGenerator, HTMLParser, HTMLTokenizer, HTMLValidator };
