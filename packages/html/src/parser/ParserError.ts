import { Token } from "../tokenizer";

export class ParserError extends Error {
    token: Token;
    position: number;
  
    constructor(message: string, token: Token, position: number) {
      super(message);
      this.name = "ParserError";
      this.token = token;
      this.position = position;
  
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ParserError);
      }
    }
  }
  