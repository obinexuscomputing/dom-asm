var e;!function(e){e[e.Keyword=0]="Keyword",e[e.Identifier=1]="Identifier",e[e.Operator=2]="Operator",e[e.Delimiter=3]="Delimiter",e[e.Literal=4]="Literal",e[e.TemplateLiteral=5]="TemplateLiteral",e[e.Comment=6]="Comment",e[e.EndOfStatement=7]="EndOfStatement",e[e.Number=8]="Number",e[e.String=9]="String"}(e||(e={}));class t{keywords=new Set(["const","let","var","if","else","function","return","for","while","true","false"]);operators=new Set(["=","+","-","*","/","%","===","!==","<",">","&&","||","!","==","=>","+=","-=","*=","/=","||=","&&=","??","?."]);delimiters=new Set([";","{","}","(",")","[","]"]);singleCharDelimiters=new Set([";","{","}","(",")","[","]"]);previousToken=null;isNumericStart(e){return/[0-9]/.test(e)}isValidNumber(e){if((e.match(/\./g)||[]).length>1)return!1;if(/[eE]/.test(e)){const t=e.split(/[eE]/);if(2!==t.length)return!1;const[r,n]=t;if(!this.isValidNumber(r))return!1;const i=n.replace(/^[+-]/,"");if(!/^\d+$/.test(i))return!1}return!0}readNumber(e,t){let r=t,n="",i=!1,s=!1;if("."===e[r]){if(!/[0-9]/.test(e[r+1]))throw new Error(`Unexpected character: ${e[r]}`);n=".",r++}for(;r<e.length;){const t=e[r],o=e[r+1];if(/[0-9]/.test(t))n+=t;else if("."!==t||i||s){if("e"!==t&&"E"!==t||s){if("."===t&&i)throw new Error("Invalid number format");break}s=!0,n+=t,"+"!==o&&"-"!==o||(n+=o,r++)}else i=!0,n+=t;r++}if(!this.isValidNumber(n))throw new Error("Invalid number format");return[n,r]}readMultilineComment(e,t){let r=t+2,n="",i=1;for(;r<e.length&&i>0;)"/"===e[r]&&"*"===e[r+1]?(i++,n+="/*",r+=2):"*"===e[r]&&"/"===e[r+1]?(i--,i>0&&(n+="*/"),r+=2):n+=e[r++];if(i>0)throw new Error("Unexpected character: EOF");return[n,r]}readTemplateLiteral(e,t){let r=t+1,n="";for(;r<e.length&&"`"!==e[r];)if("\\"===e[r]){const t=e[r+1];if(!["`","$","\\"].includes(t))throw new Error("Invalid escape sequence");n+="\\"+t,r+=2}else if("$"===e[r]&&"{"===e[r+1]){let t=1;const i=r;for(r+=2;r<e.length&&t>0;)"{"===e[r]&&t++,"}"===e[r]&&t--,r++;n+=e.slice(i,r)}else n+=e[r++];if(r>=e.length)throw new Error("Unterminated template literal");return[n,r+1]}readOperator(e,t){let r="",n="",i=t;for(;i<e.length&&/[=!<>&|+\-*/%?.]/.test(e[i]);)r+=e[i],this.operators.has(r)&&(n=r),i++;if(r.includes("=>")&&!this.operators.has(r))throw new Error("Unexpected character: >");return[n,n.length]}readIdentifier(e,t){let r=t;for(;r<e.length&&/[a-zA-Z0-9_$]/.test(e[r]);)r++;return[e.slice(t,r),r]}shouldAddSemicolon(t){return!!this.previousToken&&(this.previousToken.type!==e.Delimiter&&this.previousToken.type!==e.Comment&&this.previousToken.type!==e.TemplateLiteral&&!t.some((r=>r.type===e.Delimiter&&";"===r.value&&t.indexOf(r)===t.length-1)))}tokenize(t){const r=[];let n=0;const i=(e,t)=>{this.previousToken={type:e,value:t},r.push(this.previousToken)};for(;n<t.length;){let s=t[n];if("\\"===s&&"\n"===t[n+1]){n+=2;continue}if(/\s/.test(s)){"\n"===s&&this.shouldAddSemicolon(r)&&i(e.Delimiter,";"),n++;continue}if("/"===s&&"/"===t[n+1]){let r="";for(n+=2;n<t.length&&"\n"!==t[n];)r+=t[n++];r.endsWith("\r")&&(r=r.slice(0,-1)),i(e.Comment,r);continue}if("/"===s&&"*"===t[n+1]){const[r,s]=this.readMultilineComment(t,n);n=s,i(e.Comment,r);continue}if("`"===s){const[r,s]=this.readTemplateLiteral(t,n);n=s,i(e.TemplateLiteral,r);continue}if(this.isNumericStart(s)||"."===s&&this.isNumericStart(t[n+1])){const[r,s]=this.readNumber(t,n);n=s,i(e.Literal,r);continue}if(this.singleCharDelimiters.has(s)){i(e.Delimiter,s),n++;continue}const[o,l]=this.readOperator(t,n);if(o)n+=l,i(e.Operator,o);else{if(!/[a-zA-Z_$]/.test(s))throw new Error(`Unexpected character: ${s}`);{const[r,s]=this.readIdentifier(t,n);n=s,this.previousToken&&this.previousToken.type===e.Operator?i(e.Identifier,r):this.keywords.has(r)?i(e.Keyword,r):i(e.Identifier,r)}}}return this.shouldAddSemicolon(r)&&i(e.Delimiter,";"),i(e.EndOfStatement,"EOF"),r}}class r{tokens;position;constructor(e){this.tokens=e,this.position=0}currentToken(){return this.position<this.tokens.length?this.tokens[this.position]:null}consumeToken(){const e=this.currentToken();return e&&this.position++,e}parseProgram(){const e={type:"Program",children:[]};for(;this.currentToken();){const t=this.parseStatement();t&&e.children.push(t)}return e}parseStatement(){const t=this.currentToken();return t?.type===e.Keyword&&"const"===t.value?this.parseVariableDeclaration():t?.type===e.Literal?this.parseInlineConstant():null}parseVariableDeclaration(){this.consumeToken();const t=this.currentToken();if(!t||t.type!==e.Identifier)throw new Error("Expected identifier after 'const'");this.consumeToken();const r=this.currentToken();if(!r||"="!==r.value)throw new Error("Expected '=' after identifier");this.consumeToken();const n=this.parseValue();if(!n)throw new Error("Expected value after '='");return{type:"VariableDeclaration",children:[{type:"Identifier",value:t.value,children:[]},n]}}parseInlineConstant(){return{type:"InlineConstant",value:this.consumeToken().value,children:[]}}parseValue(){const t=this.currentToken();return t?.type===e.Literal?this.parseInlineConstant():null}buildAST(){return this.parseProgram()}}class n{optimize(e){return function e(t){if("VariableDeclaration"===t.type&&t.children){const e=t.children[1];if("Literal"===e.type)return{type:"InlineConstant",value:`${t.children[0].value}=${e.value}`,children:[]}}return t.children&&(t.children=t.children.map(e)),t}(e)}}class i{generate(e){if("stylesheet"===e.type)return e.children?.map((e=>this.generate(e))).join("\n")||"";if("rule"===e.type){const t=e.children.find((e=>"selector"===e.type)),r=e.children.filter((e=>"declaration"===e.type));return`${t?.value} {\n${r.map((e=>this.generate(e))).join("\n")}\n}`}if("declaration"===e.type){const t=e.children.find((e=>"property"===e.type)),r=e.children.find((e=>"value"===e.type));return`  ${t?.value}: ${r?.value};`}return""}}class s{parse(e){return"Program"===e.type?e.children?.map((e=>this.parse(e))):"VariableDeclaration"===e.type?`Declare ${e.value} ${e.children?.map((e=>this.parse(e))).join(" ")}`:"InlineConstant"===e.type?`Inline ${e.value}`:e.value}}export{n as ASTOptimizer,r as JSASTBuilder,i as JSCodeGenerator,s as JSParser,e as TokenType,t as Tokenizer};
//# sourceMappingURL=index.js.map
