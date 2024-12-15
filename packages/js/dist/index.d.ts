declare enum JSTokenType {
    Keyword = 0,
    Identifier = 1,
    Operator = 2,
    Delimiter = 3,
    Literal = 4,
    TemplateLiteral = 5,
    Comment = 6,
    EndOfStatement = 7,
    Number = 8,
    String = 9
}
interface JSToken {
    type: JSTokenType;
    value: string;
}
declare class JSTokenizer {
    private keywords;
    private operators;
    private singleCharDelimiters;
    private previousToken;
    constructor();
    private shouldAddSemicolon;
    private readOperator;
    tokenize(input: string): JSToken[];
}

type JSASTNode = {
    type: string;
    value?: string;
    children: JSASTNode[];
};
declare class JSASTBuilder {
    private tokens;
    private position;
    constructor(tokens: JSToken[]);
    private currentToken;
    private consumeToken;
    private parseProgram;
    private parseStatement;
    private parseVariableDeclaration;
    buildAST(): JSASTNode;
}

declare class JSASTOptimizer {
    constructor();
    optimize(ast: JSASTNode): JSASTNode;
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

declare class JSCodeGenerator {
    constructor();
    generate(ast: JSASTNode): string;
}

declare class JSParser {
    parse(ast: JSASTNode): any;
}

export { JSASTBuilder, type JSASTNode, JSASTOptimizer, JSCodeGenerator, JSParser, type JSToken, JSTokenType, JSTokenizer, JSValidator };
