!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).DOMJS={})}(this,(function(e){"use strict";var t;!function(e){e.Keyword="Keyword",e.Identifier="Identifier",e.Operator="Operator",e.Delimiter="Delimiter",e.Literal="Literal",e.TemplateLiteral="TemplateLiteral",e.Comment="Comment",e.EndOfStatement="EndOfStatement"}(t||(t={}));e.JSASTBuilder=class{tokens;position;constructor(e){this.tokens=e,this.position=0}currentToken(){return this.position<this.tokens.length?this.tokens[this.position]:null}consumeToken(){if(this.position>=this.tokens.length)throw new Error("Unexpected end of input");return this.tokens[this.position++]}peekToken(){return this.position+1<this.tokens.length?this.tokens[this.position+1]:null}parseProgram(){const e={type:"Program",children:[]};for(;this.position<this.tokens.length-1;){const t=this.parseStatement();t&&e.children.push(t)}return e}parseStatement(){const e=this.currentToken();if(!e)return null;if(e.type===t.Keyword&&"const"===e.value)return this.parseVariableDeclaration();throw new Error(`Unexpected token: ${e.value}`)}parseVariableDeclaration(){this.consumeToken();const e=this.consumeToken();if(!e||e.type!==t.Identifier)throw new Error("Expected identifier after 'const'");const r=this.consumeToken();if(!r||r.type!==t.Operator||"="!==r.value)throw new Error("Expected '=' after identifier");const i=this.consumeToken();if(!i||i.type!==t.Literal)throw new Error("Expected literal value after '='");const n=this.consumeToken();if(!n||n.type!==t.Delimiter||";"!==n.value)throw new Error("Expected ';' after value");return{type:"VariableDeclaration",children:[{type:"Identifier",value:e.value,children:[]},{type:"Literal",value:i.value,children:[]}]}}buildAST(){return this.parseProgram()}},e.JSAstGenerator=class{generate(e){if("Program"===e.type)return e.children?.map((e=>this.generate(e))).join("\n")||"";if("VariableDeclaration"===e.type){const t=e.children?.find((e=>"Identifier"===e.type)),r=e.children?.find((e=>"Literal"===e.type));return`const ${t?.value} = ${r?.value};`}return"InlineConstant"===e.type?`const ${e.value};`:e.value||""}},e.JSAstMinimizer=class{uniqueNodes=new Map;minimize(e){return this.uniqueNodes.clear(),this.traverse(e)}optimize(e){return this.traverse(e,!0)}traverse(e,t=!1){const r=`${e.type}:${e.value||""}`;if(this.uniqueNodes.has(r))return this.uniqueNodes.get(r);let i={...e};return e.children&&(i.children=e.children.map((e=>this.traverse(e,t)))),t&&(i=this.performOptimization(i)),this.uniqueNodes.set(r,i),i}performOptimization(e){if("Program"===e.type)return{...e,children:e.children?.map(this.simplifyNode)||[]};if("VariableDeclaration"===e.type&&e.children){const[t,r]=e.children;if("Literal"===r.type)return{type:"InlineConstant",value:`${t.value}=${r.value}`,children:[]}}return e}simplifyNode(e){return e.type,e}},e.JSParser=class{parse(e){return"Program"===e.type?e.children?.map((e=>this.parse(e))):"VariableDeclaration"===e.type?`Declare ${e.children?.map((e=>this.parse(e))).join(" ")}`:"InlineConstant"===e.type?`Inline ${e.value}`:e.value}},e.JSTokenizer=class{keywords=new Set(["const","let","var","if","else","function","return"]);operators=new Set(["=","+","-","*","/","%","===","!==","<",">","==","!="]);delimiters=new Set([";","{","}","(",")","[","]"]);tokenize(e){const r=[];let i=0;e=e.replace(/\s+/g,"");const n=(e,t)=>{r.push({type:e,value:t})};for(;i<e.length;){let r=e[i];const a=e.slice(i),s=this.matchMultiCharOperator(a);if(s)n(t.Operator,s),i+=s.length;else switch(!0){case/[a-zA-Z_$]/.test(r):{let r="";for(;i<e.length&&/[a-zA-Z0-9_$]/.test(e[i]);)r+=e[i++];n(this.keywords.has(r)?t.Keyword:t.Identifier,r);continue}case/[0-9]/.test(r):{let r="";for(;i<e.length&&/[0-9.]/.test(e[i]);)r+=e[i++];n(t.Literal,r);continue}case this.operators.has(r):n(t.Operator,r),i++;continue;case this.delimiters.has(r):if(";"===r){i++;continue}n(t.Delimiter,r),i++;continue;default:throw new Error(`Unexpected character: ${r}`)}}return n(t.EndOfStatement,"EOF"),r}matchMultiCharOperator(e){return["===","!==","==","!="].find((t=>e.startsWith(t)))||null}},e.JSValidator=class{errors;constructor(){this.errors=[]}validate(e){return this.errors=[],this.traverse(e),this.errors}traverse(e){switch(e.type){case"Program":this.validateProgram(e);break;case"VariableDeclaration":this.validateVariableDeclaration(e);break;case"InlineConstant":this.validateInlineConstant(e);break;case"Identifier":this.validateIdentifier(e);break;case"Literal":this.validateLiteral(e);break;default:this.errors.push(`Unknown node type: ${e.type}`)}if(e.children)for(const t of e.children)this.traverse(t)}validateProgram(e){e.children&&0!==e.children.length||this.errors.push("Program must contain at least one statement.")}validateVariableDeclaration(e){if(!e.children||e.children.length<2)return void this.errors.push("Invalid VariableDeclaration: insufficient children.");const t=e.children[0],r=e.children[1];t&&"Identifier"===t.type||this.errors.push("VariableDeclaration must have a valid identifier."),r&&"Literal"===r.type||this.errors.push("VariableDeclaration must have a valid literal value.")}validateInlineConstant(e){e.value||this.errors.push("InlineConstant must have a value.")}validateIdentifier(e){e.value&&/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(e.value)||this.errors.push(`Invalid identifier name: ${e.value}`)}validateLiteral(e){e.value||this.errors.push("Literal must have a value.")}}}));
//# sourceMappingURL=index.umd.js.map
