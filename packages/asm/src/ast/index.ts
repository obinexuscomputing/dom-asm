import { Token } from "typescript/lib/typescript";

export interface ASTNode {
  type: string;
  value?: string;
  children?: ASTNode[];
}

export function buildAST(tokens: Token[]): ASTNode {
  const root: ASTNode = { type: "Program", children: [] };
  const stack: ASTNode[] = [root];

  for (const token of tokens) {
    const currentNode = stack[stack.length - 1];

    switch (token.type) {
      case "IDENTIFIER":
      case "NUMBER":
        currentNode.children!.push({ type: "Literal", value: token.value });
        break;
      case "PUNCTUATION":
        if (token.value === "{") {
          const newNode: ASTNode = { type: "Block", children: [] };
          currentNode.children!.push(newNode);
          stack.push(newNode);
        } else if (token.value === "}") {
          stack.pop();
        }
        break;
      default:
        // Handle operators or other token types
        currentNode.children!.push({ type: token.type, value: token.value });
    }
  }

  return root;
}
