import { DOMXMLAST } from "../ast/DOMXMLAST";
export interface ValidationOptions {
    strictMode?: boolean;
    allowUnknownElements?: boolean;
    schema?: XMLSchema;
    customValidators?: Array<(ast: DOMXMLAST) => ValidationError[]>;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}
export interface ValidationError {
    code: string;
    message: string;
    line?: number;
    column?: number;
    nodePath?: string;
}
export interface XMLSchema {
    elements: Record<string, XMLElementSchema>;
}
export interface XMLElementSchema {
    attributes?: string[];
    required?: string[];
    children?: string[];
    minOccurs?: number;
    maxOccurs?: number;
}
export declare class DOMXMLValidator {
    private options;
    private schema?;
    constructor(options?: ValidationOptions);
    validate(ast: DOMXMLAST): ValidationResult;
    private validateNode;
    private validateAttributes;
    private validateChildren;
}
