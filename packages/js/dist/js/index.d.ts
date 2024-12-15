import { ASTNode as ASTNode$1 } from 'src/ast';

declare enum TokenType {
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
interface Token {
    type: TokenType;
    value: string;
}
declare class Tokenizer {
    private keywords;
    private operators;
    private delimiters;
    private singleCharDelimiters;
    private previousToken;
    private isNumericStart;
    private isValidNumber;
    private readNumber;
    private readMultilineComment;
    private readTemplateLiteral;
    private readOperator;
    private readIdentifier;
    private shouldAddSemicolon;
    tokenize(input: string): Token[];
}

type ASTNode = {
    type: string;
    value?: string;
    children: ASTNode[];
};
declare class JSASTBuilder {
    private tokens;
    private position;
    constructor(tokens: Token[]);
    private currentToken;
    private consumeToken;
    private parseProgram;
    private parseStatement;
    private parseVariableDeclaration;
    private parseInlineConstant;
    private parseValue;
    buildAST(): ASTNode;
}

declare class ASTOptimizer {
    optimize(ast: ASTNode): ASTNode;
}

declare class JSCodeGenerator {
    generate(ast: ASTNode): string;
}

declare class JSParser {
    parse(ast: ASTNode$1): any;
}

export { type ASTNode, ASTOptimizer, JSASTBuilder, JSCodeGenerator, JSParser, type Token, TokenType, Tokenizer };
