interface DOMXMLMetadata {
    nodeCount: number;
    elementCount: number;
    textCount: number;
    commentCount: number;
}
interface DOMXMLASTNode {
    type: "Element" | "Text" | "Comment" | "Doctype";
    name?: string;
    value?: string;
    attributes?: Record<string, string>;
    children?: DOMXMLASTNode[];
}
declare class DOMXMLAST {
    root: DOMXMLASTNode;
    metadata: DOMXMLMetadata;
    constructor(root: DOMXMLASTNode, metadata: DOMXMLMetadata);
    computeMetadata(): DOMXMLMetadata;
    addChildNode(parent: DOMXMLASTNode, child: DOMXMLASTNode): void;
    removeChildNode(parent: DOMXMLASTNode, child: DOMXMLASTNode): void;
}

interface GeneratorOptions {
    indent?: string;
    newLine?: string;
    xmlDeclaration?: boolean;
    prettyPrint?: boolean;
}
declare class DOMXMLGenerator {
    private options;
    constructor(options?: GeneratorOptions);
    generate(ast: DOMXMLAST): string;
    private generateNode;
    private generateElement;
    private generateText;
    private generateComment;
    private generateDoctype;
    private getIndent;
    private escapeText;
    private escapeAttribute;
}

interface ValidationOptions {
    strictMode?: boolean;
    allowUnknownElements?: boolean;
    schema?: XMLSchema;
    customValidators?: Array<(ast: DOMXMLAST) => ValidationError[]>;
}
interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}
interface ValidationError {
    code: string;
    message: string;
    line?: number;
    column?: number;
    nodePath?: string;
}
interface XMLSchema {
    elements: Record<string, XMLElementSchema>;
}
interface XMLElementSchema {
    attributes?: string[];
    required?: string[];
    children?: string[];
    minOccurs?: number;
    maxOccurs?: number;
}
declare class DOMXMLValidator {
    private options;
    private schema?;
    constructor(options?: ValidationOptions);
    validate(ast: DOMXMLAST): ValidationResult;
    private validateNode;
    private validateAttributes;
    private validateChildren;
}

declare class DOMXMLASTOptimizer {
    /**
     * Optimize the given AST by removing redundant nodes, merging text nodes, and recalculating metadata.
     */
    optimize(ast: DOMXMLAST): DOMXMLAST;
    optimizeChildren(children: DOMXMLASTNode[]): DOMXMLASTNode[];
    private optimizeNode;
    /**
     * Compute metadata for the optimized AST.
     */
    computeMetadata(root: DOMXMLASTNode): DOMXMLAST["metadata"];
}

declare abstract class XMLBaseTokenizer {
    protected input: string;
    protected position: number;
    protected line: number;
    protected column: number;
    protected type: string | undefined;
    constructor(input: string);
    abstract tokenize(): unknown[];
    protected peek(offset?: number): string;
    protected peekSequence(length: number): string;
    protected matches(str: string): boolean;
    protected consume(): string;
    protected consumeSequence(length: number): string;
    protected readUntil(stop: string | RegExp, options?: {
        escape?: boolean;
        includeStop?: boolean;
        skipStop?: boolean;
    }): string;
    protected readWhile(predicate: (char: string, index: number) => boolean): string;
    protected skipWhitespace(): void;
    protected getCurrentLocation(): {
        line: number;
        column: number;
    };
    protected isNameChar(char: string): boolean;
    protected isIdentifierStart(char: string): boolean;
    protected isIdentifierPart(char: string): boolean;
    protected readIdentifier(): string;
    protected readQuotedString(): string;
    protected hasMore(): boolean;
    protected addError(message: string): void;
    protected saveState(): {
        position: number;
        line: number;
        column: number;
    };
    protected restoreState(state: {
        position: number;
        line: number;
        column: number;
    }): void;
}

interface DOMXMLToken {
    type: 'StartTag' | 'EndTag' | 'Text' | 'Comment' | 'Doctype';
    name?: string;
    value?: string;
    attributes?: Record<string, string>;
    selfClosing?: boolean;
    location: {
        line: number;
        column: number;
    };
}
declare class DOMXMLTokenizer extends XMLBaseTokenizer {
    constructor(input: string);
    tokenize(): DOMXMLToken[];
    readText(): DOMXMLToken;
    private readStartTag;
    private readEndTag;
    private readComment;
    private readDoctype;
    private readAttributes;
    private readTagName;
    private readAttributeName;
    private readAttributeValue;
}

declare class DOMXMLParser {
    private tokens;
    private position;
    constructor(tokens?: DOMXMLToken[]);
    /**
     * Set new tokens for parsing.
     * @param tokens - Array of DOMXMLToken objects.
     */
    setTokens(tokens: DOMXMLToken[]): void;
    /**
     * Parses the tokens into a DOMXMLAST.
     * @returns The parsed DOMXMLAST.
     */
    parse(): DOMXMLAST;
    /**
     * Computes metadata for the AST.
     * @param root - The root node of the AST.
     * @returns Metadata containing node counts.
     */
    private computeMetadata;
}

interface DOMXMLOptions {
    validateOnParse?: boolean;
    optimizeAST?: boolean;
    generatorOptions?: GeneratorOptions;
    validationOptions?: ValidationOptions;
}
declare class DOMXML {
    private tokenizer;
    private parser;
    private optimizer;
    private generator;
    private validator;
    private options;
    constructor(options?: DOMXMLOptions);
    parse(input: string): DOMXMLAST;
    generate(ast: DOMXMLAST): string;
    validate(ast: DOMXMLAST): ValidationResult;
    optimize(ast: DOMXMLAST): DOMXMLAST;
}

export { DOMXML, DOMXMLAST, type DOMXMLASTNode, DOMXMLASTOptimizer, DOMXMLGenerator, type DOMXMLOptions, DOMXMLParser, type DOMXMLToken, DOMXMLTokenizer, DOMXMLValidator, type GeneratorOptions, type ValidationError, type ValidationOptions, type ValidationResult, XMLBaseTokenizer, type XMLElementSchema, type XMLSchema };
