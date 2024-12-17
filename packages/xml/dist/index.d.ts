import { DOMXMLAST } from "./ast/DOMXMLAST";
import { GeneratorOptions } from "./generator/DOMXMLGenerator";
import { ValidationOptions, ValidationResult } from "./validator/DOMXMLValidator";
export type { DOMXMLAST, DOMXMLASTNode } from "./ast/DOMXMLAST";
export { DOMXMLASTOptimizer } from "./ast/DOMXMLASTOptimizer";
export { XMLBaseTokenizer } from "./tokenizer/XMLBaseTokenizer";
export { DOMXMLTokenizer } from "./tokenizer/DOMXMLTokenizer";
export type { DOMXMLToken } from "./tokenizer/DOMXMLTokenizer";
export { DOMXMLParser } from "./parser/DOMXMLParser";
export { DOMXMLGenerator } from "./generator/DOMXMLGenerator";
export type { GeneratorOptions } from "./generator/DOMXMLGenerator";
export { DOMXMLValidator, type ValidationOptions, type ValidationResult, type ValidationError, type XMLSchema, type XMLElementSchema, } from "./validator/DOMXMLValidator";
export interface DOMXMLOptions {
    validateOnParse?: boolean;
    optimizeAST?: boolean;
    generatorOptions?: GeneratorOptions;
    validationOptions?: ValidationOptions;
}
export declare class DOMXML {
    private tokenizer;
    private parser;
    private optimizer;
    private generator;
    private validator;
    private options;
    constructor(options?: DOMXMLOptions);
    parse(input: string): DOMXMLAST;
    generate(ast: DOMXMLAST): string;
    validate(ast: DOMXMLAST): ValidationResult;
    optimize(ast: DOMXMLAST): DOMXMLAST;
}
