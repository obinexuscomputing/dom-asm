/*!
 * @obinexuscomputing/dom-asm v1.0.0
 * (c) 2024 Obinexus Computing
 * Released under the ISC License
 */
class DOMXMLAST {
    constructor(root, metadata) {
        this.root = root;
        this.metadata = metadata;
    }
    computeMetadata() {
        let nodeCount = 0;
        let elementCount = 0;
        let textCount = 0;
        let commentCount = 0;
        const traverse = (node) => {
            nodeCount++;
            switch (node.type) {
                case "Element":
                    elementCount++;
                    break;
                case "Text":
                    textCount++;
                    break;
                case "Comment":
                    commentCount++;
                    break;
            }
            node.children?.forEach(traverse);
        };
        traverse(this.root);
        return {
            nodeCount,
            elementCount,
            textCount,
            commentCount,
        };
    }
    addChildNode(parent, child) {
        parent.children = parent.children || [];
        parent.children.push(child);
    }
    removeChildNode(parent, child) {
        parent.children = parent.children?.filter((c) => c !== child) || [];
    }
}

class DOMXMLASTOptimizer {
    /**
     * Optimize the given AST by removing redundant nodes, merging text nodes, and recalculating metadata.
     */
    optimize(ast) {
        const optimizedRoot = this.optimizeNode(ast.root);
        const metadata = this.computeMetadata(optimizedRoot); // Use the optimized root
        return new DOMXMLAST(optimizedRoot, metadata);
    }
    optimizeChildren(children) {
        // First pass: Remove empty text nodes and optimize children recursively
        let optimized = children
            .filter((node) => {
            if (node.type === "Text") {
                // Keep non-empty text nodes
                return node.value?.trim() !== "";
            }
            if (node.type === "Element") {
                // Always keep elements; further optimization happens recursively
                return true;
            }
            return true; // Keep other node types (e.g., Comment, Doctype)
        })
            .map((node) => node.type === "Element" && node.children
            ? { ...node, children: this.optimizeChildren(node.children) }
            : node);
        // Second pass: Merge adjacent text nodes
        let i = 0;
        while (i < optimized.length - 1) {
            const current = optimized[i];
            const next = optimized[i + 1];
            if (current.type === "Text" && next.type === "Text") {
                current.value = (current.value || "") + (next.value || ""); // Merge text values
                optimized.splice(i + 1, 1); // Remove the merged node
            }
            else {
                i++;
            }
        }
        return optimized;
    }
    optimizeNode(node) {
        if (node.children) {
            node.children = this.optimizeChildren(node.children);
        }
        return node;
    }
    /**
     * Compute metadata for the optimized AST.
     */
    computeMetadata(root) {
        let nodeCount = 0;
        let elementCount = 0;
        let textCount = 0;
        let commentCount = 0;
        const traverse = (node) => {
            nodeCount++;
            switch (node.type) {
                case "Element":
                    elementCount++;
                    break;
                case "Text":
                    textCount++;
                    break;
                case "Comment":
                    commentCount++;
                    break;
            }
            if (node.children) {
                node.children.forEach(traverse);
            }
        };
        traverse(root);
        return { nodeCount, elementCount, textCount, commentCount };
    }
}

