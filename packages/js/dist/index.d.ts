declare enum TokenType {
    Keyword = 0,
    Identifier = 1,
    Operator = 2,
    Delimiter = 3,
    Literal = 4,
    EndOfStatement = 5
}
interface Token {
    type: TokenType;
    value: string;
}
declare class Tokenizer {
    private keywords;
    private operators;
    private delimiters;
    tokenize(input: string): Token[];
}

interface ASTNode {
    type: string;
    value?: string;
    children?: ASTNode[];
}
declare class ASTBuilder {
    build(tokens: Token[]): ASTNode;
}

declare class ASTOptimizer {
    optimize(ast: ASTNode): ASTNode;
}

export { ASTBuilder, type ASTNode, ASTOptimizer, type Token, TokenType, Tokenizer };
