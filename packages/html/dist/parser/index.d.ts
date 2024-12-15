import { Token } from "../tokenizer/index";
import { ASTNode } from "../ast/index";
type ErrorHandler = (error: HTMLParserError) => void;
export declare class HTMLParserError extends Error {
    token: Token;
    position: number;
    constructor(message: string, token: Token, position: number);
}
export declare class HTMLParser {
    private tokenizer;
    private astBuilder;
    private validator;
    private errorHandler;
    private shouldThrow;
    constructor(options?: {
        throwOnError: boolean;
    });
    setErrorHandler(handler: ErrorHandler): void;
    private handleError;
    private isWhitespace;
    parse(input: string): ASTNode;
    private cleanWhitespace;
    private buildASTWithRecovery;
}
export {};
//# sourceMappingURL=index.d.ts.map