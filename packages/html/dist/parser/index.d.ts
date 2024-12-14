import { Token } from "../tokenizer/index";
import { ASTNode } from "../ast/index";
import { ValidationResult } from "../validator/index";
type ErrorHandler = (error: ParserError) => void;
export declare class ParserError extends Error {
    token: Token;
    position: number;
    constructor(message: string, token: Token, position: number);
}
export declare class Parser {
    private tokenizer;
    private astBuilder;
    private validator;
    private errorHandler;
    constructor();
    setErrorHandler(handler: ErrorHandler): void;
    private handleError;
    parse(input: string): {
        children: any;
        ast: ASTNode;
        validationResult: ValidationResult;
    };
    private buildASTWithRecovery;
}
export {};
//# sourceMappingURL=index.d.ts.map