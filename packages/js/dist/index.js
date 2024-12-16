var e,t;!function(e){e.Program="Program",e.Statement="Statement",e.Expression="Expression",e.VariableDeclaration="VariableDeclaration",e.BinaryExpression="BinaryExpression",e.Identifier="Identifier",e.Literal="Literal",e.BlockStatement="BlockStatement",e.IfStatement="IfStatement",e.ArrowFunction="ArrowFunction",e.TemplateLiteral="TemplateLiteral",e.ClassDeclaration="ClassDeclaration",e.MethodDefinition="MethodDefinition",e.ObjectExpression="ObjectExpression",e.Property="Property",e.ImportDeclaration="ImportDeclaration",e.ExportDeclaration="ExportDeclaration",e.InlineConstant="InlineConstant",e.FunctionDeclaration="FunctionDeclaration",e.ReturnStatement="ReturnStatement",e.AsyncFunction="AsyncFunction"}(e||(e={})),function(e){e.Keyword="Keyword",e.Identifier="Identifier",e.Operator="Operator",e.Delimiter="Delimiter",e.Literal="Literal",e.EndOfStatement="EndOfStatement"}(t||(t={}));const r={NodeType:e,JSTokenType:t};class n{keywords=new Set(["const","let","var","if","else","function","return"]);operators=new Set(["=","+","-","*","/","%","===","!==","<",">","==","!="]);delimiters=new Set(["(",")","{","}","[","]"]);tokenize(e){const r=[];let n=0;const i=(e,t)=>{r.push({type:e,value:t})};for(e=e.trim();n<e.length;){const r=e[n];if(this.delimiters.has(r)){i(t.Delimiter,r),n++;continue}if(/\s/.test(r)){n++;continue}if(";"===r){i(t.Delimiter,r),n++;continue}if(/[a-zA-Z_$]/.test(r)){let r="";for(;n<e.length&&/[a-zA-Z0-9_$]/.test(e[n]);)r+=e[n++];this.keywords.has(r)?i(t.Keyword,r):i(t.Identifier,r);continue}if(/[0-9]/.test(r)){let r="";for(;n<e.length&&/[0-9.]/.test(e[n]);)r+=e[n++];i(t.Literal,r);continue}const a=this.matchMultiCharOperator(e.slice(n));if(a)i(t.Operator,a),n+=a.length;else{if(!this.operators.has(r))throw new Error(`Unexpected character: ${r}`);i(t.Operator,r),n++}}return i(t.EndOfStatement,"EOF"),r}matchMultiCharOperator(e){return["===","!==","==","!="].find((t=>e.startsWith(t)))||null}}class i{tokens;current;constructor(e=[]){this.tokens=e,this.current=0}setTokens(e){this.tokens=e,this.current=0}parse(t){t&&this.setTokens(t);const r=[];for(;this.current<this.tokens.length;)try{const e=this.walk();e&&r.push(e)}catch(e){this.current++}return{type:e.Program,children:r,body:r}}walk(){const r=this.tokens[this.current];if(!r)return null;switch(r.type){case t.Keyword:return this.parseKeyword();case t.Identifier:return this.current++,{type:e.Identifier,value:r.value};case t.Literal:return this.current++,{type:e.Literal,value:r.value};case t.EndOfStatement:return this.current++,null;default:throw new Error(`Unexpected token: '${r.value}'`)}}parseKeyword(){const e=this.tokens[this.current];switch(e.value){case"if":return this.parseIfStatement();case"function":return this.parseFunctionDeclaration();case"const":case"let":case"var":return this.parseVariableDeclaration();default:throw new Error(`Unexpected keyword: ${e.value}`)}}parseIfStatement(){if(this.current++,"("!==this.tokens[this.current]?.value)throw new Error("Expected '(' after 'if'");this.current++;const t=this.walk();if(!t)throw new Error("Invalid condition");if(")"!==this.tokens[this.current]?.value)throw new Error("Expected ')' after condition");this.current++;const r=this.walk();if(!r)throw new Error("Invalid consequence");let n;return"else"===this.tokens[this.current]?.value&&(this.current++,n=this.walk()),{type:e.IfStatement,children:[t,r,...n?[n]:[]]}}parseFunctionDeclaration(){this.current++;const r=this.tokens[this.current];if(!r||r.type!==t.Identifier)throw new Error("Expected function name");if(this.current++,"("!==this.tokens[this.current]?.value)throw new Error("Expected '(' after function name");this.current++;const n=[];for(;this.current<this.tokens.length&&")"!==this.tokens[this.current]?.value;){const r=this.tokens[this.current];if(r.type!==t.Identifier)throw new Error("Expected parameter identifier");n.push({type:e.Identifier,value:r.value}),this.current++,","===this.tokens[this.current]?.value&&this.current++}if(")"!==this.tokens[this.current]?.value)throw new Error("Expected ')' after parameters");this.current++;const i=this.parseBlockStatement();return{type:e.FunctionDeclaration,value:r.value,children:[...n,i]}}parseVariableDeclaration(){const r=this.tokens[this.current];this.current++;const n=this.tokens[this.current];if(!n||n.type!==t.Identifier)throw new Error("Expected variable name");if(this.current++,"="!==this.tokens[this.current]?.value)throw new Error("Expected '=' after variable name");this.current++;const i=this.walk();if(!i)throw new Error("Invalid initializer");return";"===this.tokens[this.current]?.value&&this.current++,{type:e.VariableDeclaration,value:r.value,children:[{type:e.Identifier,value:n.value},i]}}parseBlockStatement(){if("{"!==this.tokens[this.current]?.value)throw new Error("Expected '{' to start block statement");this.current++;const t=[];for(;"}"!==this.tokens[this.current]?.value;){if(this.current>=this.tokens.length)throw new Error("Expected '}' to close block statement");const e=this.walk();e&&t.push(e)}return this.current++,{type:e.BlockStatement,children:t}}}class a{errors;constructor(){this.errors=[]}validate(e){return this.errors=[],this.traverse(e),this.errors}addError(e,t,r){this.errors.push({code:e,message:t,node:r})}traverse(e){if(["Program","VariableDeclaration","InlineConstant","Identifier","Literal","BlockStatement","ArrowFunction","TemplateLiteral","TemplateLiteralExpression","ClassDeclaration","MethodDefinition","PropertyDefinition","FunctionExpression","AsyncFunction","ObjectExpression","Property","SpreadElement","ImportDeclaration","ExportDeclaration"].includes(e.type)){switch(e.type){case"Program":this.validateProgram(e);break;case"VariableDeclaration":this.validateVariableDeclaration(e);break;case"BlockStatement":this.validateBlockStatement(e);break;case"ArrowFunction":this.validateArrowFunction(e);break;case"TemplateLiteral":this.validateTemplateLiteral(e);break;case"ClassDeclaration":this.validateClass(e);break;case"MethodDefinition":this.validateMethodDefinition(e);break;case"AsyncFunction":this.validateAsyncFunction(e);break;case"ObjectExpression":this.validateObjectExpression(e);break;case"Property":this.validateProperty(e);break;case"ImportDeclaration":this.validateImport(e);break;case"ExportDeclaration":this.validateExport(e);break;case"InlineConstant":this.validateInlineConstant(e);break;case"Identifier":this.validateIdentifier(e);break;case"Literal":this.validateLiteral(e)}if(e.children)for(const t of e.children)this.traverse(t)}else this.addError("E001",`Unknown node type: ${e.type}`,e)}validateProgram(e){e.children?.length||this.addError("E002","Program must contain at least one statement.",e)}validateVariableDeclaration(e){e.children?.length?e.value&&["let","const","var"].includes(e.value)||this.addError("E005","Variable declaration must specify kind (let, const, or var).",e):this.addError("E004","Invalid VariableDeclaration: insufficient children.",e)}validateBlockStatement(e){}validateArrowFunction(e){e.children?.length||this.addError("E007","Arrow function must have a body.",e)}validateTemplateLiteral(e){}validateClass(e){e.value||this.addError("E015","Class declaration must have a name.",e)}validateMethodDefinition(e){e.value||this.addError("E016","Class method must have a name.",e)}validateAsyncFunction(e){e.children?.some((e=>"BlockStatement"===e.type))||this.addError("E019","Async function must have a body.",e)}validateObjectExpression(e){const t=new Set;e.children?.forEach((e=>{"Property"===e.type&&e.value&&(t.has(e.value)&&this.addError("E010",`Duplicate key '${e.value}' in object literal.`,e),t.add(e.value))}))}validateProperty(e){e.value||this.addError("E011","Property must have a name.",e)}validateImport(e){e.children?.length||this.addError("E021","Import declaration must specify imported values.",e)}validateExport(e){e.children?.length||e.value||this.addError("E022","Export declaration must have exported values.",e)}validateInlineConstant(e){e.value||this.addError("E024","InlineConstant must have a value.",e)}validateIdentifier(e){e.value&&/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(e.value)||this.addError("E025",`Invalid identifier name: ${e.value}`,e)}validateLiteral(e){e.value||this.addError("E026","Literal must have a value.",e)}}class s{tokenizer;validator;parser;constructor(){this.tokenizer=new n,this.validator=new a,this.parser=new i}convertToTypedNode(t){const r=e[t.type];if(!r)throw new Error(`Invalid node type: ${t.type}`);return{type:r,value:t.value,children:t.children?.map((e=>this.convertToTypedNode(e))),line:t.line,column:t.column}}generateFromSource(e,t={}){try{if(!e)throw new Error("Source code cannot be undefined or empty");const r=this.tokenizer.tokenize(e),n=this.parser.parse(r),i=this.convertToTypedNode(n);return this.processAST(i,t)}catch(e){return{success:!1,errors:[{code:"E000",message:e instanceof Error?e.message:"Unknown error occurred"}],ast:void 0}}}generateFromAST(e,t={}){try{return this.processAST(e,t)}catch(t){return{success:!1,errors:[{code:"E000",message:t instanceof Error?t.message:"Unknown error occurred"}],ast:e}}}processAST(e,t){const r={success:!0,ast:e};if(t.validate){const t=this.validator.validate(e);if(t.length>0)return{success:!1,errors:this.convertValidationErrors(t),ast:e}}try{const n=this.generateCode(e,t);return{...r,code:n}}catch(t){return{success:!1,errors:[{code:"E001",message:t instanceof Error?t.message:"Code generation failed"}],ast:e}}}convertValidationErrors(e){return e.map((e=>({code:e.code,message:e.message,location:{line:e.node.line,column:e.node.column}})))}generateCode(e,t){const r=[];this.traverseAST(e,r);const n=r.join(" ").trim();return this.formatOutput(n,t)}traverseAST(t,r){switch(t.type){case e.Program:t.children?.forEach((e=>this.traverseAST(e,r)));break;case e.VariableDeclaration:r.push(`${t.value} `),t.children?.forEach((e=>this.traverseAST(e,r))),r.push(";");break;case e.Identifier:case e.Literal:r.push(t.value||"");break;case e.BinaryExpression:t.children&&2===t.children.length&&(this.traverseAST(t.children[0],r),r.push(` ${t.value} `),this.traverseAST(t.children[1],r));break;default:throw new Error(`Unsupported node type: ${t.type}`)}}formatOutput(e,t){return"compact"===t.format?this.formatCompact(e):this.formatPretty(e,t.indent||"  ")}formatCompact(e){return e.replace(/\s+/g," ").replace(/\s*([{}[\],;()])\s*/g,"$1").replace(/\s*=\s*/g,"=").replace(/;\s*/g,";").trim()}formatPretty(e,t){const r=e.split(/({|}|;)/).filter(Boolean);let n=0,i="";for(const e of r){const r=e.trim();r&&("}"===r?(n=Math.max(0,n-1),i+=`${t.repeat(n)}}\n`):"{"===r?(i+=" {\n",n++):i+=";"===r?";\n":`${t.repeat(n)}${r}\n`)}return i.trimEnd()}}class o{tokens;position;constructor(e){this.tokens=e,this.position=0}currentToken(){return this.position<this.tokens.length?this.tokens[this.position]:null}consumeToken(){if(this.position>=this.tokens.length)throw new Error("Unexpected end of input");return this.tokens[this.position++]}peekToken(){return this.position+1<this.tokens.length?this.tokens[this.position+1]:null}parseProgram(){const t={type:e.Program,children:[]};for(;this.position<this.tokens.length-1;){const e=this.parseStatement();e&&t.children.push(e)}return t}parseStatement(){const e=this.currentToken();if(!e)return null;if(e.type===t.Keyword&&"const"===e.value)return this.parseVariableDeclaration();throw new Error(`Unexpected token: ${e.value}`)}parseVariableDeclaration(){this.consumeToken();const r=this.consumeToken();if(!r||r.type!==t.Identifier)throw new Error("Expected identifier after 'const'");const n=this.consumeToken();if(!n||n.type!==t.Operator||"="!==n.value)throw new Error("Expected '=' after identifier");const i=this.consumeToken();if(!i||i.type!==t.Literal)throw new Error("Expected literal value after '='");const a=this.consumeToken();if(!a||a.type!==t.Delimiter||";"!==a.value)throw new Error("Expected ';' after value");return{type:e.VariableDeclaration,children:[{type:e.Identifier,value:r.value,children:[]},{type:e.Literal,value:i.value,children:[]}]}}buildAST(){return this.parseProgram()}}class c{uniqueNodes=new Map;minimize(e){return this.uniqueNodes.clear(),this.traverse(e)}optimize(e){return this.traverse(e,!0)}traverse(e,t=!1){const r=`${e.type}:${e.value||""}`;if(this.uniqueNodes.has(r))return this.uniqueNodes.get(r);const n={...e};return e.children&&(n.children=e.children.map((e=>this.traverse(e,t)))),t?this.performOptimization(n):(this.uniqueNodes.set(r,n),n)}performOptimization(t){if(t.type===e.Program)return{...t,children:t.children?.map((e=>this.simplifyNode(e)))||[]};if(t.type===e.VariableDeclaration&&t.children){const[r,n]=t.children;if(n.type===e.Literal)return{type:e.InlineConstant,value:`${r.value}=${n.value}`,children:[]}}return t}simplifyNode(t){return Object.values(e).includes(t.type),t}}export{o as JSASTBuilder,s as JSAstGenerator,c as JSAstMinimizer,i as JSParser,t as JSTokenType,a as JSValidator,e as NodeType,r as Types};
//# sourceMappingURL=index.js.map
