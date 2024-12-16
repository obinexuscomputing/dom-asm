import { HTMLASTNode } from "../ast/HTMLAST";

// Specification types
type HTMLSpec = 'html5' | 'html6-xml';

interface ValidationOptions {
  spec?: HTMLSpec;
  strictMode?: boolean;
  allowCustomElements?: boolean;
  allowNamespaces?: boolean;
  customNamespaces?: string[];
}

interface ValidationContext {
  parentTag?: string;
  ancestors: string[];
  inHead: boolean;
  inBody: boolean;
  hasHtml: boolean;
  hasHead: boolean;
  hasBody: boolean;
  hasTitle: boolean;
  contentCategories: Set<string>;
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
export class HTMLValidator {
  private readonly voidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  private readonly flowContent = new Set([
    'a', 'abbr', 'address', 'article', 'aside', 'audio', 'b',
    'bdi', 'bdo', 'blockquote', 'br', 'button', 'canvas', 'cite',
    'code', 'data', 'datalist', 'del', 'details', 'dfn', 'div',
    'dl', 'em', 'embed', 'fieldset', 'figure', 'footer', 'form',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i',
    'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'main',
    'map', 'mark', 'math', 'meter', 'nav', 'noscript', 'object',
    'ol', 'output', 'p', 'picture', 'pre', 'progress', 'q',
    'ruby', 's', 'samp', 'script', 'section', 'select', 'small',
    'span', 'strong', 'sub', 'sup', 'svg', 'table', 'template',
    'textarea', 'time', 'u', 'ul', 'var', 'video', 'wbr'
  ]);

  private readonly metadataContent = new Set([
    'base', 'link', 'meta', 'noscript', 'script', 'style', 'template', 'title'
  ]);

  private readonly defaultOptions: ValidationOptions = {
    spec: 'html5',
    strictMode: false,
    allowCustomElements: true,
    allowNamespaces: false,
    customNamespaces: []
  };

