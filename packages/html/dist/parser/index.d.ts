import { HTMLAST } from "../ast";
import { HTMLToken } from "../tokenizer";
export declare class HTMLParserError extends Error {
    token: HTMLToken;
    position: number;
    constructor(message: string, token: HTMLToken, position: number);
}
export interface HTMLParserOptions {
    throwOnError?: boolean;
    errorHandler?: (error: HTMLParserError) => void;
}
export declare class HTMLParser {
    private tokenizer;
    private options;
    constructor(options?: HTMLParserOptions);
    parse(input: string): HTMLAST;
    private buildAST;
}
//# sourceMappingURL=index.d.ts.map