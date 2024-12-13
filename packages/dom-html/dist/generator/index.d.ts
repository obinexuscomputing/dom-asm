import { ASTNode } from "../ast";
/**
 *
 */
export declare class CodeGenerator {
    private ast;
    constructor(ast: ASTNode);
    private generateStylesheet;
    private generateRule;
    private generateSelector;
    private generateDeclaration;
    generate(): string;
}
