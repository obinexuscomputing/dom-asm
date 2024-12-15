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
         
          if (!token.selfClosing) {
            currentParent.children!.push(elementNode);
            stack.push(elementNode);
            currentParent = elementNode;
          } else {
            currentParent.children!.push(elementNode);
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

    const traverse = (node: DOMXMLASTNode, isRoot: boolean = false) => {
      if (!isRoot) {
        nodeCount++;
        if (node.type === 'Element') {
          elementCount++;
        } else if (node.type === 'Text') {
          textCount++;
        } else if (node.type === 'Comment') {
          commentCount++;
        }
      }
      
      if (node.children) {
        node.children.forEach(child => traverse(child));
      }
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