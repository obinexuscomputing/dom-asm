'use strict';

exports.NodeType = void 0;
(function (NodeType) {
    NodeType["Program"] = "Program";
    NodeType["VariableDeclaration"] = "VariableDeclaration";
    NodeType["InlineConstant"] = "InlineConstant";
    NodeType["Identifier"] = "Identifier";
    NodeType["Literal"] = "Literal";
    NodeType["BlockStatement"] = "BlockStatement";
    NodeType["ArrowFunction"] = "ArrowFunction";
    NodeType["TemplateLiteral"] = "TemplateLiteral";
    NodeType["TemplateLiteralExpression"] = "TemplateLiteralExpression";
    NodeType["ClassDeclaration"] = "ClassDeclaration";
    NodeType["MethodDefinition"] = "MethodDefinition";
    NodeType["PropertyDefinition"] = "PropertyDefinition";
    NodeType["FunctionExpression"] = "FunctionExpression";
    NodeType["AsyncFunction"] = "AsyncFunction";
    NodeType["ObjectExpression"] = "ObjectExpression";
    NodeType["Property"] = "Property";
    NodeType["SpreadElement"] = "SpreadElement";
    NodeType["ImportDeclaration"] = "ImportDeclaration";
    NodeType["ExportDeclaration"] = "ExportDeclaration";
    NodeType["ReturnStatement"] = "ReturnStatement";
    NodeType["Statement"] = "Statement";
    NodeType["Expression"] = "Expression";
    NodeType["BinaryExpression"] = "BinaryExpression";
    NodeType["IfStatement"] = "IfStatement";
    NodeType["FunctionDeclaration"] = "FunctionDeclaration";
})(exports.NodeType || (exports.NodeType = {}));
exports.JSTokenType = void 0;
(function (JSTokenType) {
    JSTokenType["Keyword"] = "Keyword";
    JSTokenType["Identifier"] = "Identifier";
    JSTokenType["Operator"] = "Operator";
    JSTokenType["Delimiter"] = "Delimiter";
    JSTokenType["Literal"] = "Literal";
    JSTokenType["EndOfStatement"] = "EndOfStatement";
})(exports.JSTokenType || (exports.JSTokenType = {}));
const Types = { NodeType: exports.NodeType, JSTokenType: exports.JSTokenType };

class JSTokenizer {
    constructor() {
        this.keywords = new Set(['const', 'let', 'var', 'if', 'else', 'function', 'return']);
        this.operators = new Set(['=', '+', '-', '*', '/', '%', '===', '!==', '<', '>', '==', '!=']);
        this.delimiters = new Set(['(', ')', '{', '}', '[', ']']);
    }
    tokenize(input) {
        const tokens = [];
        let current = 0;
        const addToken = (type, value) => {
            tokens.push({ type, value });
        };
        input = input.trim();
        while (current < input.length) {
            const char = input[current];
            if (this.delimiters.has(char)) {
                addToken(exports.JSTokenType.Delimiter, char);
                current++;
                continue;
            }
            if (/\s/.test(char)) {
                current++;
                continue;
            }
            if (char === ';') {
                addToken(exports.JSTokenType.Delimiter, char);
                current++;
                continue;
            }
            if (/[a-zA-Z_$]/.test(char)) {
                let value = '';
                while (current < input.length && /[a-zA-Z0-9_$]/.test(input[current])) {
                    value += input[current++];
                }
                if (this.keywords.has(value)) {
                    addToken(exports.JSTokenType.Keyword, value);
                }
                else {
                    addToken(exports.JSTokenType.Identifier, value);
                }
                continue;
            }
            if (/[0-9]/.test(char)) {
                let value = '';
                while (current < input.length && /[0-9.]/.test(input[current])) {
                    value += input[current++];
                }
                addToken(exports.JSTokenType.Literal, value);
                continue;
            }
            const multiCharOp = this.matchMultiCharOperator(input.slice(current));
            if (multiCharOp) {
                addToken(exports.JSTokenType.Operator, multiCharOp);
                current += multiCharOp.length;
                continue;
            }
            if (this.operators.has(char)) {
                addToken(exports.JSTokenType.Operator, char);
                current++;
                continue;
            }
            throw new Error(`Unexpected character: ${char}`);
        }
        addToken(exports.JSTokenType.EndOfStatement, 'EOF');
        return tokens;
    }
    matchMultiCharOperator(input) {
        const multiCharOperators = ['===', '!==', '==', '!='];
        return multiCharOperators.find(op => input.startsWith(op)) || null;
    }
}

