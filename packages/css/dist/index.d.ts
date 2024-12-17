type Token = {
    type: string;
    value: string;
    position: {
        line: number;
        column: number;
    };
};
declare class CSSTokenizer {
    private input;
    private position;
    private line;
    private column;
    constructor(input: string);
    private isWhitespace;
    private isCommentStart;
    private isDelimiter;
    private consumeWhitespace;
    private consumeComment;
    private consumeDelimiter;
    private consumeOther;
    tokenize(): Token[];
}

type ASTNode = {
    type: string;
    value?: string;
    children: ASTNode[];
};

declare class CSSParser {
    private input;
    private validate;
    constructor(input: string, validate?: boolean);
    parse(): ASTNode;
}

declare class CSSValidator {
    private ast;
    private errors;
    constructor(ast: ASTNode);
    private validateStylesheet;
    private validateRule;
    private validateDeclaration;
    validate(): string[];
}

declare class CSSASTOptimizer {
    private ast;
    constructor(ast: ASTNode);
    private removeDuplicateDeclarations;
    private mergeAdjacentRules;
    optimize(): ASTNode;
}

declare class CSSCodeGenerator {
    private ast;
    constructor(ast: ASTNode);
    private generateStylesheet;
    private generateRule;
    private generateSelector;
    private generateDeclaration;
    generate(): string;
}

export { CSSASTOptimizer, CSSCodeGenerator, CSSParser, CSSTokenizer, CSSValidator };
