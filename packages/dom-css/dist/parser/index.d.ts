import { ASTNode } from "../ast";
export declare class Parser {
    private input;
    private validate;
    constructor(input: string, validate?: boolean);
    parse(): ASTNode;
}
