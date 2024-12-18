// Define the NodeType enum
export enum NodeType {
    Program = 'Program',
    VariableDeclaration = 'VariableDeclaration',
    InlineConstant = 'InlineConstant',
    Identifier = 'Identifier',
    Literal = 'Literal',
    BlockStatement = 'BlockStatement',
    ArrowFunction = 'ArrowFunction',
    TemplateLiteral = 'TemplateLiteral',
    TemplateLiteralExpression = 'TemplateLiteralExpression',
    ClassDeclaration = 'ClassDeclaration',
    MethodDefinition = 'MethodDefinition',
    PropertyDefinition = 'PropertyDefinition',
    FunctionExpression = 'FunctionExpression',
    AsyncFunction = 'AsyncFunction',
    ObjectExpression = 'ObjectExpression',
    Property = 'Property',
    SpreadElement = 'SpreadElement',
    ImportDeclaration = 'ImportDeclaration',
    ExportDeclaration = 'ExportDeclaration',
    ReturnStatement = 'ReturnStatement',
    Statement = 'Statement',
    Expression = 'Expression',
    BinaryExpression = 'BinaryExpression',
    IfStatement = 'IfStatement',
    FunctionDeclaration = 'FunctionDeclaration'
}

export interface JavaScriptAstNode {
    type: NodeType;
    value?: string;
    children?: JavaScriptAstNode[];
    minimize(): JavaScriptAstNode;
}



// Define the JavaScriptAstNode class
export class JavaScriptAstNode {
    public type: NodeType;
    public value?: string;
    public children?: JavaScriptAstNode[];

    constructor(type: NodeType, value?: string, children?: JavaScriptAstNode[]) {
        this.type = type;
        this.value = value;
        this.children = children;
    }

    public minimize(): JavaScriptAstNode {
        if (this.children) {
            this.children = this.children.map(child => child.minimize()).filter(child => child.type !== NodeType.Whitespace && child.type !== NodeType.Comment);
        }
        return this;
    }

    public optimize(): JavaScriptAstNode {
        return this.traverse(this, true);
    }

    public traverse(node: JavaScriptAstNode, optimize: boolean = false): JavaScriptAstNode {
        const key = `${node.type}:${node.value || ""}`;
        const uniqueNodes = new Map<string, JavaScriptAstNode>();

        if (uniqueNodes.has(key)) {
            return uniqueNodes.get(key)!;
        }

        const processedNode: JavaScriptAstNode = new JavaScriptAstNode(node.type, node.value, node.children);

        if (node.children) {
            processedNode.children = node.children.map(child =>
                this.traverse(child, optimize)
            );
        }

        if (optimize) {
            return this.performOptimization(processedNode);
        }

        uniqueNodes.set(key, processedNode);
        return processedNode;
    }


    
    public performOptimization(node: JavaScriptAstNode): JavaScriptAstNode {
        if (node.type === NodeType.Program) {
            return new JavaScriptAstNode(
                node.type,
                node.value,
                node.children?.map(child => this.simplifyNode(child)) || []
            );
        }

        if (node.type === NodeType.VariableDeclaration && node.children) {
            const [identifier, value] = node.children;
            if (value.type === NodeType.Literal) {
                return {
                    ...node,
                    minimize: node.minimize,
                    optimize: node.optimize,
                    traverse: node.traverse,
                    performOptimization: node.performOptimization,
                    simplifyNode: node.simplifyNode
                };
            }
        }

        return node;
    }

    public simplifyNode(node: JavaScriptAstNode): JavaScriptAstNode {
        if (!Object.values(NodeType).includes(node.type)) {
            return node;
        }
        return node;
    }
    toString(): string {
        return this.type;
    }
}
