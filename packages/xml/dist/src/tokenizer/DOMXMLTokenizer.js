import { XMLBaseTokenizer } from './XMLBaseTokenizer';
export class DOMXMLTokenizer extends XMLBaseTokenizer {
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
//# sourceMappingURL=DOMXMLTokenizer.js.map