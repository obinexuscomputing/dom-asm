declare enum NodeType {
    Program = "Program",
    VariableDeclaration = "VariableDeclaration",
    InlineConstant = "InlineConstant",
    Identifier = "Identifier",
    Literal = "Literal",
    BlockStatement = "BlockStatement",
    ArrowFunction = "ArrowFunction",
    TemplateLiteral = "TemplateLiteral",
    TemplateLiteralExpression = "TemplateLiteralExpression",
    ClassDeclaration = "ClassDeclaration",
    MethodDefinition = "MethodDefinition",
    PropertyDefinition = "PropertyDefinition",
    FunctionExpression = "FunctionExpression",
    AsyncFunction = "AsyncFunction",
    ObjectExpression = "ObjectExpression",
    Property = "Property",
    SpreadElement = "SpreadElement",
    ImportDeclaration = "ImportDeclaration",
    ExportDeclaration = "ExportDeclaration",
    ReturnStatement = "ReturnStatement",
    Statement = "Statement",
    Expression = "Expression",
    BinaryExpression = "BinaryExpression",
    IfStatement = "IfStatement",
    FunctionDeclaration = "FunctionDeclaration"
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
interface ValidationError {
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

declare class JSTokenizer {
    private keywords;
    private operators;
    private delimiters;
    tokenize(input: string): JSToken[];
    private matchMultiCharOperator;
}

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
    output?: string;
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

declare class JSASTBuilder {
    private tokens;
    private position;
    constructor(tokens: JSToken[]);
    private currentToken;
    private consumeToken;
    private peekToken;
    private parseProgram;
    private parseStatement;
    private parseVariableDeclaration;
    buildAST(): JSASTNode;
}

declare class JSAstMinimizer {
    private uniqueNodes;
    minimize(ast: JSASTNode): JSASTNode;
    optimize(ast: JSASTNode): JSASTNode;
    private traverse;
    private performOptimization;
    private simplifyNode;
}

export { type BaseNode, type GenerationError, type GenerationResult, type GeneratorOptions, JSASTBuilder, type JSASTNode, JSAstGenerator, JSAstMinimizer, JSParser, type JSToken, JSTokenType, JSTokenizer, JSValidator, NodeType, type ParseOptions, type TypedJSASTNode, Types, type ValidationError };
