import { DOMXMLAST, DOMXMLASTNode } from "../ast";

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

export class DOMXMLValidator {
  private options: Required<ValidationOptions>;
  private schema?: XMLSchema;

  constructor(options: ValidationOptions = {}) {
    this.options = {
      strictMode: false,
      allowUnknownElements: true,
      schema: options.schema,
      customValidators: options.customValidators || [],
    } as Required<ValidationOptions>;

    this.schema = options.schema;
  }

  public validate(ast: DOMXMLAST): ValidationResult {
    const errors: ValidationError[] = [];

    if (this.schema) {
      this.validateNode(ast.root, errors, []);
    }

    this.options.customValidators.forEach((validator) => {
      errors.push(...validator(ast));
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private validateNode(
    node: DOMXMLASTNode,
    errors: ValidationError[],
    path: string[],
  ): void {
    if (node.type !== "Element") return;

    const currentPath = [...path, node.name || ""];

    if (this.schema?.elements) {
      const elementSchema = this.schema.elements[node.name || ""];

      if (!elementSchema && this.options.strictMode) {
        errors.push({
          code: "UNKNOWN_ELEMENT",
          message: `Unknown element: ${node.name}`,
          nodePath: currentPath.join("/"),
        });
        return;
      }

      if (elementSchema) {
        this.validateAttributes(node, elementSchema, errors, currentPath);
        this.validateChildren(node, elementSchema, errors, currentPath);
      }
    }

    node.children?.forEach((child) => {
      this.validateNode(child, errors, currentPath);
    });
  }

  private validateAttributes(
    node: DOMXMLASTNode,
    schema: XMLElementSchema,
    errors: ValidationError[],
    path: string[],
  ): void {
    const attributes = node.attributes || {};

    // Check required attributes
    schema.required?.forEach((required) => {
      if (!attributes[required]) {
        errors.push({
          code: "MISSING_REQUIRED_ATTRIBUTE",
          message: `Missing required attribute: ${required}`,
          nodePath: path.join("/"),
        });
      }
    });

    // Check unknown attributes in strict mode
    if (this.options.strictMode && schema.attributes) {
      Object.keys(attributes).forEach((attr) => {
        if (!schema.attributes?.includes(attr)) {
          errors.push({
            code: "UNKNOWN_ATTRIBUTE",
            message: `Unknown attribute: ${attr}`,
            nodePath: path.join("/"),
          });
        }
      });
    }
  }

  private validateChildren(
    node: DOMXMLASTNode,
    schema: XMLElementSchema,
    errors: ValidationError[],
    path: string[],
  ): void {
    const children = node.children || [];
    const elementChildren = children.filter(
      (child) => child.type === "Element",
    );

    if (schema.children) {
      elementChildren.forEach((child) => {
        if (
          child.type === "Element" &&
          !schema.children?.includes(child.name || "")
        ) {
          errors.push({
            code: "INVALID_CHILD_ELEMENT",
            message: `Invalid child element: ${child.name}`,
            nodePath: path.join("/"),
          });
        }
      });
    }
  }
}
