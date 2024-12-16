!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).DOMJS={})}(this,(function(e){"use strict";var t,r;e.NodeType=void 0,(t=e.NodeType||(e.NodeType={})).Program="Program",t.Statement="Statement",t.Expression="Expression",t.VariableDeclaration="VariableDeclaration",t.BinaryExpression="BinaryExpression",t.Identifier="Identifier",t.Literal="Literal",t.BlockStatement="BlockStatement",t.IfStatement="IfStatement",t.ArrowFunction="ArrowFunction",t.TemplateLiteral="TemplateLiteral",t.ClassDeclaration="ClassDeclaration",t.MethodDefinition="MethodDefinition",t.ObjectExpression="ObjectExpression",t.Property="Property",t.ImportDeclaration="ImportDeclaration",t.ExportDeclaration="ExportDeclaration",t.InlineConstant="InlineConstant",t.FunctionDeclaration="FunctionDeclaration",t.ReturnStatement="ReturnStatement",t.AsyncFunction="AsyncFunction",e.JSTokenType=void 0,(r=e.JSTokenType||(e.JSTokenType={})).Keyword="Keyword",r.Identifier="Identifier",r.Operator="Operator",r.Delimiter="Delimiter",r.Literal="Literal",r.EndOfStatement="EndOfStatement";const n={NodeType:e.NodeType,JSTokenType:e.JSTokenType};class i{keywords=new Set(["const","let","var","if","else","function","return"]);operators=new Set(["=","+","-","*","/","%","===","!==","<",">","==","!="]);delimiters=new Set(["(",")","{","}","[","]"]);tokenize(t){const r=[];let n=0;const i=(e,t)=>{r.push({type:e,value:t})};for(t=t.trim();n<t.length;){const r=t[n];if(this.delimiters.has(r)){i(e.JSTokenType.Delimiter,r),n++;continue}if(/\s/.test(r)){n++;continue}if(";"===r){i(e.JSTokenType.Delimiter,r),n++;continue}if(/[a-zA-Z_$]/.test(r)){let r="";for(;n<t.length&&/[a-zA-Z0-9_$]/.test(t[n]);)r+=t[n++];this.keywords.has(r)?i(e.JSTokenType.Keyword,r):i(e.JSTokenType.Identifier,r);continue}if(/[0-9]/.test(r)){let r="";for(;n<t.length&&/[0-9.]/.test(t[n]);)r+=t[n++];i(e.JSTokenType.Literal,r);continue}const a=this.matchMultiCharOperator(t.slice(n));if(a)i(e.JSTokenType.Operator,a),n+=a.length;else{if(!this.operators.has(r))throw new Error(`Unexpected character: ${r}`);i(e.JSTokenType.Operator,r),n++}}return i(e.JSTokenType.EndOfStatement,"EOF"),r}matchMultiCharOperator(e){return["===","!==","==","!="].find((t=>e.startsWith(t)))||null}}class a{tokens;current;constructor(e=[]){this.tokens=e,this.current=0}setTokens(e){this.tokens=e,this.current=0}parse(t){t&&this.setTokens(t);const r=[];for(;this.current<this.tokens.length;)try{const e=this.walk();e&&r.push(e)}catch(e){this.current++}return{type:e.NodeType.Program,children:r,body:r}}walk(){const t=this.tokens[this.current];if(!t)return null;switch(t.type){case e.JSTokenType.Keyword:return this.parseKeyword();case e.JSTokenType.Identifier:return this.current++,{type:e.NodeType.Identifier,value:t.value};case e.JSTokenType.Literal:return this.current++,{type:e.NodeType.Literal,value:t.value};case e.JSTokenType.EndOfStatement:return this.current++,null;default:throw new Error(`Unexpected token: '${t.value}'`)}}parseKeyword(){const e=this.tokens[this.current];switch(e.value){case"if":return this.parseIfStatement();case"function":return this.parseFunctionDeclaration();case"const":case"let":case"var":return this.parseVariableDeclaration();default:throw new Error(`Unexpected keyword: ${e.value}`)}}parseIfStatement(){if(this.current++,"("!==this.tokens[this.current]?.value)throw new Error("Expected '(' after 'if'");this.current++;const t=this.walk();if(!t)throw new Error("Invalid condition");if(")"!==this.tokens[this.current]?.value)throw new Error("Expected ')' after condition");this.current++;const r=this.walk();if(!r)throw new Error("Invalid consequence");let n;return"else"===this.tokens[this.current]?.value&&(this.current++,n=this.walk()),{type:e.NodeType.IfStatement,children:[t,r,...n?[n]:[]]}}parseFunctionDeclaration(){this.current++;const t=this.tokens[this.current];if(!t||t.type!==e.JSTokenType.Identifier)throw new Error("Expected function name");if(this.current++,"("!==this.tokens[this.current]?.value)throw new Error("Expected '(' after function name");this.current++;const r=[];for(;this.current<this.tokens.length&&")"!==this.tokens[this.current]?.value;){const t=this.tokens[this.current];if(t.type!==e.JSTokenType.Identifier)throw new Error("Expected parameter identifier");r.push({type:e.NodeType.Identifier,value:t.value}),this.current++,","===this.tokens[this.current]?.value&&this.current++}if(")"!==this.tokens[this.current]?.value)throw new Error("Expected ')' after parameters");this.current++;const n=this.parseBlockStatement();return{type:e.NodeType.FunctionDeclaration,value:t.value,children:[...r,n]}}parseVariableDeclaration(){const t=this.tokens[this.current];this.current++;const r=this.tokens[this.current];if(!r||r.type!==e.JSTokenType.Identifier)throw new Error("Expected variable name");if(this.current++,"="!==this.tokens[this.current]?.value)throw new Error("Expected '=' after variable name");this.current++;const n=this.walk();if(!n)throw new Error("Invalid initializer");return";"===this.tokens[this.current]?.value&&this.current++,{type:e.NodeType.VariableDeclaration,value:t.value,children:[{type:e.NodeType.Identifier,value:r.value},n]}}parseBlockStatement(){if("{"!==this.tokens[this.current]?.value)throw new Error("Expected '{' to start block statement");this.current++;const t=[];for(;"}"!==this.tokens[this.current]?.value;){if(this.current>=this.tokens.length)throw new Error("Expected '}' to close block statement");const e=this.walk();e&&t.push(e)}return this.current++,{type:e.NodeType.BlockStatement,children:t}}}class o{errors;constructor(){this.errors=[]}validate(e){return this.errors=[],this.traverse(e),this.errors}addError(e,t,r){this.errors.push({code:e,message:t,node:r})}traverse(e){if(["Program","VariableDeclaration","InlineConstant","Identifier","Literal","BlockStatement","ArrowFunction","TemplateLiteral","TemplateLiteralExpression","ClassDeclaration","MethodDefinition","PropertyDefinition","FunctionExpression","AsyncFunction","ObjectExpression","Property","SpreadElement","ImportDeclaration","ExportDeclaration"].includes(e.type)){switch(e.type){case"Program":this.validateProgram(e);break;case"VariableDeclaration":this.validateVariableDeclaration(e);break;case"BlockStatement":this.validateBlockStatement(e);break;case"ArrowFunction":this.validateArrowFunction(e);break;case"TemplateLiteral":this.validateTemplateLiteral(e);break;case"ClassDeclaration":this.validateClass(e);break;case"MethodDefinition":this.validateMethodDefinition(e);break;case"AsyncFunction":this.validateAsyncFunction(e);break;case"ObjectExpression":this.validateObjectExpression(e);break;case"Property":this.validateProperty(e);break;case"ImportDeclaration":this.validateImport(e);break;case"ExportDeclaration":this.validateExport(e);break;case"InlineConstant":this.validateInlineConstant(e);break;case"Identifier":this.validateIdentifier(e);break;case"Literal":this.validateLiteral(e)}if(e.children)for(const t of e.children)this.traverse(t)}else this.addError("E001",`Unknown node type: ${e.type}`,e)}validateProgram(e){e.children?.length||this.addError("E002","Program must contain at least one statement.",e)}validateVariableDeclaration(e){e.children?.length?e.value&&["let","const","var"].includes(e.value)||this.addError("E005","Variable declaration must specify kind (let, const, or var).",e):this.addError("E004","Invalid VariableDeclaration: insufficient children.",e)}validateBlockStatement(e){}validateArrowFunction(e){e.children?.length||this.addError("E007","Arrow function must have a body.",e)}validateTemplateLiteral(e){}validateClass(e){e.value||this.addError("E015","Class declaration must have a name.",e)}validateMethodDefinition(e){e.value||this.addError("E016","Class method must have a name.",e)}validateAsyncFunction(e){e.children?.some((e=>"BlockStatement"===e.type))||this.addError("E019","Async function must have a body.",e)}validateObjectExpression(e){const t=new Set;e.children?.forEach((e=>{"Property"===e.type&&e.value&&(t.has(e.value)&&this.addError("E010",`Duplicate key '${e.value}' in object literal.`,e),t.add(e.value))}))}validateProperty(e){e.value||this.addError("E011","Property must have a name.",e)}validateImport(e){e.children?.length||this.addError("E021","Import declaration must specify imported values.",e)}validateExport(e){e.children?.length||e.value||this.addError("E022","Export declaration must have exported values.",e)}validateInlineConstant(e){e.value||this.addError("E024","InlineConstant must have a value.",e)}validateIdentifier(e){e.value&&/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(e.value)||this.addError("E025",`Invalid identifier name: ${e.value}`,e)}validateLiteral(e){e.value||this.addError("E026","Literal must have a value.",e)}}e.JSASTBuilder=class{tokens;position;constructor(e){this.tokens=e,this.position=0}currentToken(){return this.position<this.tokens.length?this.tokens[this.position]:null}consumeToken(){if(this.position>=this.tokens.length)throw new Error("Unexpected end of input");return this.tokens[this.position++]}peekToken(){return this.position+1<this.tokens.length?this.tokens[this.position+1]:null}parseProgram(){const t={type:e.NodeType.Program,children:[]};for(;this.position<this.tokens.length-1;){const e=this.parseStatement();e&&t.children.push(e)}return t}parseStatement(){const t=this.currentToken();if(!t)return null;if(t.type===e.JSTokenType.Keyword&&"const"===t.value)return this.parseVariableDeclaration();throw new Error(`Unexpected token: ${t.value}`)}parseVariableDeclaration(){this.consumeToken();const t=this.consumeToken();if(!t||t.type!==e.JSTokenType.Identifier)throw new Error("Expected identifier after 'const'");const r=this.consumeToken();if(!r||r.type!==e.JSTokenType.Operator||"="!==r.value)throw new Error("Expected '=' after identifier");const n=this.consumeToken();if(!n||n.type!==e.JSTokenType.Literal)throw new Error("Expected literal value after '='");const i=this.consumeToken();if(!i||i.type!==e.JSTokenType.Delimiter||";"!==i.value)throw new Error("Expected ';' after value");return{type:e.NodeType.VariableDeclaration,children:[{type:e.NodeType.Identifier,value:t.value,children:[]},{type:e.NodeType.Literal,value:n.value,children:[]}]}}buildAST(){return this.parseProgram()}},e.JSAstGenerator=class{tokenizer;validator;parser;constructor(){this.tokenizer=new i,this.validator=new o,this.parser=new a}convertToTypedNode(t){const r=e.NodeType[t.type];if(!r)throw new Error(`Invalid node type: ${t.type}`);return{type:r,value:t.value,children:t.children?.map((e=>this.convertToTypedNode(e))),line:t.line,column:t.column}}generateFromSource(e,t={}){try{if(!e)throw new Error("Source code cannot be undefined or empty");const r=this.tokenizer.tokenize(e),n=this.parser.parse(r),i=this.convertToTypedNode(n);return this.processAST(i,t)}catch(e){return{success:!1,errors:[{code:"E000",message:e instanceof Error?e.message:"Unknown error occurred"}],ast:void 0}}}generateFromAST(e,t={}){try{return this.processAST(e,t)}catch(t){return{success:!1,errors:[{code:"E000",message:t instanceof Error?t.message:"Unknown error occurred"}],ast:e}}}processAST(e,t){const r={success:!0,ast:e};if(t.validate){const t=this.validator.validate(e);if(t.length>0)return{success:!1,errors:this.convertValidationErrors(t),ast:e}}try{const n=this.generateCode(e,t);return{...r,code:n}}catch(t){return{success:!1,errors:[{code:"E001",message:t instanceof Error?t.message:"Code generation failed"}],ast:e}}}convertValidationErrors(e){return e.map((e=>({code:e.code,message:e.message,location:{line:e.node.line,column:e.node.column}})))}generateCode(e,t){const r=[];this.traverseAST(e,r);const n=r.join(" ").trim();return this.formatOutput(n,t)}traverseAST(t,r){switch(t.type){case e.NodeType.Program:t.children?.forEach((e=>this.traverseAST(e,r)));break;case e.NodeType.VariableDeclaration:r.push(`${t.value} `),t.children?.forEach((e=>this.traverseAST(e,r))),r.push(";");break;case e.NodeType.Identifier:case e.NodeType.Literal:r.push(t.value||"");break;case e.NodeType.BinaryExpression:t.children&&2===t.children.length&&(this.traverseAST(t.children[0],r),r.push(` ${t.value} `),this.traverseAST(t.children[1],r));break;default:throw new Error(`Unsupported node type: ${t.type}`)}}formatOutput(e,t){return"compact"===t.format?this.formatCompact(e):this.formatPretty(e,t.indent||"  ")}formatCompact(e){return e.replace(/\s+/g," ").replace(/\s*([{}[\],;()])\s*/g,"$1").replace(/\s*=\s*/g,"=").replace(/;\s*/g,";").trim()}formatPretty(e,t){const r=e.split(/({|}|;)/).filter(Boolean);let n=0,i="";for(const e of r){const r=e.trim();r&&("}"===r?(n=Math.max(0,n-1),i+=`${t.repeat(n)}}\n`):"{"===r?(i+=" {\n",n++):i+=";"===r?";\n":`${t.repeat(n)}${r}\n`)}return i.trimEnd()}},e.JSAstMinimizer=class{uniqueNodes=new Map;minimize(e){return this.uniqueNodes.clear(),this.traverse(e)}optimize(e){return this.traverse(e,!0)}traverse(e,t=!1){const r=`${e.type}:${e.value||""}`;if(this.uniqueNodes.has(r))return this.uniqueNodes.get(r);const n={...e};return e.children&&(n.children=e.children.map((e=>this.traverse(e,t)))),t?this.performOptimization(n):(this.uniqueNodes.set(r,n),n)}performOptimization(t){if(t.type===e.NodeType.Program)return{...t,children:t.children?.map((e=>this.simplifyNode(e)))||[]};if(t.type===e.NodeType.VariableDeclaration&&t.children){const[r,n]=t.children;if(n.type===e.NodeType.Literal)return{type:e.NodeType.InlineConstant,value:`${r.value}=${n.value}`,children:[]}}return t}simplifyNode(t){return Object.values(e.NodeType).includes(t.type),t}},e.JSParser=a,e.JSValidator=o,e.Types=n}));
//# sourceMappingURL=index.umd.js.map