class JSParser {
    constructor(tokens = []) {
        this.tokens = tokens;
        this.current = 0;
    }
    setTokens(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }
    parse(tokens) {
        if (tokens) {
            this.setTokens(tokens);
        }
        const children = [];
        while (this.current < this.tokens.length) {
            try {
                const node = this.walk();
                if (node) {
                    children.push(node);
                }
            }
            catch (error) {
                // Skip tokens that cause parsing errors
                this.current++;
            }
        }
        return {
            type: exports.NodeType.Program,
            children,
            body: children,
        };
    }
    walk() {
        const token = this.tokens[this.current];
        if (!token) {
            return null; // Return null instead of throwing for EOF
        }
        switch (token.type) {
            case exports.JSTokenType.Keyword:
                return this.parseKeyword();
            case exports.JSTokenType.Identifier:
                this.current++;
                return { type: exports.NodeType.Identifier, value: token.value };
            case exports.JSTokenType.Literal:
                this.current++;
                return { type: exports.NodeType.Literal, value: token.value };
            case exports.JSTokenType.EndOfStatement:
                this.current++;
                return null; // Ignore EOF or semicolon tokens
            default:
                // For unexpected tokens, throw with specific error
                throw new Error(`Unexpected token: '${token.value}'`);
        }
    }
    parseKeyword() {
        const token = this.tokens[this.current];
        switch (token.value) {
            case "if":
                return this.parseIfStatement();
            case "function":
                return this.parseFunctionDeclaration();
            case "const":
            case "let":
            case "var":
                return this.parseVariableDeclaration();
            default:
                throw new Error(`Unexpected keyword: ${token.value}`);
        }
    }
    parseIfStatement() {
        this.current++; // Skip 'if'
        if (this.tokens[this.current]?.value !== "(") {
            throw new Error("Expected '(' after 'if'");
        }
        this.current++; // Skip '('
        const condition = this.walk();
        if (!condition) {
            throw new Error("Invalid condition");
        }
        if (this.tokens[this.current]?.value !== ")") {
            throw new Error("Expected ')' after condition");
        }
        this.current++; // Skip ')'
        const consequence = this.walk();
        if (!consequence) {
            throw new Error("Invalid consequence");
        }
        let alternate;
        if (this.tokens[this.current]?.value === "else") {
            this.current++; // Skip 'else'
            alternate = this.walk(); // Non-null assertion
        }
        return {
            type: exports.NodeType.IfStatement,
            children: [condition, consequence, ...(alternate ? [alternate] : [])],
        };
    }
    parseFunctionDeclaration() {
        this.current++; // Skip 'function'
        const identifier = this.tokens[this.current];
        if (!identifier || identifier.type !== exports.JSTokenType.Identifier) {
            throw new Error("Expected function name");
        }
        this.current++;
        if (this.tokens[this.current]?.value !== "(") {
            throw new Error("Expected '(' after function name");
        }
        this.current++; // Skip '('
        const parameters = [];
        while (this.current < this.tokens.length && this.tokens[this.current]?.value !== ")") {
            const param = this.tokens[this.current];
            if (param.type !== exports.JSTokenType.Identifier) {
                throw new Error("Expected parameter identifier");
            }
            parameters.push({ type: exports.NodeType.Identifier, value: param.value });
            this.current++;
            if (this.tokens[this.current]?.value === ",") {
                this.current++; // Skip ','
            }
        }
        if (this.tokens[this.current]?.value !== ")") {
            throw new Error("Expected ')' after parameters");
        }
        this.current++; // Skip ')'
        const body = this.parseBlockStatement();
        return {
            type: exports.NodeType.FunctionDeclaration,
            value: identifier.value,
            children: [...parameters, body],
        };
    }
    parseVariableDeclaration() {
        const keyword = this.tokens[this.current];
        this.current++; // Skip 'const', 'let', or 'var'
        const identifier = this.tokens[this.current];
        if (!identifier || identifier.type !== exports.JSTokenType.Identifier) {
            throw new Error("Expected variable name");
        }
        this.current++;
        if (this.tokens[this.current]?.value !== "=") {
            throw new Error("Expected '=' after variable name");
        }
        this.current++; // Skip '='
        const initializer = this.walk();
        if (!initializer) {
            throw new Error("Invalid initializer");
        }
        // Optionally skip semicolon if present
        if (this.tokens[this.current]?.value === ";") {
            this.current++; // Skip ';'
        }
        return {
            type: exports.NodeType.VariableDeclaration,
            value: keyword.value,
            children: [
                { type: exports.NodeType.Identifier, value: identifier.value },
                initializer,
            ],
        };
    }
    parseBlockStatement() {
        if (this.tokens[this.current]?.value !== "{") {
            throw new Error("Expected '{' to start block statement");
        }
        this.current++; // Skip '{'
        const children = [];
        while (this.tokens[this.current]?.value !== "}") {
            if (this.current >= this.tokens.length) {
                throw new Error("Expected '}' to close block statement");
            }
            const node = this.walk();
            if (node) {
                children.push(node);
            }
        }
        this.current++; // Skip '}'
        return {
            type: exports.NodeType.BlockStatement,
            children,
        };
    }
}

