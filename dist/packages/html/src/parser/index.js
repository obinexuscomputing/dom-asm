import { HTMLTokenizer } from "../tokenizer/index";
import { AST } from "../ast/index";
import { Validator } from "../validator/index";
function isTextNode(node) {
    return node.type === "Text";
}
function isElementNode(node) {
    return node.type === "Element";
}
export class HTMLParserError extends Error {
    token;
    position;
    constructor(message, token, position) {
        super(message);
        this.name = "HTMLParserError";
        this.token = token;
        this.position = position;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HTMLParserError);
        }
    }
}
export class HTMLParser {
    tokenizer;
    astBuilder;
    validator;
    errorHandler = null;
    shouldThrow = true;
    constructor(options = { throwOnError: true }) {
        this.tokenizer = new HTMLTokenizer("");
        this.astBuilder = new AST();
        this.validator = new Validator();
        this.shouldThrow = options.throwOnError;
    }
    setErrorHandler(handler) {
        this.errorHandler = handler;
        this.shouldThrow = false;
    }
    handleError(error, quiet = false) {
        if (this.errorHandler) {
            this.errorHandler(error);
        }
        else {
            if (this.shouldThrow) {
                throw error;
            }
            if (!quiet) {
                console.error(`Error at position ${error.position}: ${error.message}`);
                console.error(`Problematic token: ${JSON.stringify(error.token)}`);
            }
        }
    }
    isWhitespace(str) {
        return /^\s*$/.test(str);
    }
    parse(input) {
        this.tokenizer = new HTMLTokenizer(input);
        const tokens = this.tokenizer.tokenize();
        const ast = this.buildASTWithRecovery(tokens);
        this.cleanWhitespace(ast);
        return ast;
    }
    cleanWhitespace(node) {
        if (node.children) {
            // First clean children recursively before filtering current level
            node.children.forEach(child => this.cleanWhitespace(child));
            // Then filter whitespace at current level
            node.children = node.children.filter(child => {
                if (isTextNode(child)) {
                    return !this.isWhitespace(child.value);
                }
                return true;
            });
        }
    }
    buildASTWithRecovery(tokens) {
        const root = this.astBuilder.getRoot();
        const stack = [root];
        let currentParent = root;
        let skipUntilTag = null;
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            // Skip tokens if we're in recovery mode
            if (skipUntilTag && token.type === "EndTag" && token.name === skipUntilTag) {
                skipUntilTag = null;
                continue;
            }
            if (skipUntilTag)
                continue;
            try {
                switch (token.type) {
                    case "StartTag": {
                        const elementNode = {
                            type: "Element",
                            name: token.name,
                            attributes: token.attributes,
                            children: [],
                            parent: currentParent
                        };
                        currentParent.children.push(elementNode);
                        stack.push(elementNode);
                        currentParent = elementNode;
                        break;
                    }
                    case "EndTag": {
                        const matchingStartIndex = stack.findIndex(node => node.name === token.name);
                        if (matchingStartIndex === -1) {
                            throw new HTMLParserError(`Unmatched end tag: </${token.name}>. Expected </${isElementNode(currentParent) ? currentParent.name : "unknown"}>.`, token, i);
                        }
                        // Pop all nodes up to and including the matching start tag
                        while (stack.length > matchingStartIndex) {
                            stack.pop();
                        }
                        currentParent = stack[stack.length - 1];
                        break;
                    }
                    case "Text": {
                        const textNode = {
                            type: "Text",
                            value: token.value,
                            children: [],
                            parent: currentParent
                        };
                        currentParent.children.push(textNode);
                        break;
                    }
                    case "Comment": {
                        const commentNode = {
                            type: "Comment",
                            value: token.value,
                            children: [],
                            parent: currentParent
                        };
                        currentParent.children.push(commentNode);
                        break;
                    }
                }
            }
            catch (error) {
                if (error instanceof HTMLParserError) {
                    this.handleError(error);
                    if (!this.shouldThrow) {
                        // Set recovery mode to skip until matching end tag
                        if (isElementNode(currentParent)) {
                            skipUntilTag = currentParent.name;
                        }
                        continue;
                    }
                    throw error;
                }
                throw error;
            }
        }
        // Handle any unclosed tags at the end
        while (stack.length > 1) {
            const unclosedNode = stack.pop();
            this.handleError(new HTMLParserError(`Unclosed tag: <${unclosedNode.name}>`, { type: "StartTag", name: unclosedNode.name, attributes: {} }, tokens.length), true // Quiet mode for unclosed tags
            );
        }
        return root;
    }
}
//# sourceMappingURL=index.js.map