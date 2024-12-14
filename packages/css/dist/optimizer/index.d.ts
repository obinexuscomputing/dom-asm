import { ASTNode } from "../ast";
export declare class ASTOptimizer {
    private ast;
    constructor(ast: ASTNode);
    private removeDuplicateDeclarations;
    private mergeAdjacentRules;
    optimize(): ASTNode;
}
export { ASTNode };
//# sourceMappingURL=index.d.ts.map