class JSValidator {
    constructor() {
        this.errors = [];
    }
    validate(ast) {
        this.errors = [];
        this.traverse(ast);
        return this.errors;
    }
    addError(code, message, node) {
        this.errors.push({ code, message, node });
    }
    traverse(node) {
        const validNodeTypes = [
            "Program", "VariableDeclaration", "InlineConstant", "Identifier",
            "Literal", "BlockStatement", "ArrowFunction", "TemplateLiteral",
            "TemplateLiteralExpression", "ClassDeclaration", "MethodDefinition",
            "PropertyDefinition", "FunctionExpression", "AsyncFunction",
            "ObjectExpression", "Property", "SpreadElement", "ImportDeclaration",
            "ExportDeclaration"
        ];
        if (!validNodeTypes.includes(node.type)) {
            this.addError("E001", `Unknown node type: ${node.type}`, node);
            return;
        }
        switch (node.type) {
            case "Program":
                this.validateProgram(node);
                break;
            case "VariableDeclaration":
                this.validateVariableDeclaration(node);
                break;
            case "BlockStatement":
                this.validateBlockStatement(node);
                break;
            case "ArrowFunction":
                this.validateArrowFunction(node);
                break;
            case "TemplateLiteral":
                this.validateTemplateLiteral(node);
                break;
            case "ClassDeclaration":
                this.validateClass(node);
                break;
            case "MethodDefinition":
                this.validateMethodDefinition(node);
                break;
            case "AsyncFunction":
                this.validateAsyncFunction(node);
                break;
            case "ObjectExpression":
                this.validateObjectExpression(node);
                break;
            case "Property":
                this.validateProperty(node);
                break;
            case "ImportDeclaration":
                this.validateImport(node);
                break;
            case "ExportDeclaration":
                this.validateExport(node);
                break;
            case "InlineConstant":
                this.validateInlineConstant(node);
                break;
            case "Identifier":
                this.validateIdentifier(node);
                break;
            case "Literal":
                this.validateLiteral(node);
                break;
        }
        if (node.children) {
            for (const child of node.children) {
                this.traverse(child);
            }
        }
    }
    validateProgram(node) {
        if (!node.children?.length) {
            this.addError("E002", "Program must contain at least one statement.", node);
        }
    }
    validateVariableDeclaration(node) {
        if (!node.children?.length) {
            this.addError("E004", "Invalid VariableDeclaration: insufficient children.", node);
            return;
        }
        if (!node.value || !["let", "const", "var"].includes(node.value)) {
            this.addError("E005", "Variable declaration must specify kind (let, const, or var).", node);
        }
    }
    validateBlockStatement(node) {
        // Block statements can be empty, no validation needed
    }
    validateArrowFunction(node) {
        if (!node.children?.length) {
            this.addError("E007", "Arrow function must have a body.", node);
        }
    }
    validateTemplateLiteral(node) {
        // Template literals can be empty, no validation needed
    }
    validateClass(node) {
        if (!node.value) {
            this.addError("E015", "Class declaration must have a name.", node);
        }
    }
    validateMethodDefinition(node) {
        if (!node.value) {
            this.addError("E016", "Class method must have a name.", node);
        }
    }
    validateAsyncFunction(node) {
        if (!node.children?.some(child => child.type === "BlockStatement")) {
            this.addError("E019", "Async function must have a body.", node);
        }
    }
    validateObjectExpression(node) {
        const properties = new Set();
        node.children?.forEach(prop => {
            if (prop.type === "Property" && prop.value) {
                if (properties.has(prop.value)) {
                    this.addError("E010", `Duplicate key '${prop.value}' in object literal.`, prop);
                }
                properties.add(prop.value);
            }
        });
    }
    validateProperty(node) {
        if (!node.value) {
            this.addError("E011", "Property must have a name.", node);
        }
    }
    validateImport(node) {
        if (!node.children?.length) {
            this.addError("E021", "Import declaration must specify imported values.", node);
        }
    }
    validateExport(node) {
        if (!node.children?.length && !node.value) {
            this.addError("E022", "Export declaration must have exported values.", node);
        }
    }
    validateInlineConstant(node) {
        if (!node.value) {
            this.addError("E024", "InlineConstant must have a value.", node);
        }
    }
    validateIdentifier(node) {
        if (!node.value || !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(node.value)) {
            this.addError("E025", `Invalid identifier name: ${node.value}`, node);
        }
    }
    validateLiteral(node) {
        if (!node.value) {
            this.addError("E026", "Literal must have a value.", node);
        }
    }
}

