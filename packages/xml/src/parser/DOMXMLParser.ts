import { DOMXMLAST, DOMXMLASTNode } from "../ast";
import { DOMXMLToken } from "../tokenizer";

export class DOMXMLParser {
  private tokens: DOMXMLToken[];
  private position: number;

  constructor(tokens?: DOMXMLToken[]) {
    this.tokens = tokens || [];
    this.position = 0;
  }

  public setTokens(tokens: DOMXMLToken[]): void {
    this.tokens = tokens;
    this.position = 0;
  }

  public parse(): DOMXMLAST {
    this.position = 0;

    // Initialize root node with explicit children array
    const root: DOMXMLASTNode = {
      type: 'Element',
      name: 'root',
      children: [],
      attributes: {}  // Add explicit empty attributes
    };

    const stack: DOMXMLASTNode[] = [root];
    let currentParent = root;

    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position++];

      switch (token.type) {
        case 'StartTag': {
          if (!token.name) {
            throw new Error(`Missing tag name at line ${token.location.line}, column ${token.location.column}`);
          }

          const elementNode: DOMXMLASTNode = {
            type: 'Element',
            name: token.name,
            attributes: token.attributes || {},
            children: []  // Always initialize children array
          };

          // Ensure currentParent has a children array
          if (!currentParent.children) {
            currentParent.children = [];
          }
          currentParent.children.push(elementNode);

          if (!token.selfClosing) {
            stack.push(elementNode);
            currentParent = elementNode;
          }
          break;
        }

        case 'EndTag': {
          if (stack.length > 1) {
            const expectedTagName = currentParent.name;
            if (expectedTagName !== token.name) {
              throw new Error(
                `Mismatched tags: opening "${expectedTagName}" and closing "${token.name}" at line ${token.location.line}, column ${token.location.column}`
              );
            }
            stack.pop();
            currentParent = stack[stack.length - 1];
          }
          break;
        }

        case 'Text': {
          if (!currentParent.children) {
            currentParent.children = [];
          }
          const trimmedValue = token.value?.trim();
          if (trimmedValue) {
            currentParent.children.push({
              type: 'Text',
              value: trimmedValue
            });
          }
          break;
        }

        case 'Comment': {
          if (!currentParent.children) {
            currentParent.children = [];
          }
          currentParent.children.push({
            type: 'Comment',
            value: token.value || ''
          });
          break;
        }

        case 'Doctype': {
          if (!currentParent.children) {
            currentParent.children = [];
          }
          currentParent.children.push({
            type: 'Doctype',
            value: token.value || ''
          });
          break;
        }

        default:
          throw new Error(`Unexpected token type: ${(token as DOMXMLToken).type}`);
      }
    }

    if (stack.length > 1) {
      const unclosedTag = stack[stack.length - 1];
      throw new Error(`Unclosed tag: ${unclosedTag.name}`);
    }

    return {
      root,
      metadata: this.computeMetadata(root)
    };
  }

  private computeMetadata(root: DOMXMLASTNode) {
    let nodeCount = 0;
    let elementCount = 0;
    let textCount = 0;
    let commentCount = 0;

    const traverse = (node: DOMXMLASTNode, isRoot = false) => {
      if (!isRoot) {
        nodeCount++;
        switch (node.type) {
          case 'Element':
            elementCount++;
            break;
          case 'Text':
            textCount++;
            break;
          case 'Comment':
            commentCount++;
            break;
        }
      }
      node.children?.forEach((child) => traverse(child));
    };

    traverse(root, true);
    return {
      nodeCount,
      elementCount,
      textCount,
      commentCount
    };
  }
}