"use strict";var e,t;exports.NodeType=void 0,(e=exports.NodeType||(exports.NodeType={})).Program="Program",e.Statement="Statement",e.Expression="Expression",e.VariableDeclaration="VariableDeclaration",e.BinaryExpression="BinaryExpression",e.Identifier="Identifier",e.Literal="Literal",e.BlockStatement="BlockStatement",e.IfStatement="IfStatement",e.ArrowFunction="ArrowFunction",e.TemplateLiteral="TemplateLiteral",e.ClassDeclaration="ClassDeclaration",e.MethodDefinition="MethodDefinition",e.ObjectExpression="ObjectExpression",e.Property="Property",e.ImportDeclaration="ImportDeclaration",e.ExportDeclaration="ExportDeclaration",e.InlineConstant="InlineConstant",e.FunctionDeclaration="FunctionDeclaration",e.ReturnStatement="ReturnStatement",e.AsyncFunction="AsyncFunction",exports.JSTokenType=void 0,(t=exports.JSTokenType||(exports.JSTokenType={})).Keyword="Keyword",t.Identifier="Identifier",t.Operator="Operator",t.Delimiter="Delimiter",t.Literal="Literal",t.EndOfStatement="EndOfStatement";const r={NodeType:exports.NodeType,JSTokenType:exports.JSTokenType};class a{keywords=new Set(["const","let","var","if","else","function","return"]);operators=new Set(["=","+","-","*","/","%","===","!==","<",">","==","!="]);delimiters=new Set(["(",")","{","}","[","]"]);tokenize(e){const t=[];let r=0;const a=(e,r)=>{t.push({type:e,value:r})};for(e=e.trim();r<e.length;){const t=e[r];if(this.delimiters.has(t)){a(exports.JSTokenType.Delimiter,t),r++;continue}if(/\s/.test(t)){r++;continue}if(";"===t){a(exports.JSTokenType.Delimiter,t),r++;continue}if(/[a-zA-Z_$]/.test(t)){let t="";for(;r<e.length&&/[a-zA-Z0-9_$]/.test(e[r]);)t+=e[r++];this.keywords.has(t)?a(exports.JSTokenType.Keyword,t):a(exports.JSTokenType.Identifier,t);continue}if(/[0-9]/.test(t)){let t="";for(;r<e.length&&/[0-9.]/.test(e[r]);)t+=e[r++];a(exports.JSTokenType.Literal,t);continue}const n=this.matchMultiCharOperator(e.slice(r));if(n)a(exports.JSTokenType.Operator,n),r+=n.length;else{if(!this.operators.has(t))throw new Error(`Unexpected character: ${t}`);a(exports.JSTokenType.Operator,t),r++}}return a(exports.JSTokenType.EndOfStatement,"EOF"),t}matchMultiCharOperator(e){return["===","!==","==","!="].find((t=>e.startsWith(t)))||null}}class n{tokens=[];current=0;parse(e){this.tokens=e,this.current=0;const t={type:exports.NodeType.Program,children:[]};for(;this.current<this.tokens.length;){const e=this.walk();e&&t.children?.push(e)}return t}walk(){const e=this.tokens[this.current];if(!e)throw new Error("Unexpected end of input");switch(e.type){case exports.JSTokenType.Keyword:return this.parseKeyword();case exports.JSTokenType.Identifier:return this.current++,{type:exports.NodeType.Identifier,value:e.value};case exports.JSTokenType.Literal:return this.current++,{type:exports.NodeType.Literal,value:e.value};case exports.JSTokenType.Delimiter:if("{"===e.value)return this.parseBlockStatement();throw new Error(`Unexpected delimiter: ${e.value}`);default:throw new Error(`Unexpected token type: ${e.type}`)}}parseKeyword(){const e=this.tokens[this.current];switch(e.value){case"const":case"let":case"var":return this.parseVariableDeclaration();case"if":return this.parseIfStatement();case"function":return this.parseFunctionDeclaration();default:throw new Error(`Unexpected keyword: ${e.value}`)}}parseVariableDeclaration(){const e=this.tokens[this.current];if(!["const","let","var"].includes(e.value))throw new Error(`Unexpected keyword: ${e.value}`);this.current++;const t=this.tokens[this.current];if(!t||t.type!==exports.JSTokenType.Identifier)throw new Error("Expected identifier after declaration keyword");this.current++;const r=this.tokens[this.current];if(!r||"="!==r.value)throw new Error("Expected '=' after identifier");this.current++;const a=this.tokens[this.current];if(!a||a.type!==exports.JSTokenType.Literal)throw new Error("Expected literal value after '='");if(this.current++,";"!==this.tokens[this.current]?.value)throw new Error("Expected ';' after declaration");return this.current++,{type:exports.NodeType.VariableDeclaration,value:e.value,children:[{type:exports.NodeType.Identifier,value:t.value},{type:exports.NodeType.Literal,value:a.value}]}}parseBlockStatement(){this.current++;const e={type:exports.NodeType.BlockStatement,children:[]};for(;this.current<this.tokens.length&&"}"!==this.tokens[this.current].value;){const t=this.walk();t&&e.children?.push(t)}if("}"!==this.tokens[this.current]?.value)throw new Error("Expected '}' to close block statement");return this.current++,e}parseIfStatement(){if(this.current++,"("!==this.tokens[this.current]?.value)throw new Error("Expected '(' after 'if'");this.current++;const e=this.walk();if(")"!==this.tokens[this.current]?.value)throw new Error("Expected ')' after condition");this.current++;const t=this.walk();let r;return"else"===this.tokens[this.current]?.value&&(this.current++,r=this.walk()??void 0),{type:exports.NodeType.IfStatement,children:[e,t,r].filter(Boolean)}}parseFunctionDeclaration(){this.current++;const e=this.tokens[this.current];if(!e||e.type!==exports.JSTokenType.Identifier)throw new Error("Expected function name");if(this.current++,"("!==this.tokens[this.current]?.value)throw new Error("Expected '(' after function name");this.current++;const t=[];for(;this.current<this.tokens.length&&")"!==this.tokens[this.current]?.value;){const e=this.tokens[this.current];if(e.type!==exports.JSTokenType.Identifier)throw new Error("Expected parameter identifier");t.push({type:exports.NodeType.Identifier,value:e.value}),this.current++,","===this.tokens[this.current]?.value&&this.current++}if(")"!==this.tokens[this.current]?.value)throw new Error("Expected ')' after parameters");this.current++;const r=this.parseBlockStatement();return{type:exports.NodeType.FunctionDeclaration,value:e.value,children:[...t,r]}}}class o{errors;constructor(){this.errors=[]}validate(e){return this.errors=[],this.traverse(e),this.errors}addError(e,t,r){this.errors.push({code:e,message:t,node:r})}traverse(e){if(["Program","VariableDeclaration","InlineConstant","Identifier","Literal","BlockStatement","ArrowFunction","TemplateLiteral","TemplateLiteralExpression","ClassDeclaration","MethodDefinition","PropertyDefinition","FunctionExpression","AsyncFunction","ObjectExpression","Property","SpreadElement","ImportDeclaration","ExportDeclaration"].includes(e.type)){switch(e.type){case"Program":this.validateProgram(e);break;case"VariableDeclaration":this.validateVariableDeclaration(e);break;case"BlockStatement":this.validateBlockStatement(e);break;case"ArrowFunction":this.validateArrowFunction(e);break;case"TemplateLiteral":this.validateTemplateLiteral(e);break;case"ClassDeclaration":this.validateClass(e);break;case"MethodDefinition":this.validateMethodDefinition(e);break;case"AsyncFunction":this.validateAsyncFunction(e);break;case"ObjectExpression":this.validateObjectExpression(e);break;case"Property":this.validateProperty(e);break;case"ImportDeclaration":this.validateImport(e);break;case"ExportDeclaration":this.validateExport(e);break;case"InlineConstant":this.validateInlineConstant(e);break;case"Identifier":this.validateIdentifier(e);break;case"Literal":this.validateLiteral(e)}if(e.children)for(const t of e.children)this.traverse(t)}else this.addError("E001",`Unknown node type: ${e.type}`,e)}validateProgram(e){e.children?.length||this.addError("E002","Program must contain at least one statement.",e)}validateVariableDeclaration(e){e.children?.length?e.value&&["let","const","var"].includes(e.value)||this.addError("E005","Variable declaration must specify kind (let, const, or var).",e):this.addError("E004","Invalid VariableDeclaration: insufficient children.",e)}validateBlockStatement(e){}validateArrowFunction(e){e.children?.length||this.addError("E007","Arrow function must have a body.",e)}validateTemplateLiteral(e){}validateClass(e){e.value||this.addError("E015","Class declaration must have a name.",e)}validateMethodDefinition(e){e.value||this.addError("E016","Class method must have a name.",e)}validateAsyncFunction(e){e.children?.some((e=>"BlockStatement"===e.type))||this.addError("E019","Async function must have a body.",e)}validateObjectExpression(e){const t=new Set;e.children?.forEach((e=>{"Property"===e.type&&e.value&&(t.has(e.value)&&this.addError("E010",`Duplicate key '${e.value}' in object literal.`,e),t.add(e.value))}))}validateProperty(e){e.value||this.addError("E011","Property must have a name.",e)}validateImport(e){e.children?.length||this.addError("E021","Import declaration must specify imported values.",e)}validateExport(e){e.children?.length||e.value||this.addError("E022","Export declaration must have exported values.",e)}validateInlineConstant(e){e.value||this.addError("E024","InlineConstant must have a value.",e)}validateIdentifier(e){e.value&&/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(e.value)||this.addError("E025",`Invalid identifier name: ${e.value}`,e)}validateLiteral(e){e.value||this.addError("E026","Literal must have a value.",e)}}exports.JSASTGenerator=class{tokenizer;validator;parser;constructor(){this.tokenizer=new a,this.validator=new o,this.parser=new n}convertToTypedNode(e){const t=exports.NodeType[e.type];if(!t)throw new Error(`Invalid node type: ${e.type}`);return{type:t,value:e.value,children:e.children?.map((e=>this.convertToTypedNode(e))),line:e.line,column:e.column}}generateFromSource(e,t={}){try{if(!e)throw new Error("Source code cannot be undefined or empty");const r=this.tokenizer.tokenize(e),a=this.parser.parse(r),n=this.convertToTypedNode(a);return this.processAST(n,t)}catch(e){return{success:!1,errors:[{code:"E000",message:e instanceof Error?e.message:"Unknown error occurred"}],ast:void 0}}}generateFromAST(e,t={}){try{return this.processAST(e,t)}catch(t){return{success:!1,errors:[{code:"E000",message:t instanceof Error?t.message:"Unknown error occurred"}],ast:e}}}processAST(e,t){const r={success:!0,ast:e};if(t.validate){const t=this.validator.validate(e);if(t.length>0)return{success:!1,errors:this.convertValidationErrors(t),ast:e}}try{const a=this.generateCode(e,t);return{...r,code:a}}catch(t){return{success:!1,errors:[{code:"E001",message:t instanceof Error?t.message:"Code generation failed"}],ast:e}}}convertValidationErrors(e){return e.map((e=>({code:e.code,message:e.message,location:{line:e.node.line,column:e.node.column}})))}generateCode(e,t){const r=[];this.traverseAST(e,r);const a=r.join(" ").trim();return this.formatOutput(a,t)}traverseAST(e,t){switch(e.type){case exports.NodeType.Program:e.children?.forEach((e=>this.traverseAST(e,t)));break;case exports.NodeType.VariableDeclaration:t.push(`${e.value} `),e.children?.forEach((e=>this.traverseAST(e,t))),t.push(";");break;case exports.NodeType.Identifier:case exports.NodeType.Literal:t.push(e.value||"");break;case exports.NodeType.BinaryExpression:e.children&&2===e.children.length&&(this.traverseAST(e.children[0],t),t.push(` ${e.value} `),this.traverseAST(e.children[1],t));break;default:throw new Error(`Unsupported node type: ${e.type}`)}}formatOutput(e,t){return"compact"===t.format?this.formatCompact(e):this.formatPretty(e,t.indent||"  ")}formatCompact(e){return e.replace(/\s+/g," ").replace(/\s*([{}[\],;()])\s*/g,"$1").replace(/\s*=\s*/g,"=").replace(/;\s*/g,";").trim()}formatPretty(e,t){const r=e.split(/({|}|;)/).filter(Boolean);let a=0,n="";for(const e of r){const r=e.trim();r&&("}"===r?(a=Math.max(0,a-1),n+=`${t.repeat(a)}}\n`):"{"===r?(n+=" {\n",a++):n+=";"===r?";\n":`${t.repeat(a)}${r}\n`)}return n.trimEnd()}},exports.JSParser=n,exports.JSValidator=o,exports.Types=r;
//# sourceMappingURL=index.cjs.map