class JSAstGenerator {
    constructor() {
        this.tokenizer = new JSTokenizer();
        this.validator = new JSValidator();
        this.parser = new JSParser();
    }
    convertToTypedNode(node) {
        const nodeType = exports.NodeType[node.type];
        if (!nodeType) {
            throw new Error(`Invalid node type: ${node.type}`);
        }
        return {
            type: nodeType,
            value: node.value,
            children: node.children?.map((child) => this.convertToTypedNode(child)),
            line: node.line,
            column: node.column,
        };
    }
    generateFromSource(source, options = {}) {
        try {
            if (!source) {
                throw new Error("Source code cannot be undefined or empty");
            }
            // Tokenize the source code
            const tokens = this.tokenizer.tokenize(source);
            // Parse the tokens into an initial AST
            const rawAst = this.parser.parse(tokens);
            // Ensure the AST conforms to TypedJSASTNode
            const typedAst = this.convertToTypedNode(rawAst);
            return this.processAST(typedAst, options);
        }
        catch (err) {
            return {
                success: false,
                errors: [
                    {
                        code: "E000",
                        message: err instanceof Error ? err.message : "Unknown error occurred",
                    },
                ],
                ast: undefined,
            };
        }
    }
    generateFromAST(ast, options = {}) {
        try {
            return this.processAST(ast, options);
        }
        catch (err) {
            return {
                success: false,
                errors: [
                    {
                        code: "E000",
                        message: err instanceof Error ? err.message : "Unknown error occurred",
                    },
                ],
                ast: ast,
            };
        }
    }
    processAST(ast, options) {
        const result = {
            success: true,
            ast: ast,
        };
        if (options.validate) {
            const validationErrors = this.validator.validate(ast);
            if (validationErrors.length > 0) {
                return {
                    success: false,
                    errors: this.convertValidationErrors(validationErrors),
                    ast: ast,
                };
            }
        }
        try {
            const code = this.generateCode(ast, options);
            return {
                ...result,
                code,
            };
        }
        catch (err) {
            return {
                success: false,
                errors: [
                    {
                        code: "E001",
                        message: err instanceof Error ? err.message : "Code generation failed",
                    },
                ],
                ast: ast,
            };
        }
    }
    convertValidationErrors(validationErrors) {
        return validationErrors.map((error) => ({
            code: error.code,
            message: error.message,
            location: {
                line: error.node.line,
                column: error.node.column,
            },
        }));
    }
    generateCode(ast, options) {
        const codeParts = [];
        this.traverseAST(ast, codeParts);
        const rawCode = codeParts.join(" ").trim();
        return this.formatOutput(rawCode, options);
    }
    traverseAST(node, codeParts) {
        switch (node.type) {
            case exports.NodeType.Program:
                node.children?.forEach((child) => this.traverseAST(child, codeParts));
                break;
            case exports.NodeType.VariableDeclaration:
                codeParts.push(`${node.value} `);
                node.children?.forEach((child) => this.traverseAST(child, codeParts));
                codeParts.push(";");
                break;
            case exports.NodeType.Identifier:
            case exports.NodeType.Literal:
                codeParts.push(node.value || "");
                break;
            case exports.NodeType.BinaryExpression:
                if (node.children && node.children.length === 2) {
                    this.traverseAST(node.children[0], codeParts);
                    codeParts.push(` ${node.value} `);
                    this.traverseAST(node.children[1], codeParts);
                }
                break;
            default:
                throw new Error(`Unsupported node type: ${node.type}`);
        }
    }
    formatOutput(code, options) {
        if (options.format === "compact") {
            return this.formatCompact(code);
        }
        return this.formatPretty(code, options.indent || "  ");
    }
    formatCompact(code) {
        return code
            .replace(/\s+/g, " ")
            .replace(/\s*([{}[\],;()])\s*/g, "$1")
            .replace(/\s*=\s*/g, "=")
            .replace(/;\s*/g, ";")
            .trim();
    }
    formatPretty(code, indent) {
        const segments = code.split(/({|}|;)/).filter(Boolean);
        let level = 0;
        let result = "";
        for (const segment of segments) {
            const trimmed = segment.trim();
            if (!trimmed)
                continue;
            if (trimmed === "}") {
                level = Math.max(0, level - 1);
                result += `${indent.repeat(level)}}\n`;
            }
            else if (trimmed === "{") {
                result += " {\n";
                level++;
            }
            else if (trimmed === ";") {
                result += ";\n";
            }
            else {
                result += `${indent.repeat(level)}${trimmed}\n`;
            }
        }
        return result.trimEnd();
    }
}

