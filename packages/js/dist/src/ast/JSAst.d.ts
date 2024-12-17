import { JSToken } from '../types';
import { JSASTNode } from '../types';
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
export { JSASTNode };
//# sourceMappingURL=JSAst.d.ts.map