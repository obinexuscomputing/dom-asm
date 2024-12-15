interface DOMXMLASTNode {
    type: "Element" | "Text" | "Comment" | "Doctype";
    name?: string;
    value?: string;
    attributes?: Record<string, string>;
    children?: DOMXMLASTNode[];
    equivalenceClass?: number;
    optimizationData?: {
        hash: string;
        transitionSignature?: string;
        isMinimized?: boolean;
    };
}
interface DOMXMLAST {
    root: DOMXMLASTNode;
    metadata?: {
        nodeCount: number;
        elementCount: number;
        textCount: number;
        commentCount: number;
        optimizationMetrics?: {
            originalStateCount: number;
            minimizedStateCount: number;
            reductionPercentage: number;
        };
    };
}

declare class DOMXMLOptimizer {
    private stateNodes;
    private nodeMap;
    optimize(ast: DOMXMLAST): DOMXMLAST;
    private initializeStructure;
    private buildEquivalenceClasses;
    private computeInitialSignature;
    private splitByTransitions;
    private computeTransitionSignature;
    private buildMinimizedAST;
    private computeMetadata;
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

declare abstract class XMLBaseTokenizer {
    protected input: string;
    protected position: number;
    protected line: number;
    protected column: number;
    constructor(input: string);
    abstract tokenize(): unknown[];
    protected peek(offset?: number): string;
    protected consume(): string;
    protected readUntil(stop: string | RegExp): string;
    protected skipWhitespace(): void;
    protected getCurrentLocation(): {
        line: number;
        column: number;
    };
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
    tokenize(): DOMXMLToken[];
    private readStartTag;
    private readEndTag;
    private readText;
    private readComment;
    private readDoctype;
    private readAttributes;
}

declare class DOMXMLParser {
    private tokens;
    private position;
    constructor(tokens?: DOMXMLToken[]);
    setTokens(tokens: DOMXMLToken[]): void;
    parse(): DOMXMLAST;
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

export { DOMXML, type DOMXMLAST, type DOMXMLASTNode, DOMXMLGenerator, DOMXMLOptimizer, type DOMXMLOptions, DOMXMLParser, type DOMXMLToken, DOMXMLTokenizer, DOMXMLValidator, type GeneratorOptions, type ValidationError, type ValidationOptions, type ValidationResult, XMLBaseTokenizer, type XMLElementSchema, type XMLSchema };
