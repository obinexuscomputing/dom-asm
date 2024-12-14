"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = exports.ParserError = void 0;
const index_1 = require("../tokenizer/index");
const index_2 = require("../ast/index");
const index_3 = require("../validator/index");
class ParserError extends Error {
    constructor(message, token, position) {
        super(message);
        this.name = "ParserError";
        this.token = token;
        this.position = position;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ParserError);
        }
    }
}
exports.ParserError = ParserError;
class Parser {
    constructor(options = { throwOnError: true }) {
        this.errorHandler = null;
        this.shouldThrow = true;
        this.tokenizer = new index_1.HTMLTokenizer("");
        this.astBuilder = new index_2.AST();
        this.validator = new index_3.Validator();
        this.shouldThrow = options.throwOnError;
    }
    setErrorHandler(handler) {
        this.errorHandler = handler;
        this.shouldThrow = false;
    }
    handleError(error) {
        if (this.errorHandler) {
            this.errorHandler(error);
        }
        else {
            if (this.shouldThrow) {
                throw error;
            }
            console.error(`Error at position ${error.position}: ${error.message}`);
            console.error(`Problematic token: ${JSON.stringify(error.token)}`);
        }
    }
    parse(input) {
        this.tokenizer = new index_1.HTMLTokenizer(input);
        const tokens = this.tokenizer.tokenize();
        return this.buildASTWithRecovery(tokens);
    }
    isElementNode(node) {
        return node.type === "Element";
    }
    buildASTWithRecovery(tokens) {
        const stack = [this.astBuilder.getRoot()];
        let currentParent = stack[0];
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
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
                        const matchingStartIndex = stack.findIndex(node => this.isElementNode(node) && node.name === token.name);
                        if (matchingStartIndex === -1) {
                            throw new ParserError(`Unmatched end tag: </${token.name}>. Expected </${this.isElementNode(currentParent) ? currentParent.name : "unknown"}>.`, token, i);
                        }
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
                if (error instanceof ParserError) {
                    this.handleError(error);
                    if (!this.shouldThrow) {
                        continue;
                    }
                }
                throw error;
            }
        }
        // Handle any unclosed tags at the end
        while (stack.length > 1) {
            const unclosedNode = stack.pop();
            if (this.isElementNode(unclosedNode)) {
                this.handleError(new ParserError(`Unclosed tag: <${unclosedNode.name}>`, { type: "StartTag", name: unclosedNode.name, attributes: {} }, tokens.length));
            }
        }
        return stack[0];
    }
}
exports.Parser = Parser;
