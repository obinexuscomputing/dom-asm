import { DOMXMLToken } from "..";
import { DOMXMLAST, DOMXMLASTNode } from "../ast";

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

    const virtualRoot: DOMXMLASTNode = {
      type: 'Element',
      name: '#document',
      children: [],
      attributes: {},
    };

    const stack: DOMXMLASTNode[] = [virtualRoot];
    let currentNode = virtualRoot;

    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position++];

      switch (token.type) {
        case 'StartTag':
          const elementNode: DOMXMLASTNode = {
            type: 'Element',
            name: token.name!,
            attributes: token.attributes || {},
            children: [],
          };
          currentNode.children!.push(elementNode);
          if (!token.selfClosing) {
            stack.push(elementNode);
            currentNode = elementNode;
          }
          break;

        case 'EndTag':
          if (stack.length > 1) {
            const openTag = stack.pop()!;
            if (openTag.name !== token.name) {
              throw new Error(`Mismatched tags: "${openTag.name}" and "${token.name}".`);
            }
            currentNode = stack[stack.length - 1];
          }
          break;

        case 'Text':
          currentNode.children!.push({
            type: 'Text',
            value: token.value?.trim() || '',
          });
          break;

        case 'Comment':
          currentNode.children!.push({
            type: 'Comment',
            value: token.value || '',
          });
          break;

        case 'Doctype':
          currentNode.children!.push({
            type: 'Doctype',
            value: token.value || '',
          });
          break;
      }
    }

    if (stack.length > 1) {
      const unclosedTag = stack[stack.length - 1];
      throw new Error(`Unclosed tag: "${unclosedTag.name}".`);
    }

    return {
      root: virtualRoot.children![0],
      metadata: this.computeMetadata(virtualRoot.children![0]),
    };
  }

  private computeMetadata(root: DOMXMLASTNode): DOMXMLAST['metadata'] {
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
      commentCount,
    };
  }
}
