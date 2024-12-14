import { Token } from "../tokenizer";
export interface ASTNode {
    type: string;
    value?: string;
    children?: ASTNode[];
}
export declare class ASTBuilder {
    build(tokens: Token[]): ASTNode;
}
//# sourceMappingURL=index.d.ts.map