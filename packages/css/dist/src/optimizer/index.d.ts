import { ASTNode } from "../ast/index";
export declare class CSSASTOptimizer {
    private ast;
    constructor(ast: ASTNode);
    private removeDuplicateDeclarations;
    private mergeAdjacentRules;
    optimize(): ASTNode;
}
//# sourceMappingURL=index.d.ts.map