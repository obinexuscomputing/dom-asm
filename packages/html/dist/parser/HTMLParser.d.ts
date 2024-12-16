import { HTMLAST } from "../ast/HTMLAST";
import { HTMLToken } from "../tokenizer/HTMLTokenizer";
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
    private handleError;
    private computeMetadata;
    setErrorHandler(handler: (error: HTMLParserError) => void): void;
}
//# sourceMappingURL=HTMLParser.d.ts.map