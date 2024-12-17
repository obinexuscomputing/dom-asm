import { ASTNode } from "../ast/index";
export declare class CSSParser {
    private input;
    private validate;
    constructor(input: string, validate?: boolean);
    parse(): ASTNode;
}
