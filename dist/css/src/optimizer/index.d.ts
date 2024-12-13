import { ASTNode } from "../ast";
export declare class Optimizer {
    private ast;
    constructor(ast: ASTNode);
    private removeDuplicateDeclarations;
    private mergeAdjacentRules;
    optimize(): ASTNode;
}