class DOMXMLGenerator {
    constructor(options = {}) {
        this.options = {
            indent: options.indent ?? "  ",
            newLine: options.newLine ?? "\n",
            xmlDeclaration: options.xmlDeclaration ?? true,
            prettyPrint: options.prettyPrint ?? true,
        };
    }
    generate(ast) {
        let result = "";
        if (this.options.xmlDeclaration) {
            result += '<?xml version="1.0" encoding="UTF-8"?>' + this.options.newLine;
        }
        result += this.generateNode(ast.root, 0);
        return result;
    }
    generateNode(node, depth) {
        switch (node.type) {
            case "Element":
                return this.generateElement(node, depth);
            case "Text":
                return this.generateText(node, depth);
            case "Comment":
                return this.generateComment(node, depth);
            case "Doctype":
                return this.generateDoctype(node, depth);
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }
    generateElement(node, depth) {
        const indent = this.options.prettyPrint ? this.getIndent(depth) : "";
        let result = indent + "<" + (node.name || "");
        if (node.attributes) {
            result += Object.entries(node.attributes)
                .map(([key, value]) => ` ${key}="${this.escapeAttribute(String(value))}"`)
                .join("");
        }
        if (!node.children?.length) {
            return result + "/>" + this.options.newLine;
        }
        result += ">";
        if (node.children.length === 1 && node.children[0].type === "Text") {
            result += this.escapeText(node.children[0].value || "");
            result += "</" + node.name + ">" + this.options.newLine;
            return result;
        }
        result += this.options.newLine;
        for (const child of node.children) {
            result += this.generateNode(child, depth + 1);
        }
        result += indent + "</" + node.name + ">" + this.options.newLine;
        return result;
    }
    generateText(node, depth) {
        const indent = this.options.prettyPrint ? this.getIndent(depth) : "";
        return indent + this.escapeText(node.value || "") + this.options.newLine;
    }
    generateComment(node, depth) {
        const indent = this.options.prettyPrint ? this.getIndent(depth) : "";
        return indent + "<!--" + (node.value || "") + "-->" + this.options.newLine;
    }
    generateDoctype(node, depth) {
        const indent = this.options.prettyPrint ? this.getIndent(depth) : "";
        return (indent + "<!DOCTYPE " + (node.value || "") + ">" + this.options.newLine);
    }
    getIndent(depth) {
        return this.options.indent.repeat(depth);
    }
    escapeText(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
    escapeAttribute(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }
}

class DOMXMLParser {
    constructor(tokens) {
        this.tokens = tokens || [];
        this.position = 0;
    }
    /**
     * Set new tokens for parsing.
     * @param tokens - Array of DOMXMLToken objects.
     */
    setTokens(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }
    /**
     * Parses the tokens into a DOMXMLAST.
     * @returns The parsed DOMXMLAST.
     */
    parse() {
        this.position = 0;
        const virtualRoot = {
            type: "Element",
            name: "#document",
            children: [],
            attributes: {},
        };
        const stack = [virtualRoot];
        let currentNode = virtualRoot;
        while (this.position < this.tokens.length) {
            const token = this.tokens[this.position++];
            switch (token.type) {
                case "StartTag": {
                    const elementNode = {
                        type: "Element",
                        name: token.name,
                        attributes: token.attributes || {},
                        children: [],
                    };
                    currentNode.children.push(elementNode);
                    if (!token.selfClosing) {
                        stack.push(elementNode);
                        currentNode = elementNode;
                    }
                    break;
                }
                case "EndTag": {
                    if (stack.length > 1) {
                        const openTag = stack.pop();
                        if (openTag.name !== token.name) {
                            throw new Error(`Mismatched tags: expected closing tag for "${openTag.name}", but found "${token.name}".`);
                        }
                        currentNode = stack[stack.length - 1];
                    }
                    else {
                        throw new Error(`Unexpected closing tag: "${token.name}".`);
                    }
                    break;
                }
                case "Text": {
                    const textValue = token.value?.trim();
                    if (textValue) {
                        currentNode.children.push({
                            type: "Text",
                            value: textValue,
                        });
                    }
                    break;
                }
                case "Comment": {
                    currentNode.children.push({
                        type: "Comment",
                        value: token.value || "",
                    });
                    break;
                }
                case "Doctype": {
                    currentNode.children.push({
                        type: "Doctype",
                        value: token.value || "",
                    });
                    break;
                }
                default:
                    throw new Error(`Unexpected token type: "${token.type}".`);
            }
        }
        if (stack.length > 1) {
            const unclosedTag = stack.pop();
            throw new Error(`Unclosed tag: "${unclosedTag.name}".`);
        }
        const root = virtualRoot.children[0];
        const metadata = this.computeMetadata(root);
        return new DOMXMLAST(root, metadata);
    }
    /**
     * Computes metadata for the AST.
     * @param root - The root node of the AST.
     * @returns Metadata containing node counts.
     */
    computeMetadata(root) {
        let nodeCount = 0;
        let elementCount = 0;
        let textCount = 0;
        let commentCount = 0;
        const traverse = (node) => {
            nodeCount++;
            switch (node.type) {
                case "Element":
                    elementCount++;
                    node.children?.forEach(traverse);
                    break;
                case "Text":
                    textCount++;
                    break;
                case "Comment":
                    commentCount++;
                    break;
            }
        };
        traverse(root);
        return {
            nodeCount,
            elementCount,
            textCount,
            commentCount,
        };
    }
}

class XMLBaseTokenizer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.line = 1;
        this.column = 1;
    }
    peek(offset = 0) {
        return this.input[this.position + offset] || '';
    }
    peekSequence(length) {
        return this.input.slice(this.position, this.position + length);
    }
    matches(str) {
        return this.input.startsWith(str, this.position);
    }
    consume() {
        const char = this.peek();
        if (char === '\n') {
            this.line++;
            this.column = 1; // Reset column on a new line
        }
        else {
            this.column++;
        }
        this.position++;
        return char;
    }
    consumeSequence(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += this.consume();
        }
        return result;
    }
    readUntil(stop, options = {}) {
        const { escape = false, includeStop = false, skipStop = true } = options;
        let result = '';
        let escaped = false;
        while (this.position < this.input.length) {
            const current = this.peek();
            // Handle escape sequences if `escape` is enabled
            if (escape && current === '\\' && !escaped) {
                escaped = true;
                result += this.consume();
                continue;
            }
            const matches = typeof stop === 'string' ? this.matches(stop) : stop.test(current);
            // Check for the stop condition
            if (!escaped && matches) {
                if (includeStop) {
                    if (typeof stop === 'string') {
                        result += this.consumeSequence(stop.length); // Consume the stop string
                    }
                    else {
                        result += this.consume(); // Consume the matching character
                    }
                }
                else if (skipStop) {
                    this.position += typeof stop === 'string' ? stop.length : 1; // Skip the stop character(s)
                }
                break; // Exit the loop once the stop condition is met
            }
            // Append the current character to the result
            result += this.consume();
            escaped = false; // Reset escape flag after consuming a character
        }
        return result;
    }
    readWhile(predicate) {
        let result = '';
        let index = 0;
        while (this.position < this.input.length && predicate(this.peek(), index)) {
            result += this.consume();
            index++;
        }
        return result;
    }
    skipWhitespace() {
        this.readWhile(char => /\s/.test(char));
    }
    getCurrentLocation() {
        return { line: this.line, column: this.column };
    }
    isNameChar(char) {
        return /[a-zA-Z0-9_\-:]/.test(char);
    }
    isIdentifierStart(char) {
        return /[a-zA-Z_]/.test(char);
    }
    isIdentifierPart(char) {
        return /[a-zA-Z0-9_\-]/.test(char);
    }
    readIdentifier() {
        if (!this.isIdentifierStart(this.peek())) {
            return '';
        }
        return this.readWhile((char, index) => index === 0 ? this.isIdentifierStart(char) : this.isIdentifierPart(char));
    }
    readQuotedString() {
        const quote = this.peek();
        if (quote !== '"' && quote !== "'") {
            return '';
        }
        this.consume(); // Skip opening quote
        const value = this.readUntil(quote, { escape: true });
        this.consume(); // Skip closing quote
        return value;
    }
    hasMore() {
        return this.position < this.input.length;
    }
    addError(message) {
        const location = this.getCurrentLocation();
        console.error(`Error at line ${location.line}, column ${location.column}: ${message}`);
    }
    saveState() {
        return {
            position: this.position,
            line: this.line,
            column: this.column
        };
    }
    restoreState(state) {
        this.position = state.position;
        this.line = state.line;
        this.column = state.column;
    }
}

