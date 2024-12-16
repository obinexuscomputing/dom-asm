import { TypedJSASTNode } from "../parser/JSParser";
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
    ast?: TypedJSASTNode;
}
export interface GeneratorOptions {
    validate?: boolean;
    format?: 'compact' | 'pretty';
    indent?: string;
}
export declare class JSGenerator {
    private tokenizer;
    private validator;
    private parser;
    constructor();
    generateFromSource(source: string, options?: GeneratorOptions): GenerationResult;
    generateFromAST(ast: TypedJSASTNode, options?: GeneratorOptions): GenerationResult;
    private convertValidationErrors;
    private generateCode;
    private formatOutput;
    private formatCompact;
    private formatPretty;
}
//# sourceMappingURL=JSAstGenerator.d.ts.map