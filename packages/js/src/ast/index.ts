import { Token, TokenType } from "../tokenizer";

export interface ASTNode {
    type: string;          // Node type (e.g., VariableDeclaration, Literal)
    value?: string;        // Value of the node
    children?: ASTNode[];  // Child nodes
  }
  
  export class ASTBuilder {
    build(tokens: Token[]): ASTNode {
      const root: ASTNode = { type: 'Program', children: [] };
      let current = 0;
  
      function walk(): ASTNode {
        const token = tokens[current];
  
        if (token.type === TokenType.Literal) {
          current++;
          return { type: 'Literal', value: token.value };
        }
  
        if (token.type === TokenType.Identifier) {
          current++;
          return { type: 'Identifier', value: token.value };
        }
  
        if (token.type === TokenType.Keyword && token.value === 'const') {
          current++;
          const identifier = walk(); // Identifier
          current++; // Skip '='
          const value = walk(); // Value (expression or literal)
          current++; // Skip ';'
  
          return {
            type: 'VariableDeclaration',
            value: 'const',
            children: [identifier, value],
          };
        }
  
throw new Error(`Unexpected token: ${token.type === TokenType.EndOfStatement ? 'EOF' : token.value}`);
     }
  
      while (current < tokens.length && tokens[current].type !== TokenType.EndOfStatement) {
        root.children?.push(walk());
      }
  
      return root;
    }
  }
  