class JSASTBuilder {
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }
    currentToken() {
        return this.position < this.tokens.length ? this.tokens[this.position] : null;
    }
    consumeToken() {
        if (this.position >= this.tokens.length) {
            throw new Error('Unexpected end of input');
        }
        return this.tokens[this.position++];
    }
    peekToken() {
        return this.position + 1 < this.tokens.length ? this.tokens[this.position + 1] : null;
    }
    parseProgram() {
        const program = {
            type: exports.NodeType.Program,
            children: []
        };
        while (this.position < this.tokens.length - 1) {
            const statement = this.parseStatement();
            if (statement) {
                program.children.push(statement);
            }
        }
        return program;
    }
    parseStatement() {
        const token = this.currentToken();
        if (!token) {
            return null;
        }
        if (token.type === exports.JSTokenType.Keyword && token.value === "const") {
            return this.parseVariableDeclaration();
        }
        throw new Error(`Unexpected token: ${token.value}`);
    }
    parseVariableDeclaration() {
        this.consumeToken(); // Consume 'const'
        const identifier = this.consumeToken();
        if (!identifier || identifier.type !== exports.JSTokenType.Identifier) {
            throw new Error("Expected identifier after 'const'");
        }
        const equals = this.consumeToken();
        if (!equals || equals.type !== exports.JSTokenType.Operator || equals.value !== "=") {
            throw new Error("Expected '=' after identifier");
        }
        const value = this.consumeToken();
        if (!value || value.type !== exports.JSTokenType.Literal) {
            throw new Error("Expected literal value after '='");
        }
        const semicolon = this.consumeToken();
        if (!semicolon || semicolon.type !== exports.JSTokenType.Delimiter || semicolon.value !== ";") {
            throw new Error("Expected ';' after value");
        }
        return {
            type: exports.NodeType.VariableDeclaration,
            children: [
                { type: exports.NodeType.Identifier, value: identifier.value, children: [] },
                { type: exports.NodeType.Literal, value: value.value, children: [] },
            ],
        };
    }
    buildAST() {
        return this.parseProgram();
    }
}

class JSAstMinimizer {
    constructor() {
        this.uniqueNodes = new Map();
    }
    minimize(ast) {
        this.uniqueNodes.clear();
        return this.traverse(ast);
    }
    optimize(ast) {
        return this.traverse(ast, true);
    }
    traverse(node, optimize = false) {
        const key = `${node.type}:${node.value || ""}`;
        if (this.uniqueNodes.has(key)) {
            return this.uniqueNodes.get(key);
        }
        const processedNode = { ...node };
        if (node.children) {
            processedNode.children = node.children.map(child => this.traverse(child, optimize));
        }
        if (optimize) {
            return this.performOptimization(processedNode);
        }
        this.uniqueNodes.set(key, processedNode);
        return processedNode;
    }
    performOptimization(node) {
        if (node.type === exports.NodeType.Program) {
            return {
                ...node,
                children: node.children?.map(child => this.simplifyNode(child)) || []
            };
        }
        if (node.type === exports.NodeType.VariableDeclaration && node.children) {
            const [identifier, value] = node.children;
            if (value.type === exports.NodeType.Literal) {
                return {
                    type: exports.NodeType.InlineConstant,
                    value: `${identifier.value}=${value.value}`,
                    children: []
                };
            }
        }
        return node;
    }
    simplifyNode(node) {
        if (!Object.values(exports.NodeType).includes(node.type)) {
            return node;
        }
        return node;
    }
}

exports.JSASTBuilder = JSASTBuilder;
exports.JSAstGenerator = JSAstGenerator;
exports.JSAstMinimizer = JSAstMinimizer;
exports.JSParser = JSParser;
exports.JSTokenizer = JSTokenizer;
exports.JSValidator = JSValidator;
exports.Types = Types;
//# sourceMappingURL=index.cjs.map
