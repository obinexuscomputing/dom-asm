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
  
  export class XMLValidator {
    private schema: XMLSchemaDefinition;
  
    constructor(schema: XMLSchemaDefinition) {
      this.schema = schema;
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