class DOMXMLTokenizer extends XMLBaseTokenizer {
    constructor(input) {
        super(input);
    }
    tokenize() {
        const tokens = [];
        let textStart = null;
        let textContent = '';
        while (this.position < this.input.length) {
            const char = this.peek();
            const currentPosition = { line: this.line, column: this.column };
            if (char === '<') {
                // Flush accumulated text content
                if (textContent.trim()) {
                    tokens.push({
                        type: 'Text',
                        value: textContent.trim(),
                        location: textStart,
                    });
                }
                textContent = '';
                textStart = null;
                // Process tags
                if (this.matches('<!--')) {
                    tokens.push(this.readComment(currentPosition));
                }
                else if (this.matches('<!DOCTYPE')) {
                    tokens.push(this.readDoctype(currentPosition));
                }
                else if (this.peek(1) === '/') {
                    tokens.push(this.readEndTag(currentPosition));
                }
                else {
                    tokens.push(this.readStartTag(currentPosition));
                }
            }
            else {
                // Accumulate text content
                if (!textStart) {
                    textStart = { ...currentPosition };
                }
                textContent += this.consume();
            }
        }
        // Add remaining text content
        if (textContent.trim()) {
            tokens.push({
                type: 'Text',
                value: textContent.trim(),
                location: textStart,
            });
        }
        return tokens;
    }
    readText() {
        const startLocation = this.getCurrentLocation();
        const value = this.readUntil('<', { includeStop: false }); // Stop before the next tag
        return {
            type: 'Text',
            value: value.trim(),
            location: startLocation, // Correct start position of the text
        };
    }
    readStartTag(startLocation) {
        this.consume(); // Skip '<'
        const name = this.readTagName();
        const attributes = this.readAttributes();
        let selfClosing = false;
        this.skipWhitespace();
        if (this.peek() === '/') {
            selfClosing = true;
            this.consume(); // Skip '/'
        }
        if (this.peek() === '>') {
            this.consume(); // Skip '>'
        }
        return {
            type: 'StartTag',
            name,
            attributes,
            selfClosing,
            location: startLocation, // Correctly tracks initial position
        };
    }
    readEndTag(startLocation) {
        this.consumeSequence(2); // Skip '</'
        const name = this.readTagName();
        this.skipWhitespace();
        if (this.peek() === '>') {
            this.consume();
        }
        return {
            type: 'EndTag',
            name,
            location: startLocation,
        };
    }
    readComment(startLocation) {
        this.consumeSequence(4); // Skip '<!--'
        const value = this.readUntil('-->');
        this.consumeSequence(3); // Skip '-->'
        return {
            type: 'Comment',
            value: value.trim(),
            location: startLocation,
        };
    }
    readDoctype(startLocation) {
        this.consumeSequence(9); // Skip '<!DOCTYPE'
        this.skipWhitespace();
        const value = this.readUntil('>');
        this.consume(); // Skip '>'
        return {
            type: 'Doctype',
            value: value.trim(),
            location: startLocation,
        };
    }
    readAttributes() {
        const attributes = {};
        while (this.position < this.input.length) {
            this.skipWhitespace();
            if (this.peek() === '>' || this.peek() === '/' || !this.peek()) {
                break;
            }
            const name = this.readAttributeName();
            if (!name)
                break;
            this.skipWhitespace();
            if (this.peek() === '=') {
                this.consume(); // Skip '='
                this.skipWhitespace();
                attributes[name] = this.readAttributeValue();
            }
            else {
                attributes[name] = 'true'; // Boolean attribute
            }
        }
        return attributes;
    }
    readTagName() {
        return this.readWhile((char) => this.isNameChar(char));
    }
    readAttributeName() {
        return this.readWhile((char) => this.isNameChar(char));
    }
    readAttributeValue() {
        const quote = this.peek();
        if (quote === '"' || quote === "'") {
            this.consume(); // Skip opening quote
            const value = this.readUntil(quote);
            this.consume(); // Skip closing quote
            return value;
        }
        return this.readUntil(/[\s>\/]/);
    }
}

