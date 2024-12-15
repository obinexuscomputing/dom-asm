import { Token } from "../tokenizer";
export type ASTNode = {
    type: string;
    value?: string;
    children: ASTNode[];
};
export declare class JSASTBuilder {
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
