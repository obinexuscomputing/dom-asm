import { JSASTNode } from './JSAst';
export declare class JSAstMinimizer {
    private uniqueNodes;
    minimize(ast: JSASTNode): JSASTNode;
    optimize(ast: JSASTNode): JSASTNode;
    private traverse;
    private performOptimization;
    private simplifyNode;
}
//# sourceMappingURL=JSAstMinimizer.d.ts.map