type Token = {
    type: string;
    value: string;
    position: {
        line: number;
        column: number;
    };
};
declare class Tokenizer {
    private input;
    private position;
    private line;
    private column;
    constructor(input: string);
    private isWhitespace;
    private isCommentStart;
    private consumeWhitespace;
    private consumeComment;
    private consumeOther;
    tokenize(): Token[];
}

type ASTNode = {
    type: string;
    value?: string;
    children: ASTNode[];
};
declare class ASTBuilder {
    private tokens;
    private position;
    constructor(tokens: Token[]);
    private currentToken;
    private consumeToken;
    private parseStylesheet;
    private parseRule;
    private parseSelector;
    private parseDeclarations;
    private parseDeclaration;
    private parseProperty;
    private parseValue;
    buildAST(): ASTNode;
}

declare class Optimizer {
    private ast;
    constructor(ast: ASTNode);
    private removeDuplicateDeclarations;
    private mergeAdjacentRules;
    optimize(): ASTNode;
}

declare class Validator {
    private ast;
    private errors;
    constructor(ast: ASTNode);
    private validateStylesheet;
    private validateRule;
    private validateDeclaration;
    validate(): string[];
}

export { ASTBuilder, type ASTNode, Optimizer, type Token, Tokenizer, Validator };
