import { JSToken } from "src/types";
import { JavaScriptAstNode } from "./JavaScriptAstNode";
export declare class JavaScriptAst {
    root: JavaScriptAstNode;
    constructor(root: JavaScriptAstNode, tokens: JSToken[]);
    minimize(): JavaScriptAst;
    static build(tokens: JSToken[]): JavaScriptAst;
    private tokens;
    private position;
    private currentToken;
    private consumeToken;
    peekToken(): JSToken | null;
    private parseProgram;
    private parseStatement;
    private parseVariableDeclaration;
    buildAST(): JavaScriptAstNode;
}
//# sourceMappingURL=JavaScriptAst.d.ts.map