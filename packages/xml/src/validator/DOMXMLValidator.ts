import { DOMXMLAST } from '../ast/DOMXMLAST';

export interface ValidationOptions {
  strictMode?: boolean;
  allowUnknownElements?: boolean;
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

export class DOMXMLValidator {
  private options: ValidationOptions;

  constructor(options: ValidationOptions = {}) {
    this.options = {
      strictMode: false,
      allowUnknownElements: true,
      ...options
    };
  }
    public validate(ast: any): ValidationResult {
      const errors: ValidationError[] = [];
      this.validateNode(ast.root, errors);
      return {
        valid: errors.length === 0,
        errors
      };
    }
  
    private validateNode(node: any, errors: ValidationError[]): void {
      if (node.type !== 'Element') return;
  
      const elementSchema = this.schema.elements[node.name];
      if (!elementSchema) {
        errors.push({
          message: `Unknown element: ${node.name}`,
          location: node.location
        });
        return;
      }
  
      this.validateAttributes(node, elementSchema, errors);
      this.validateChildren(node, elementSchema, errors);
    }
  
    private validateAttributes(node: any, schema: any, errors: ValidationError[]): void {
      // Check required attributes
      if (schema.required) {
        for (const required of schema.required) {
          if (!node.attributes?.[required]) {
            errors.push({
              message: `Missing required attribute: ${required} on element ${node.name}`,
              location: node.location
            });
          }
        }
      }
  
      // Check for unknown attributes
      if (schema.attributes) {
        for (const attr of Object.keys(node.attributes || {})) {
          if (!schema.attributes.includes(attr)) {
            errors.push({
              message: `Unknown attribute: ${attr} on element ${node.name}`,
              location: node.location
            });
          }
        }
      }
    }
  
    private validateChildren(node: any, schema: any, errors: ValidationError[]): void {
      if (!schema.children) return;
  
      for (const child of node.children || []) {
        if (child.type === 'Element') {
          this.validateNode(child, errors);
        }
      }
    }
  }
  
  interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
  }
  
  interface ValidationError {
    message: string;
    location: { line: number; column: number };
  }