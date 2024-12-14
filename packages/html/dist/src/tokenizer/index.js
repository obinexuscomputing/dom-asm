"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLTokenizer = void 0;
class HTMLTokenizer {
    constructor(input) {
        this.position = 0;
        this.input = input;
    }
    tokenize() {
        const tokens = [];
        while (this.position < this.input.length) {
            const char = this.input[this.position];
            if (char === '<') {
                if (this.input[this.position + 1] === '/') {
                    tokens.push(this.readEndTag());
                }
                else if (this.input[this.position + 1] === '!') {
                    tokens.push(this.readComment());
                }
                else {
                    tokens.push(this.readStartTag());
                }
            }
            else {
                tokens.push(this.readText());
            }
        }
        return tokens;
    }
    readStartTag() {
        this.position++; // Skip '<'
        const name = this.readUntil(/[ \/>]/);
        const attributes = {};
        while (this.input[this.position] !== '>' && this.input[this.position] !== '/') {
            const attrName = this.readUntil('=').trim();
            this.position++; // Skip '='
            const quote = this.input[this.position];
            this.position++; // Skip opening quote
            const attrValue = this.readUntil(new RegExp(`${quote}`));
            attributes[attrName] = attrValue;
            this.position++; // Skip closing quote
        }
        if (this.input[this.position] === '/') {
            this.position++; // Skip '/'
        }
        this.position++; // Skip '>'
        return { type: 'StartTag', name, attributes };
    }
    readEndTag() {
        this.position += 2; // Skip '</'
        const name = this.readUntil('>');
        this.position++; // Skip '>'
        return { type: 'EndTag', name };
    }
    readComment() {
        this.position += 4; // Skip '<!--'
        const value = this.readUntil('-->');
        this.position += 3; // Skip '-->'
        return { type: 'Comment', value };
    }
    readText() {
        const value = this.readUntil('<');
        return { type: 'Text', value };
    }
    readUntil(stopChar) {
        const start = this.position;
        while (this.position < this.input.length &&
            !(typeof stopChar === 'string' ? this.input[this.position] === stopChar : stopChar.test(this.input[this.position]))) {
            this.position++;
        }
        return this.input.slice(start, this.position);
    }
}
exports.HTMLTokenizer = HTMLTokenizer;
