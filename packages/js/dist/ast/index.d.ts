import { JSToken } from "../tokenizer";
export type JSASTNode = {
    type: string;
    value?: string;
    children: JSASTNode[];
};
export declare class JSASTBuilder {
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
//# sourceMappingURL=index.d.ts.map