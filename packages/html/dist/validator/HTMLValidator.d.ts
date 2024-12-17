import { HTMLASTNode } from "../ast/HTMLAST";
type HTMLSpec = 'html5' | 'html6-xml';
interface ValidationOptions {
    spec?: HTMLSpec;
    strictMode?: boolean;
    allowCustomElements?: boolean;
    allowNamespaces?: boolean;
    customNamespaces?: string[];
}
export interface HTMLValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
interface ValidationError {
    type: 'error';
    message: string;
    node?: HTMLASTNode;
    code: string;
}
interface ValidationWarning {
    type: 'warning';
    message: string;
    node?: HTMLASTNode;
    code: string;
}
/**
 * const validator = new HTMLValidator({
  spec: 'html6-xml',
  strictMode: true,
  allowCustomElements: true,
  allowNamespaces: true,
  customNamespaces: ['html', 'custom']
});

const result = validator.validate(ast);
if (!result.valid) {
  result.errors.forEach(error => {
    console.error(`${error.code}: ${error.message}`);
  });
  result.warnings.forEach(warning => {
    console.warn(`${warning.code}: ${warning.message}`);
  });
}
 */
export declare class HTMLValidator {
    private options;
    private readonly voidElements;
    private readonly flowContent;
    private readonly metadataContent;
    private readonly defaultOptions;
    constructor(options?: ValidationOptions);
    validate(ast: HTMLASTNode): HTMLValidationResult;
    private validateNode;
    private validateElement;
    private validateTagName;
    private validateAttributes;
    private validateContentModel;
    private updateDocumentContext;
    private validateDocumentStructure;
    private isValidHTML5TagName;
    private isValidEventHandler;
    private isValidChild;
}
export {};
