// Example usage:
// import { Tokenizer } from "../tokenizer";
// const cssInput = `/* Example CSS */
// body {
//   background: white;
//   color: black;
// }`;
// const tokenizer = new Tokenizer(cssInput);
// const tokens = tokenizer.tokenize();
// const astBuilder = new ASTBuilder(tokens);
// console.log(JSON.stringify(astBuilder.buildAST(), null, 2));
export class JSASTBuilder {
    tokens;
    position;
    constructor(tokens) {
        this.tokens = tokens;
        this.position = 0;
    }
    currentToken() {
        return this.position < this.tokens.length ? this.tokens[this.position] : null;
    }
    consumeToken() {
        const token = this.currentToken();
        if (token)
            this.position++;
        return token;
    }
    parseProgram() {
        const program = { type: 'Program', children: [] };
        while (this.currentToken()) {
            const statement = this.parseStatement();
            if (statement) {
                program.children.push(statement);
            }
        }
        return program;
    }
    parseStatement() {
        const token = this.currentToken();
        if (token?.type === 'keyword' && token.value === 'const') {
            return this.parseVariableDeclaration();
        }
        if (token?.type === 'number' || token?.type === 'string') {
            return this.parseInlineConstant();
        }
        return null;
    }
    parseVariableDeclaration() {
        this.consumeToken(); // Consume 'const'
        const identifier = this.currentToken();
        if (!identifier || identifier.type !== 'identifier') {
            throw new Error("Expected identifier after 'const'");
        }
        this.consumeToken();
        const equals = this.currentToken();
        if (!equals || equals.value !== '=') {
            throw new Error("Expected '=' after identifier");
        }
        this.consumeToken();
        const value = this.parseValue();
        if (!value) {
            throw new Error("Expected value after '='");
        }
        return { type: 'VariableDeclaration', children: [
                { type: 'Identifier', value: identifier.value, children: [] },
                value
            ] };
    }
    parseInlineConstant() {
        const token = this.consumeToken();
        return { type: 'InlineConstant', value: token.value, children: [] };
    }
    parseValue() {
        const token = this.currentToken();
        if (token?.type === 'number' || token?.type === 'string') {
            return this.parseInlineConstant();
        }
        return null;
    }
    buildAST() {
        return this.parseProgram();
    }
}
export class JSParser {
    parse(ast) {
        // Example: Convert AST into an intermediate representation (IR)
        if (ast.type === 'Program') {
            return ast.children?.map((child) => this.parse(child));
        }
        if (ast.type === 'VariableDeclaration') {
            const identifier = ast.children[0];
            const value = ast.children[1];
            return `const ${identifier.value} = ${this.parse(value)};`;
        }
        if (ast.type === 'InlineConstant') {
            return ast.value;
        }
        return '';
    }
}
//# sourceMappingURL=index.js.map