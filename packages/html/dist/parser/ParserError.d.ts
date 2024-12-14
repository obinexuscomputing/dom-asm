import { Token } from "../tokenizer";
export declare class ParserError extends Error {
    token: Token;
    position: number;
    constructor(message: string, token: Token, position: number);
}
//# sourceMappingURL=ParserError.d.ts.map