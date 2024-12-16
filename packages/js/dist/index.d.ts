declare enum NodeType {
    Program = "Program",
    Statement = "Statement",
    Expression = "Expression",
    VariableDeclaration = "VariableDeclaration",
    BinaryExpression = "BinaryExpression",
    Identifier = "Identifier",
    Literal = "Literal",
    BlockStatement = "BlockStatement",
    IfStatement = "IfStatement",
    ArrowFunction = "ArrowFunction",
    TemplateLiteral = "TemplateLiteral",
    ClassDeclaration = "ClassDeclaration",
    MethodDefinition = "MethodDefinition",
    ObjectExpression = "ObjectExpression",
    Property = "Property",
    ImportDeclaration = "ImportDeclaration",
    ExportDeclaration = "ExportDeclaration",
    InlineConstant = "InlineConstant",
    FunctionDeclaration = "FunctionDeclaration",
    ReturnStatement = "ReturnStatement",
    AsyncFunction = "AsyncFunction"
}
declare enum JSTokenType {
    Keyword = "Keyword",
    Identifier = "Identifier",
    Operator = "Operator",
    Delimiter = "Delimiter",
    Literal = "Literal",
    EndOfStatement = "EndOfStatement"
}
interface JSToken {
    type: JSTokenType;
    value: string;
    line?: number;
    column?: number;
}
interface BaseNode {
    type: NodeType;
    value?: string;
    children?: BaseNode[];
    line?: number;
    column?: number;
}
interface JSASTNode extends BaseNode {
    children?: JSASTNode[];
}
interface TypedJSASTNode extends JSASTNode {
    body?: TypedJSASTNode[];
    type: NodeType;
}
interface ValidationError$1 {
    code: string;
    message: string;
    node: JSASTNode;
}
interface ParseOptions {
    sourceType?: 'module' | 'script';
    strict?: boolean;
}
declare const Types: {
    NodeType: typeof NodeType;
    JSTokenType: typeof JSTokenType;
};

declare class JSParser {
    private tokens;
    private current;
    constructor(tokens?: JSToken[]);
    setTokens(tokens: JSToken[]): void;
    parse(tokens?: JSToken[]): TypedJSASTNode;
    private walk;
    private parseKeyword;
    private parseIfStatement;
    private parseFunctionDeclaration;
    private parseVariableDeclaration;
    private parseBlockStatement;
}

type ValidationError = {
    code: string;
    message: string;
    node: JSASTNode;
};
declare class JSValidator {
    private errors;
    constructor();
    validate(ast: JSASTNode): ValidationError[];
    private addError;
    private traverse;
    private validateProgram;
    private validateVariableDeclaration;
    private validateBlockStatement;
    private validateArrowFunction;
    private validateTemplateLiteral;
    private validateClass;
    private validateMethodDefinition;
    private validateAsyncFunction;
    private validateObjectExpression;
    private validateProperty;
    private validateImport;
    private validateExport;
    private validateInlineConstant;
    private validateIdentifier;
    private validateLiteral;
}

interface GenerationError {
    code: string;
    message: string;
    location?: {
        line?: number;
        column?: number;
    };
}
interface GenerationResult {
    success: boolean;
    code?: string;
    errors?: GenerationError[];
    ast?: JSASTNode;
}
interface GeneratorOptions {
    validate?: boolean;
    format?: "compact" | "pretty";
    indent?: string;
}
declare class JSAstGenerator {
    private tokenizer;
    private validator;
    private parser;
    constructor();
    private convertToTypedNode;
    generateFromSource(source: string, options?: GeneratorOptions): GenerationResult;
    generateFromAST(ast: JSASTNode, options?: GeneratorOptions): GenerationResult;
    private processAST;
    private convertValidationErrors;
    private generateCode;
    private traverseAST;
    private formatOutput;
    private formatCompact;
    private formatPretty;
}

export { type BaseNode, type GenerationError, type GenerationResult, type GeneratorOptions, type JSASTNode, JSAstGenerator, JSParser, type JSToken, JSTokenType, JSValidator, NodeType, type ParseOptions, type TypedJSASTNode, Types, type ValidationError$1 as ValidationError };
