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
export class ASTBuilder {
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
    parseStylesheet() {
        const stylesheet = { type: 'stylesheet', children: [] };
        while (this.currentToken()) {
            const rule = this.parseRule();
            if (rule) {
                stylesheet.children.push(rule);
            }
        }
        return stylesheet;
    }
    parseRule() {
        const selector = this.parseSelector();
        if (!selector)
            return null;
        const rule = { type: 'rule', children: [selector] };
        const token = this.currentToken();
        if (token?.type === 'other' && token.value === '{') {
            this.consumeToken(); // Consume '{'
            const declarations = this.parseDeclarations();
            rule.children.push(...declarations);
            const closingBrace = this.currentToken();
            if (closingBrace?.type === 'other' && closingBrace.value === '}') {
                this.consumeToken(); // Consume '}'
            }
            else {
                throw new Error(`Unexpected token: expected '}' but found ${closingBrace?.value}`);
            }
        }
        return rule;
    }
    parseSelector() {
        const token = this.currentToken();
        if (token?.type === 'other') {
            this.consumeToken();
            return { type: 'selector', value: token.value, children: [] };
        }
        return null;
    }
    parseDeclarations() {
        const declarations = [];
        while (this.currentToken() && this.currentToken()?.value !== '}') {
            const declaration = this.parseDeclaration();
            if (declaration) {
                declarations.push(declaration);
            }
        }
        return declarations;
    }
    parseDeclaration() {
        const property = this.parseProperty();
        if (!property)
            return null;
        const token = this.currentToken();
        if (token?.type === 'other' && token.value === ':') {
            this.consumeToken(); // Consume ':'
            const value = this.parseValue();
            if (value) {
                const declaration = { type: 'declaration', children: [property, value] };
                const semicolon = this.currentToken();
                if (semicolon?.type === 'other' && semicolon.value === ';') {
                    this.consumeToken(); // Consume ';'
                }
                return declaration;
            }
        }
        return null;
    }
    parseProperty() {
        const token = this.currentToken();
        if (token?.type === 'other') {
            this.consumeToken();
            return { type: 'property', value: token.value, children: [] };
        }
        return null;
    }
    parseValue() {
        const token = this.currentToken();
        if (token?.type === 'other') {
            this.consumeToken();
            return { type: 'value', value: token.value, children: [] };
        }
        return null;
    }
    buildAST() {
        return this.parseStylesheet();
    }
}
export class Parser {
    parse(ast) {
        // Example: Convert AST into an intermediate representation (IR)
        if (ast.type === 'stylesheet') {
            return ast.children?.map((child) => this.parse(child));
        }
        if (ast.type === 'rule') {
            const selector = ast.children.find((child) => child.type === 'selector');
            const declarations = ast.children.filter((child) => child.type === 'declaration');
            return {
                selector: selector?.value,
                declarations: declarations.map((declaration) => this.parse(declaration)),
            };
        }
        if (ast.type === 'declaration') {
            const property = ast.children.find((child) => child.type === 'property');
            const value = ast.children.find((child) => child.type === 'value');
            return {
                property: property?.value,
                value: value?.value,
            };
        }
        return ast.value;
    }
}
//# sourceMappingURL=index.js.map