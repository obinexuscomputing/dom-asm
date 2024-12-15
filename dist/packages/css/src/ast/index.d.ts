import { Token } from "../tokenizer";
export type ASTNode = {
    type: string;
    value?: string;
    children: ASTNode[];
};
export declare class CSSASTBuilder {
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
