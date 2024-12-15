import { DOMXMLAST, DOMXMLASTNode } from "../ast";
import { DOMXMLToken } from "../tokenizer";

export class DOMXMLParser {
  private tokens: DOMXMLToken[];
  private position: number;

  constructor() {
    this.tokens = [];
    this.position = 0;
  }

  public parse(tokens: DOMXMLToken[]): DOMXMLAST {
    this.tokens = tokens;
    this.position = 0;
    
    const root: DOMXMLASTNode = {
      type: 'Element',
      name: 'root',
      children: []
    };
    
    const stack: DOMXMLASTNode[] = [root];
    let currentParent = root;

    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position++];

      switch (token.type) {
        case 'StartTag': {
          const elementNode: DOMXMLASTNode = {
            type: 'Element',
            name: token.name,
            attributes: token.attributes,
            children: []
          };
          
          currentParent.children!.push(elementNode);
          
          if (!token.selfClosing) {
            stack.push(elementNode);
            currentParent = elementNode;
          }
          break;
        }

        case 'EndTag': {
          if (stack.length > 1) {
            if (currentParent.name !== token.name) {
              throw new Error(
                `Mismatched tags: opening "${currentParent.name}" and closing "${token.name}" at line ${token.location.line}, column ${token.location.column}`
              );
            }
            stack.pop();
            currentParent = stack[stack.length - 1];
          }
          break;
        }

        case 'Text': {
          if (token.value && token.value.trim()) {
            const textNode: DOMXMLASTNode = {
              type: 'Text',
              value: token.value.trim()
            };
            currentParent.children!.push(textNode);
          }
          break;
        }

        case 'Comment':
        case 'Doctype': {
          const node: DOMXMLASTNode = {
            type: token.type,
            value: token.value
          };
          currentParent.children!.push(node);
          break;
        }
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

    const traverse = (node: DOMXMLASTNode) => {
      nodeCount++;
      switch (node.type) {
        case 'Element':
          elementCount++;
          node.children?.forEach(traverse);
          break;
        case 'Text':
          textCount++;
          break;
        case 'Comment':
          commentCount++;
          break;
      }
    };

    traverse(root);

    return {
      nodeCount,
      elementCount,
      textCount,
      commentCount
    };
  }
}