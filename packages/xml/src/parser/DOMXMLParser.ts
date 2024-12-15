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
    
    // Create document root
    const documentRoot: DOMXMLASTNode = {
      type: 'Element',
      name: 'root',
      children: [],
      attributes: {}
    };

    const stack: DOMXMLASTNode[] = [documentRoot];
    let currentNode = documentRoot;

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

          // Always add to current node's children
          if (!currentNode.children) {
            currentNode.children = [];
          }
          currentNode.children.push(elementNode);

          // Push to stack if not self-closing
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
            const textNode: DOMXMLASTNode = {
              type: 'Text',
              value: token.value.trim()
            };
            if (!currentNode.children) {
              currentNode.children = [];
            }
            currentNode.children.push(textNode);
          }
          break;
        }

        case 'Comment': {
          const commentNode: DOMXMLASTNode = {
            type: 'Comment',
            value: token.value || ''
          };
          if (!currentNode.children) {
            currentNode.children = [];
          }
          currentNode.children.push(commentNode);
          break;
        }

        case 'Doctype': {
          if (stack.length > 1) {
            throw new Error(`DOCTYPE declaration must be at root level at line ${token.location.line}, column ${token.location.column}`);
          }
          const doctypeNode: DOMXMLASTNode = {
            type: 'Doctype',
            value: token.value || ''
          };
          if (!currentNode.children) {
            currentNode.children = [];
          }
          currentNode.children.push(doctypeNode);
          break;
        }
      }
    }

    // Check for unclosed tags
    if (stack.length > 1) {
      const unclosedTag = stack[stack.length - 1];
      throw new Error(`Unclosed tag: ${unclosedTag.name}`);
    }

    return {
      root: documentRoot,
      metadata: this.computeMetadata(documentRoot)
    };
  }

  private computeMetadata(root: DOMXMLASTNode): DOMXMLAST['metadata'] {
    let nodeCount = 0;
    let elementCount = 0;
    let textCount = 0;
    let commentCount = 0;

    const countNode = (node: DOMXMLASTNode) => {
      nodeCount++;
      
      switch (node.type) {
        case 'Element':
          elementCount++;
          node.children?.forEach(countNode);
          break;
        case 'Text':
          textCount++;
          break;
        case 'Comment':
          commentCount++;
          break;
      }
    };

    // Count root and its children
    countNode(root);

    // Adjust counts to exclude root from final counts
    nodeCount--;
    elementCount--;

    return {
      nodeCount,
      elementCount,
      textCount,
      commentCount
    };
  }
}