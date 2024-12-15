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
          // Don't trim here - preserve the original text
          if (token.value) {
            const textNode: DOMXMLASTNode = {
              type: 'Text',
              value: token.value
            };
            currentParent.children!.push(textNode);
          }
          break;
        }

        case 'Comment':
        case 'Doctype': {
          currentParent.children!.push({
            type: token.type,
            value: token.value
          });
          break;
        }
      }
    }

    if (stack.length > 1) {
      const unclosedTag = stack[stack.length - 1];
      throw new Error(`Unclosed tag: ${unclosedTag.name}`);
    }

    // After building the tree, clean up text nodes
    this.cleanupTextNodes(root);

    return {
      root,
      metadata: this.computeMetadata(root)
    };
  }

  private cleanupTextNodes(node: DOMXMLASTNode): void {
    if (node.children) {
      // Clean up each child's text nodes
      node.children.forEach(child => {
        if (child.type === 'Element') {
          this.cleanupTextNodes(child);
        }
      });

      // Filter out empty text nodes and trim non-empty ones
      node.children = node.children
        .map(child => {
          if (child.type === 'Text' && child.value) {
            return {
              ...child,
              value: child.value.trim()
            };
          }
          return child;
        })
        .filter(child => !(child.type === 'Text' && (!child.value || child.value === '')));
    }
  }

  private computeMetadata(root: DOMXMLASTNode) {
    let nodeCount = 0;
    let elementCount = 0;
    let textCount = 0;
    let commentCount = 0;

    const traverse = (node: DOMXMLASTNode, isRoot: boolean = false) => {
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