import { HTMLAST, HTMLASTNode } from "./HTMLAST";
export declare class HTMLASTOptimizer {
    optimize(ast: HTMLAST): void;
    mergeTextNodes(node: HTMLASTNode): void;
    private removeEmptyTextNodes;
}
//# sourceMappingURL=HTMLASTOptimizer.d.ts.map