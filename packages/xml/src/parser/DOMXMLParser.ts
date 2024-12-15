import { DOMXMLToken } from "..";
import { DOMXMLAST, DOMXMLASTNode } from "../ast";

export class DOMXMLParser {
  private tokens: DOMXMLToken[];
  private position: number;

  constructor(tokens?: DOMXMLToken[]) {
    this.tokens = tokens || [];
    this.position = 0;
  }

  /**
   * Set new tokens for parsing.
   * @param tokens - Array of DOMXMLToken objects.
   */
  public setTokens(tokens: DOMXMLToken[]): void {
    this.tokens = tokens;
    this.position = 0;
  }

  /**
   * Parses the tokens into a DOMXMLAST.
   * @returns The parsed DOMXMLAST.
   */
  public parse(): DOMXMLAST {
    this.position = 0;
  
    const virtualRoot: DOMXMLASTNode = {
      type: "Element",
      name: "#document",
      children: [],
      attributes: {},
    };
  
    const stack: DOMXMLASTNode[] = [virtualRoot];
    let currentNode = virtualRoot;
  
    while (this.position < this.tokens.length) {
      const token = this.tokens[this.position++];
  
      switch (token.type) {
        case "StartTag": {
          const elementNode: DOMXMLASTNode = {
            type: "Element",
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
        }
  
        case "EndTag": {
          if (stack.length > 1) {
            const openTag = stack.pop()!;
            if (openTag.name !== token.name) {
              throw new Error(
                `Mismatched tags: expected closing tag for "${openTag.name}", but found "${token.name}".`
              );
            }
            currentNode = stack[stack.length - 1];
          } else {
            throw new Error(`Unexpected closing tag: "${token.name}".`);
          }
          break;
        }
  
        case "Text": {
          const textValue = token.value?.trim();
          if (textValue) {
            currentNode.children!.push({
              type: "Text",
              value: textValue,
            });
          }
          break;
        }
  
        case "Comment": {
          currentNode.children!.push({
            type: "Comment",
            value: token.value || "",
          });
          break;
        }
  
        case "Doctype": {
          currentNode.children!.push({
            type: "Doctype",
            value: token.value || "",
          });
          break;
        }
  
        default:
          throw new Error(`Unexpected token type: "${token.type}".`);
      }
    }
  
    if (stack.length > 1) {
      const unclosedTag = stack.pop()!;
      throw new Error(`Unclosed tag: "${unclosedTag.name}".`);
    }
  
    const root = virtualRoot.children![0];
    const metadata = this.computeMetadata(root);
  
    return new DOMXMLAST(root, metadata);
  }

  /**
   * Computes metadata for the AST.
   * @param root - The root node of the AST.
   * @returns Metadata containing node counts.
   */
  private computeMetadata(root: DOMXMLASTNode): DOMXMLAST["metadata"] {
    let nodeCount = 0;
    let elementCount = 0;
    let textCount = 0;
    let commentCount = 0;

    const traverse = (node: DOMXMLASTNode) => {
      nodeCount++;
      switch (node.type) {
        case "Element":
          elementCount++;
          node.children?.forEach(traverse);
          break;
        case "Text":
          textCount++;
          break;
        case "Comment":
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
