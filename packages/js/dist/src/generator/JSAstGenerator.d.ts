import { JSASTNode } from "../types";
export interface GenerationError {
    code: string;
    message: string;
    location?: {
        line?: number;
        column?: number;
    };
}
export interface GenerationResult {
    success: boolean;
    code?: string;
    errors?: GenerationError[];
    ast?: JSASTNode;
    output?: string;
}
export interface GeneratorOptions {
    validate?: boolean;
    format?: "compact" | "pretty";
    indent?: string;
}
export declare class JSAstGenerator {
    private tokenizer;
    private validator;
    private parser;
    constructor();
    private convertToTypedNode;
    generateFromSource(source: string, options?: GeneratorOptions): GenerationResult;
    generateFromAST(ast: JSASTNode, options?: GeneratorOptions): GenerationResult;
    private processAST;
    private convertValidationErrors;
    private generateCode;
    private traverseAST;
    private formatOutput;
    private formatCompact;
    private formatPretty;
}
//# sourceMappingURL=JSAstGenerator.d.ts.map