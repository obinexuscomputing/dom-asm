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
    
    const root: DOMXMLASTNode = {
      type: 'Element',
      name: 'root',
      children: [],
      attributes: {}
    };

    let currentNode: DOMXMLASTNode = root;
    const stack: DOMXMLASTNode[] = [root];

    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position++];

      switch (token.type) {
        case 'StartTag': {
          const elementNode: DOMXMLASTNode = {
            type: 'Element',
            name: token.name || '',
            attributes: token.attributes || {},
            children: []
          };

          currentNode.children?.push(elementNode);

          if (!token.selfClosing) {
            stack.push(elementNode);
            currentNode = elementNode;
          }
          break;
        }

        case 'EndTag': {
          if (stack.length <= 1) {
            throw new Error(`Unexpected closing tag "${token.name}" at line ${token.location.line}, column ${token.location.column}`);
          }

          const openTag = stack[stack.length - 1];
          if (openTag.name !== token.name) {
            throw new Error(
              `Mismatched tags: opening "${openTag.name}" and closing "${token.name}" at line ${token.location.line}, column ${token.location.column}`
            );
          }

          stack.pop();
          currentNode = stack[stack.length - 1];
          break;
        }

        case 'Text': {
          if (token.value?.trim()) {
            currentNode.children?.push({
              type: 'Text',
              value: token.value.trim()
            });
          }
          break;
        }

        case 'Comment': {
          currentNode.children?.push({
            type: 'Comment',
            value: token.value || ''
          });
          break;
        }

        case 'Doctype': {
          if (stack.length > 1) {
            throw new Error(`DOCTYPE declaration must be at root level at line ${token.location.line}, column ${token.location.column}`);
          }
          currentNode.children?.push({
            type: 'Doctype',
            value: token.value || ''
          });
          break;
        }
      }
    }

    if (stack.length > 1) {
      const unclosedTag = stack[stack.length - 1];
      throw new Error(`Unclosed tag: ${unclosedTag.name}`);
    }

    return {
      root: this.removeEmptyTextNodes(root),
      metadata: this.computeMetadata(root)
    };
  }

  private removeEmptyTextNodes(node: DOMXMLASTNode): DOMXMLASTNode {
    if (node.children) {
      node.children = node.children
        .filter(child => !(child.type === 'Text' && (!child.value || !child.value.trim())))
        .map(child => this.removeEmptyTextNodes(child));
    }
    return node;
  }

  private computeMetadata(node: DOMXMLASTNode): DOMXMLAST['metadata'] {
    let nodeCount = 0;
    let elementCount = 0;
    let textCount = 0;
    let commentCount = 0;

    const countNodes = (n: DOMXMLASTNode) => {
      nodeCount++;
      switch (n.type) {
        case 'Element':
          elementCount++;
          n.children?.forEach(countNodes);
          break;
        case 'Text':
          textCount++;
          break;
        case 'Comment':
          commentCount++;
          break;
      }
    };

    node.children?.forEach(countNodes);

    return {
      nodeCount,
      elementCount,
      textCount,
      commentCount
    };
  }
}