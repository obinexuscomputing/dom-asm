import { ASTNode } from "../ast/index";
declare class ASTOptimizer {
    optimize(node: ASTNode): ASTNode;
    private removeEmptyNodes;
    private mergeTextNodes;
    private isSelfClosingTag;
}
export { ASTOptimizer };
//# sourceMappingURL=index.d.ts.map