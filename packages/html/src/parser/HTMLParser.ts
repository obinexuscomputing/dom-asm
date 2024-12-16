import { HTMLAST, HTMLASTNode } from "../ast/HTMLAST";
import { HTMLToken, HTMLTokenizer } from "../tokenizer/HTMLTokenizer";

export class HTMLParserError extends Error {
  constructor(
    message: string,
    public token: HTMLToken,
    public position: number
  ) {
    super(message);
    this.name = "HTMLParserError";
  }
}

export interface HTMLParserOptions {
  throwOnError?: boolean;
  errorHandler?: (error: HTMLParserError) => void;
}

export class HTMLParser {
  private tokenizer: HTMLTokenizer;
  private options: HTMLParserOptions;

  constructor(options: HTMLParserOptions = { throwOnError: true }) {
    this.tokenizer = new HTMLTokenizer("");
    this.options = options;
  }

  public parse(input: string): HTMLAST {
    this.tokenizer = new HTMLTokenizer(input);
    const tokens = this.tokenizer.tokenize();
    
    try {
      const root = this.buildAST(tokens);
      return {
        root,
        metadata: this.computeMetadata(root)
      };
    } catch (error) {
      if (this.options.throwOnError) {
        throw error;
      }

      if (this.options.errorHandler) {
        this.options.errorHandler(error as HTMLParserError);
      }

      // Return a valid but empty AST for recovery
      return {
        root: {
          type: "Element",
          name: "root",
          children: [],
          attributes: {}
        },
        metadata: {
          nodeCount: 1,
          elementCount: 1,
          textCount: 0,
          commentCount: 0
        }
      };
    }
  }

  private buildAST(tokens: HTMLToken[]): HTMLASTNode {
    const root: HTMLASTNode = {
      type: "Element",
      name: "root",
      children: [],
      attributes: {}
    };

    const stack: HTMLASTNode[] = [root];
    let currentParent = root;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      try {
        switch (token.type) {
          case "StartTag": {
            const element: HTMLASTNode = {
              type: "Element",
              name: token.name,
              attributes: token.attributes || {},
              children: []
            };

            currentParent.children.push(element);
            
            if (!token.selfClosing) {
              stack.push(element);
              currentParent = element;
            }
            break;
          }

          case "EndTag": {
            if (stack.length <= 1) {
              this.handleError(new HTMLParserError(
                `Unexpected closing tag "${token.name}"`,
                token,
                i
              ));
              continue;
            }

            if (currentParent.name !== token.name) {
              this.handleError(new HTMLParserError(
                `Mismatched tags: expected "${currentParent.name}", got "${token.name}"`,
                token,
                i
              ));
              continue;
            }

            stack.pop();
            currentParent = stack[stack.length - 1];
            break;
          }

          case "Text": {
            if (token.value?.trim()) {
              currentParent.children.push({
                type: "Text",
                value: token.value,
                children: []
              });
            }
            break;
          }

          case "Comment": {
            currentParent.children.push({
              type: "Comment",
              value: token.value || "",
              children: []
            });
            break;
          }
        }
      } catch (error) {
        this.handleError(error as HTMLParserError);
      }
    }

    // Handle unclosed tags
    if (stack.length > 1) {
      const lastToken = tokens[tokens.length - 1];
      this.handleError(new HTMLParserError(
        "Unclosed tags detected",
        lastToken,
        tokens.length - 1
      ));
    }

    return root;
  }

  private handleError(error: HTMLParserError): void {
    if (this.options.errorHandler) {
      this.options.errorHandler(error);
    }
    if (this.options.throwOnError) {
      throw error;
    }
  }

  private computeMetadata(root: HTMLASTNode): HTMLAST["metadata"] {
    let nodeCount = 0;
    let elementCount = 0;
    let textCount = 0;
    let commentCount = 0;

    const traverse = (node: HTMLASTNode) => {
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
      commentCount
    };
  }

  public setErrorHandler(handler: (error: HTMLParserError) => void): void {
    this.options.errorHandler = handler;
  }
}