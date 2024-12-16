declare enum JSTokenType {
    Keyword = "Keyword",
    Identifier = "Identifier",
    Operator = "Operator",
    Delimiter = "Delimiter",
    Literal = "Literal",
    TemplateLiteral = "TemplateLiteral",
    Comment = "Comment",
    EndOfStatement = "EndOfStatement"
}
interface JSToken {
    type: JSTokenType;
    value: string;
}
declare class JSTokenizer {
    private keywords;
    private operators;
    private delimiters;
    tokenize(input: string): JSToken[];
}

interface JSASTNode {
    type: string;
    value?: string;
    children?: JSASTNode[];
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

declare class JSAstGenerator {
    generate(ast: JSASTNode): string;
}

declare class JSValidator {
    private errors;
    constructor();
    validate(ast: JSASTNode): string[];
    private traverse;
    private validateProgram;
    private validateVariableDeclaration;
    private validateInlineConstant;
    private validateIdentifier;
    private validateLiteral;
}

declare class JSParser {
    parse(ast: JSASTNode): any;
}

export { JSASTBuilder, type JSASTNode, JSAstGenerator, JSAstMinimizer, JSParser, JSTokenizer, JSValidator };
