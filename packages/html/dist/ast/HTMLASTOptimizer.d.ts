import { HTMLAST, HTMLASTNode } from "./HTMLAST";
export declare class HTMLASTOptimizer {
    optimize(ast: HTMLAST): void;
    mergeAdjacentTextNodes(node: HTMLASTNode): void;
    private removeEmptyTextNodes;
    mergeTextNodes(node: HTMLASTNode): void;
}
//# sourceMappingURL=HTMLASTOptimizer.d.ts.map