  constructor(private options: ValidationOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  public validate(ast: HTMLASTNode): HTMLValidationResult {
    const context: ValidationContext = {
      ancestors: [],
      inHead: false,
      inBody: false,
      hasHtml: false,
      hasHead: false,
      hasBody: false,
      hasTitle: false,
      contentCategories: new Set()
    };

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    this.validateNode(ast, context, errors, warnings);

    if (this.options.strictMode) {
      this.validateDocumentStructure(context, errors);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateNode(
    node: HTMLASTNode,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (node.type === 'Element') {
      this.validateElement(node, context, errors, warnings);
      
      // Track document structure
      this.updateDocumentContext(node, context);
      
      // Validate children
      const prevContext = { ...context };
      context.ancestors.push(node.name || '');
      context.parentTag = node.name;
      
      node.children?.forEach(child => {
        this.validateNode(child, context, errors, warnings);
      });
      
      context.ancestors.pop();
      context.parentTag = prevContext.parentTag;
    }
  }

  private validateElement(
    node: HTMLASTNode,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (!node.name) {
      errors.push({
        type: 'error',
        message: 'Element must have a name',
        node,
        code: 'E001'
      });
      return;
    }

    // Validate tag name
    this.validateTagName(node, context, errors, warnings);

    // Validate attributes
    if (node.attributes) {
      this.validateAttributes(node, context, errors, warnings);
    }

    // Validate content model
    this.validateContentModel(node, context, errors, warnings);

    // Validate void elements
    if (this.voidElements.has(node.name.toLowerCase()) && node.children?.length) {
      errors.push({
        type: 'error',
        message: `Void element <${node.name}> cannot have children`,
        node,
        code: 'E002'
      });
    }
  }

  private validateTagName(
    node: HTMLASTNode,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const name = node.name || '';
    
    if (this.options.spec === 'html6-xml') {
      // XML name validation
      if (!name.match(/^([a-zA-Z_][\w.-]*:)?[a-zA-Z_][\w.-]*$/)) {
        errors.push({
          type: 'error',
          message: `Invalid XML tag name: ${name}`,
          node,
          code: 'E003'
        });
      }

      // Namespace validation
      if (name.includes(':')) {
        const [namespace] = name.split(':');
        if (!this.options.allowNamespaces) {
          errors.push({
            type: 'error',
            message: `Namespaces are not allowed: ${namespace}`,
            node,
            code: 'E004'
          });
        } else if (
          this.options.customNamespaces &&
          !this.options.customNamespaces.includes(namespace)
        ) {
          errors.push({
            type: 'error',
            message: `Unknown namespace: ${namespace}`,
            node,
            code: 'E005'
          });
        }
      }
    } else {
      // HTML5 validation
      if (!this.options.allowCustomElements && !this.isValidHTML5TagName(name)) {
        errors.push({
          type: 'error',
          message: `Invalid HTML5 tag name: ${name}`,
          node,
          code: 'E006'
        });
      }
    }
  }

  private validateAttributes(
    node: HTMLASTNode,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const attributes = node.attributes || {};
    
    for (const [name, value] of Object.entries(attributes)) {
      // XML attribute name validation
      if (this.options.spec === 'html6-xml') {
        if (!name.match(/^[a-zA-Z_][\w.-]*$/)) {
          errors.push({
            type: 'error',
            message: `Invalid XML attribute name: ${name}`,
            node,
            code: 'E007'
          });
        }
      }

      // HTML5 specific attribute validation
      if (this.options.spec === 'html5') {
        if (name.startsWith('on') && !this.isValidEventHandler(name)) {
          warnings.push({
            type: 'warning',
            message: `Suspicious event handler attribute: ${name}`,
            node,
            code: 'W001'
          });
        }
      }

      // Common attribute validation
      if (typeof value !== 'string') {
        errors.push({
          type: 'error',
          message: `Attribute "${name}" must have a string value`,
          node,
          code: 'E008'
        });
      }
    }
  }

  private validateContentModel(
    node: HTMLASTNode,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const name = node.name?.toLowerCase();
    
    if (!name) return;

    // Validate specific element content models
    switch (name) {
      case 'title':
        if (!node.children?.length || node.children.length > 1) {
          errors.push({
            type: 'error',
            message: '<title> must have exactly one text node child',
            node,
            code: 'E009'
          });
        }
        break;

      case 'head':
        if (!context.hasTitle && this.options.strictMode) {
          errors.push({
            type: 'error',
            message: '<head> must contain a <title> element',
            node,
            code: 'E010'
          });
        }
        break;
    }

    // Validate parent-child relationships
    if (context.parentTag) {
      if (!this.isValidChild(context.parentTag, name)) {
        errors.push({
          type: 'error',
          message: `<${name}> is not allowed as a child of <${context.parentTag}>`,
          node,
          code: 'E011'
        });
      }
    }
  }

  private updateDocumentContext(node: HTMLASTNode, context: ValidationContext): void {
    const name = node.name?.toLowerCase();
    
    if (!name) return;

    switch (name) {
      case 'html':
        context.hasHtml = true;
        break;
      case 'head':
        context.hasHead = true;
        context.inHead = true;
        break;
      case 'body':
        context.hasBody = true;
        context.inBody = true;
        break;
      case 'title':
        context.hasTitle = true;
        break;
    }
  }

  private validateDocumentStructure(
    context: ValidationContext,
    errors: ValidationError[]
  ): void {
    if (!context.hasHtml) {
      errors.push({
        type: 'error',
        message: 'Document must have an <html> root element',
        code: 'E012'
      });
    }

    if (!context.hasHead) {
      errors.push({
        type: 'error',
        message: 'Document must have a <head> element',
        code: 'E013'
      });
    }

    if (!context.hasBody) {
      errors.push({
        type: 'error',
        message: 'Document must have a <body> element',
        code: 'E014'
      });
    }
  }

  private isValidHTML5TagName(name: string): boolean {
    // Standard HTML5 elements
    const standardElements = new Set([...this.flowContent, ...this.metadataContent]);
    return standardElements.has(name.toLowerCase());
  }

  private isValidEventHandler(name: string): boolean {
    const validEvents = new Set([
      'onclick', 'onload', 'onsubmit', 'onchange', 'onkeyup', 'onkeydown',
      'onmouseover', 'onmouseout', 'onfocus', 'onblur'
    ]);
    return validEvents.has(name.toLowerCase());
  }

  private isValidChild(parent: string, child: string): boolean {
    parent = parent.toLowerCase();
    child = child.toLowerCase();

    // Basic content model rules
    const contentModel: Record<string, Set<string>> = {
      head: this.metadataContent,
      body: this.flowContent,
      // Add more specific rules as needed
    };

    return !contentModel[parent] || contentModel[parent].has(child);
  }
}