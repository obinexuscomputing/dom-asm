
# **@obinexuscomputing/xml**
A lightweight, efficient, and modular XML processing library. This package provides robust XML tokenization, parsing, validation, optimization, and generation features, tailored for advanced XML workflows.

---

## **Features**
- **Tokenizer**: Converts raw XML strings into tokens for further processing.
- **Parser**: Builds an Abstract Syntax Tree (AST) from XML tokens.
- **AST Optimizer**: Optimizes the AST by removing redundant nodes, merging adjacent text nodes, and recalculating metadata.
- **Validator**: Validates XML AST against user-defined schemas.
- **Generator**: Converts XML AST back into a well-formatted XML string.

---

## **Installation**

Install the package via NPM:

```bash
npm install @obinexuscomputing/xml
```

---

## **Usage**

### **1. Tokenizing XML**
The tokenizer processes raw XML strings into tokens.

```typescript
import { DOMXMLTokenizer } from '@obinexuscomputing/xml';

const input = `
<root>
  <child>Test</child>
</root>
`;

const tokenizer = new DOMXMLTokenizer(input);
const tokens = tokenizer.tokenize();

console.log(tokens);
/*
[
  { type: 'StartTag', name: 'root', attributes: {}, selfClosing: false },
  { type: 'StartTag', name: 'child', attributes: {}, selfClosing: false },
  { type: 'Text', value: 'Test' },
  { type: 'EndTag', name: 'child' },
  { type: 'EndTag', name: 'root' },
]
*/
```

---

### **2. Parsing Tokens into AST**
The parser converts tokens into an Abstract Syntax Tree (AST).

```typescript
import { DOMXMLParser } from '@obinexuscomputing/xml';

const parser = new DOMXMLParser(tokens);
const ast = parser.parse();

console.log(ast);
/*
{
  root: {
    type: 'Element',
    name: 'root',
    children: [
      {
        type: 'Element',
        name: 'child',
        children: [
          { type: 'Text', value: 'Test' }
        ]
      }
    ]
  },
  metadata: {
    nodeCount: 3,
    elementCount: 2,
    textCount: 1,
    commentCount: 0
  }
}
*/
```

---

### **3. Optimizing the AST**
The optimizer removes redundant nodes and merges adjacent text nodes.

```typescript
import { DOMXMLASTOptimizer } from '@obinexuscomputing/xml';

const optimizer = new DOMXMLASTOptimizer();
const optimizedAst = optimizer.optimize(ast);

console.log(optimizedAst);
/*
{
  root: {
    type: 'Element',
    name: 'root',
    children: [
      {
        type: 'Element',
        name: 'child',
        children: [
          { type: 'Text', value: 'Test' }
        ]
      }
    ]
  },
  metadata: {
    nodeCount: 3,
    elementCount: 2,
    textCount: 1,
    commentCount: 0
  }
}
*/
```

---

### **4. Validating XML**
The validator checks if the XML AST adheres to a given schema.

```typescript
import { DOMXMLValidator } from '@obinexuscomputing/xml';

const validator = new DOMXMLValidator({
  schema: {
    elements: {
      root: { children: ['child'] },
      child: { attributes: ['id'] }
    }
  }
});

const result = validator.validate(optimizedAst);

console.log(result);
/*
{
  valid: true,
  errors: []
}
*/
```

---

### **5. Generating XML**
The generator converts the AST back into a formatted XML string.

```typescript
import { DOMXMLGenerator } from '@obinexuscomputing/xml';

const generator = new DOMXMLGenerator({ prettyPrint: true });
const xmlString = generator.generate(optimizedAst);

console.log(xmlString);
/*
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <child>Test</child>
</root>
*/
```

---

## **API Reference**

### **DOMXMLTokenizer**
- **`constructor(input: string)`**: Initializes the tokenizer with an XML string.
- **`tokenize(): DOMXMLToken[]`**: Returns an array of tokens.

### **DOMXMLParser**
- **`constructor(tokens: DOMXMLToken[])`**: Initializes the parser with tokens.
- **`parse(): DOMXMLAST`**: Parses tokens into an AST.

### **DOMXMLASTOptimizer**
- **`optimize(ast: DOMXMLAST): DOMXMLAST`**: Optimizes the AST by removing redundant nodes and recalculating metadata.

### **DOMXMLValidator**
- **`constructor(options: ValidationOptions)`**: Initializes the validator with schema and custom validation options.
- **`validate(ast: DOMXMLAST): ValidationResult`**: Validates the AST against the schema.

### **DOMXMLGenerator**
- **`constructor(options: GeneratorOptions)`**: Initializes the generator with formatting options.
- **`generate(ast: DOMXMLAST): string`**: Converts the AST into a formatted XML string.

---

## **Types**

### **DOMXMLASTNode**
```typescript
interface DOMXMLASTNode {
  type: 'Element' | 'Text' | 'Comment' | 'Doctype';
  name?: string;
  value?: string;
  attributes?: Record<string, string>;
  children?: DOMXMLASTNode[];
}
```

### **DOMXMLAST**
```typescript
class DOMXMLAST {
  constructor(root: DOMXMLASTNode, metadata: DOMXMLMetadata);
  computeMetadata(): DOMXMLMetadata;
}
```

### **DOMXMLMetadata**
```typescript
interface DOMXMLMetadata {
  nodeCount: number;
  elementCount: number;
  textCount: number;
  commentCount: number;
}
```

### **ValidationOptions**
```typescript
interface ValidationOptions {
  strictMode?: boolean;
  schema?: XMLSchema;
  customValidators?: Array<(ast: DOMXMLAST) => ValidationError[]>;
}
```

---

## **Development Notes**
1. **Error Handling**: The library provides meaningful error messages for malformed XML or validation errors.
2. **Extensibility**: Easily extend functionality with custom validators or schema definitions.
3. **Performance**: Optimized for large XML documents with efficient tokenization and parsing.

---

## **Contributing**
Contributions are welcome! Please ensure that your code passes all tests and adheres to the project's style guidelines.

---

## **License**
MIT License.
