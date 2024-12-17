import { JSToken, TypedJSASTNode } from "../types";
export declare class JSParser {
    private tokens;
    private current;
    constructor(tokens?: JSToken[]);
    setTokens(tokens: JSToken[]): void;
    parse(tokens?: JSToken[]): TypedJSASTNode;
    private walk;
    private parseKeyword;
    private parseIfStatement;
    private parseFunctionDeclaration;
    private parseVariableDeclaration;
    private parseBlockStatement;
}
//# sourceMappingURL=JSParser.d.ts.map