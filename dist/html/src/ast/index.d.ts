import { Token } from "../tokenizer/index";
type ASTNodeType = "Element" | "Text" | "Comment";
interface ASTNode {
    type: ASTNodeType;
    name?: string;
    value?: string;
    attributes?: Record<string, string>;
    children: ASTNode[];
    parent: ASTNode | null;
}
declare class AST {
    private root;
    constructor();
    buildAST(tokens: Token[]): ASTNode;
    getRoot(): ASTNode;
    printAST(node?: ASTNode, depth?: number): void;
}
export { AST, ASTNode };
