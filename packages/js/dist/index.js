var e;!function(e){e.Keyword="Keyword",e.Identifier="Identifier",e.Operator="Operator",e.Delimiter="Delimiter",e.Literal="Literal",e.TemplateLiteral="TemplateLiteral",e.Comment="Comment",e.EndOfStatement="EndOfStatement"}(e||(e={}));class t{keywords=new Set(["const","let","var","if","else","function","return"]);operators=new Set(["=","+","-","*","/","%","===","!==","<",">","==","!="]);delimiters=new Set(["(",")","{","}","[","]"]);tokenize(t){const r=[];let i=0;const n=(e,t)=>{r.push({type:e,value:t})};for(t=t.trim();i<t.length;){const r=t[i];if(this.delimiters.has(r)){n(e.Delimiter,r),i++;continue}if(/\s/.test(r)){i++;continue}if(";"===r){n(e.Delimiter,r),i++;continue}if(/[a-zA-Z_$]/.test(r)){let r="";for(;i<t.length&&/[a-zA-Z0-9_$]/.test(t[i]);)r+=t[i++];this.keywords.has(r)?n(e.Keyword,r):n(e.Identifier,r);continue}if(/[0-9]/.test(r)){let r="";for(;i<t.length&&/[0-9.]/.test(t[i]);)r+=t[i++];n(e.Literal,r);continue}const a=t.slice(i),s=this.matchMultiCharOperator(a);if(s)n(e.Operator,s),i+=s.length;else{if(!this.operators.has(r))throw new Error(`Unexpected character: ${r}`);n(e.Operator,r),i++}}return n(e.EndOfStatement,"EOF"),r}matchMultiCharOperator(e){return["===","!==","==","!="].find((t=>e.startsWith(t)))||null}}class r{tokens;position;constructor(e){this.tokens=e,this.position=0}currentToken(){return this.position<this.tokens.length?this.tokens[this.position]:null}consumeToken(){if(this.position>=this.tokens.length)throw new Error("Unexpected end of input");return this.tokens[this.position++]}peekToken(){return this.position+1<this.tokens.length?this.tokens[this.position+1]:null}parseProgram(){const e={type:"Program",children:[]};for(;this.position<this.tokens.length-1;){const t=this.parseStatement();t&&e.children.push(t)}return e}parseStatement(){const t=this.currentToken();if(!t)return null;if(t.type===e.Keyword&&"const"===t.value)return this.parseVariableDeclaration();throw new Error(`Unexpected token: ${t.value}`)}parseVariableDeclaration(){this.consumeToken();const t=this.consumeToken();if(!t||t.type!==e.Identifier)throw new Error("Expected identifier after 'const'");const r=this.consumeToken();if(!r||r.type!==e.Operator||"="!==r.value)throw new Error("Expected '=' after identifier");const i=this.consumeToken();if(!i||i.type!==e.Literal)throw new Error("Expected literal value after '='");const n=this.consumeToken();if(!n||n.type!==e.Delimiter||";"!==n.value)throw new Error("Expected ';' after value");return{type:"VariableDeclaration",children:[{type:"Identifier",value:t.value,children:[]},{type:"Literal",value:i.value,children:[]}]}}buildAST(){return this.parseProgram()}}class i{uniqueNodes=new Map;minimize(e){return this.uniqueNodes.clear(),this.traverse(e)}optimize(e){return this.traverse(e,!0)}traverse(e,t=!1){const r=`${e.type}:${e.value||""}`;if(this.uniqueNodes.has(r))return this.uniqueNodes.get(r);let i={...e};return e.children&&(i.children=e.children.map((e=>this.traverse(e,t)))),t&&(i=this.performOptimization(i)),this.uniqueNodes.set(r,i),i}performOptimization(e){if("Program"===e.type)return{...e,children:e.children?.map(this.simplifyNode)||[]};if("VariableDeclaration"===e.type&&e.children){const[t,r]=e.children;if("Literal"===r.type)return{type:"InlineConstant",value:`${t.value}=${r.value}`,children:[]}}return e}simplifyNode(e){return e.type,e}}class n{generate(e){if("Program"===e.type)return e.children?.map((e=>this.generate(e))).join("\n")||"";if("VariableDeclaration"===e.type){const t=e.children?.find((e=>"Identifier"===e.type)),r=e.children?.find((e=>"Literal"===e.type));return`const ${t?.value} = ${r?.value};`}return"InlineConstant"===e.type?`const ${e.value};`:e.value||""}}class a{errors;constructor(){this.errors=[]}validate(e){return this.errors=[],this.traverse(e),this.errors}traverse(e){switch(e.type){case"Program":this.validateProgram(e);break;case"VariableDeclaration":this.validateVariableDeclaration(e);break;case"InlineConstant":this.validateInlineConstant(e);break;case"Identifier":this.validateIdentifier(e);break;case"Literal":this.validateLiteral(e);break;default:this.errors.push(`Unknown node type: ${e.type}`)}if(e.children)for(const t of e.children)this.traverse(t)}validateProgram(e){e.children&&0!==e.children.length||this.errors.push("Program must contain at least one statement.")}validateVariableDeclaration(e){if(!e.children||e.children.length<2)return void this.errors.push("Invalid VariableDeclaration: insufficient children.");const t=e.children[0],r=e.children[1];t&&"Identifier"===t.type||this.errors.push("VariableDeclaration must have a valid identifier."),r&&"Literal"===r.type||this.errors.push("VariableDeclaration must have a valid literal value.")}validateInlineConstant(e){e.value||this.errors.push("InlineConstant must have a value.")}validateIdentifier(e){e.value&&/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(e.value)||this.errors.push(`Invalid identifier name: ${e.value}`)}validateLiteral(e){e.value||this.errors.push("Literal must have a value.")}}class s{parse(e){switch(e.type){case"Program":return this.parseProgram(e);case"Statement":return this.parseStatement(e);case"Expression":return this.parseExpression(e);case"VariableDeclaration":return this.parseVariableDeclaration(e);case"InlineConstant":return this.parseInlineConstant(e);case"BinaryExpression":return this.parseBinaryExpression(e);case"BlockStatement":return this.parseBlockStatement(e);case"IfStatement":return this.parseIfStatement(e);case"FunctionDeclaration":return this.parseFunctionDeclaration(e);case"ReturnStatement":return this.parseReturnStatement(e);default:return e.value||""}}parseProgram(e){return e.children?.map((e=>this.parse(e))).filter((e=>null!==e))||[]}parseStatement(e){if(e.value)return e.value;const t=e.children?.map((e=>this.parse(e))).filter((e=>null!==e));return`Statement: ${t?.join("; ")||""}`.trim()}parseExpression(e){if(e.value)return e.value;const t=e.children?.map((e=>this.parse(e))).filter((e=>null!==e));return`Expression: ${t?.join(" ")||""}`.trim()}parseVariableDeclaration(e){const t=e.children?.map((e=>this.parse(e))).filter((e=>null!==e));return`Declare ${t?.join(" ")||""}`.trim()}parseInlineConstant(e){return`Inline ${e.value||""}`.trim()}parseBinaryExpression(e){const t=e.children?.[0],r=e.children?.[1],i=e.value;return`(${t?this.parse(t):""} ${i} ${r?this.parse(r):""})`.trim()}parseBlockStatement(e){const t=e.children?.map((e=>this.parse(e))).filter((e=>null!==e));return`{${t?.length?" "+t.join("; ")+" ":" "}}`}parseIfStatement(e){const[t,r,i]=e.children||[];return`if (${t?this.parse(t):""}) ${r?this.parse(r):""}${i?` else ${this.parse(i)}`:""}`.trim()}parseFunctionDeclaration(e){const t=e.value,r=e.children?.[0];return`function ${t||""} ${r?this.parse(r):""}`.trim()}parseReturnStatement(e){const t=e.children?.[0];return`return ${t?this.parse(t):""}`.trim()}}export{r as JSASTBuilder,n as JSAstGenerator,i as JSAstMinimizer,s as JSParser,t as JSTokenizer,a as JSValidator};
//# sourceMappingURL=index.js.map
