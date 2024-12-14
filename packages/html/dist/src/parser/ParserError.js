"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserError = void 0;
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