class DOMXMLValidator {
    constructor(options = {}) {
        this.options = {
            strictMode: false,
            allowUnknownElements: true,
            schema: options.schema,
            customValidators: options.customValidators || [],
        };
        this.schema = options.schema;
    }
    validate(ast) {
        const errors = [];
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
    validateNode(node, errors, path) {
        if (node.type !== "Element")
            return;
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
    validateAttributes(node, schema, errors, path) {
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
    validateChildren(node, schema, errors, path) {
        const children = node.children || [];
        const elementChildren = children.filter((child) => child.type === "Element");
        if (schema.children) {
            elementChildren.forEach((child) => {
                if (child.type === "Element" &&
                    !schema.children?.includes(child.name || "")) {
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

class DOMXML {
    constructor(options = {}) {
        this.options = {
            validateOnParse: false,
            optimizeAST: true,
            ...options,
        };
        this.tokenizer = new DOMXMLTokenizer("");
        this.parser = new DOMXMLParser();
        this.optimizer = new DOMXMLASTOptimizer();
        this.generator = new DOMXMLGenerator(options.generatorOptions);
        this.validator = new DOMXMLValidator(options.validationOptions);
    }
    parse(input) {
        this.tokenizer = new DOMXMLTokenizer(input);
        const tokens = this.tokenizer.tokenize();
        // Update parser with new tokens
        this.parser.setTokens(tokens);
        let ast = this.parser.parse();
        if (this.options.validateOnParse) {
            const validationResult = this.validator.validate(ast);
            if (!validationResult.valid) {
                throw new Error(`XML Validation failed: ${JSON.stringify(validationResult.errors)}`);
            }
        }
        if (this.options.optimizeAST) {
            ast = this.optimizer.optimize(ast);
        }
        return ast;
    }
    // Rest of the implementation remains the same
    generate(ast) {
        return this.generator.generate(ast);
    }
    validate(ast) {
        return this.validator.validate(ast);
    }
    optimize(ast) {
        return this.optimizer.optimize(ast);
    }
}

export { DOMXML, DOMXMLASTOptimizer, DOMXMLGenerator, DOMXMLParser, DOMXMLTokenizer, DOMXMLValidator, XMLBaseTokenizer };
/*!
 * End of bundle for @obinexuscomputing/dom-asm
 */
//# sourceMappingURL=index.js.map
