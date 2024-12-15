export interface XMLSchemaDefinition {
    elements: {
        [key: string]: {
            attributes?: string[];
            required?: string[];
            children?: string[];
            minOccurs?: number;
            maxOccurs?: number;
        };
    };
}
export declare class XMLValidator {
    private schema;
    constructor(schema: XMLSchemaDefinition);
    validate(ast: any): ValidationResult;
    private validateNode;
    private validateAttributes;
    private validateChildren;
}
interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
}
interface ValidationError {
    message: string;
    location: {
        line: number;
        column: number;
    };
}
export {};
//# sourceMappingURL=DOMXMLValidator.d.ts.map