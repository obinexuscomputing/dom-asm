import { HTMLAST } from "../ast/HTMLAST";
export declare class HTMLASTOptimizer {
    optimize(ast: HTMLAST): void;
    private removeEmptyTextNodes;
    private isSignificantWhitespace;
    private mergeTextNodes;
    private shouldPreserveWhitespace;
}
//# sourceMappingURL=HTMLASTOptimizer.d.ts.map