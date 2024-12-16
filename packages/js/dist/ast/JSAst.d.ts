import { JSToken } from "../tokenizer/JSTokenizer";
export interface JSASTNode {
    type: string;
    value?: string;
    children: JSASTNode[];
}
export declare class JSASTBuilder {
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
//# sourceMappingURL=JSAst.d.ts.map