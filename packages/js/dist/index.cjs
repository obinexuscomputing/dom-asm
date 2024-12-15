"use strict";var e;exports.TokenType=void 0,(e=exports.TokenType||(exports.TokenType={}))[e.Keyword=0]="Keyword",e[e.Identifier=1]="Identifier",e[e.Operator=2]="Operator",e[e.Delimiter=3]="Delimiter",e[e.Literal=4]="Literal",e[e.TemplateLiteral=5]="TemplateLiteral",e[e.Comment=6]="Comment",e[e.EndOfStatement=7]="EndOfStatement",e[e.Number=8]="Number",e[e.String=9]="String";exports.ASTOptimizer=class{optimize(e){return function e(t){if("VariableDeclaration"===t.type&&t.children){const e=t.children[1];if("Literal"===e.type)return{type:"InlineConstant",value:`${t.children[0].value}=${e.value}`,children:[]}}return t.children&&(t.children=t.children.map(e)),t}(e)}},exports.JSASTBuilder=class{tokens;position;constructor(e){this.tokens=e,this.position=0}currentToken(){return this.position<this.tokens.length?this.tokens[this.position]:null}consumeToken(){const e=this.currentToken();return e&&this.position++,e}parseProgram(){const e={type:"Program",children:[]};for(;this.currentToken();){const t=this.parseStatement();t&&e.children.push(t)}return e}parseStatement(){const e=this.currentToken();return e?.type===exports.TokenType.Keyword&&"const"===e.value?this.parseVariableDeclaration():e?.type===exports.TokenType.Literal?this.parseInlineConstant():null}parseVariableDeclaration(){this.consumeToken();const e=this.currentToken();if(!e||e.type!==exports.TokenType.Identifier)throw new Error("Expected identifier after 'const'");this.consumeToken();const t=this.currentToken();if(!t||"="!==t.value)throw new Error("Expected '=' after identifier");this.consumeToken();const r=this.parseValue();if(!r)throw new Error("Expected value after '='");return{type:"VariableDeclaration",children:[{type:"Identifier",value:e.value,children:[]},r]}}parseInlineConstant(){return{type:"InlineConstant",value:this.consumeToken().value,children:[]}}parseValue(){const e=this.currentToken();return e?.type===exports.TokenType.Literal?this.parseInlineConstant():null}buildAST(){return this.parseProgram()}},exports.JSCodeGenerator=class{generate(e){if("stylesheet"===e.type)return e.children?.map((e=>this.generate(e))).join("\n")||"";if("rule"===e.type){const t=e.children.find((e=>"selector"===e.type)),r=e.children.filter((e=>"declaration"===e.type));return`${t?.value} {\n${r.map((e=>this.generate(e))).join("\n")}\n}`}if("declaration"===e.type){const t=e.children.find((e=>"property"===e.type)),r=e.children.find((e=>"value"===e.type));return`  ${t?.value}: ${r?.value};`}return""}},exports.JSParser=class{parse(e){return"Program"===e.type?e.children?.map((e=>this.parse(e))):"VariableDeclaration"===e.type?`Declare ${e.value} ${e.children?.map((e=>this.parse(e))).join(" ")}`:"InlineConstant"===e.type?`Inline ${e.value}`:e.value}},exports.Tokenizer=class{keywords=new Set(["const","let","var","if","else","function","return","for","while","true","false"]);operators=new Set(["=","+","-","*","/","%","===","!==","<",">","&&","||","!","==","=>","+=","-=","*=","/=","||=","&&=","??","?."]);delimiters=new Set([";","{","}","(",")","[","]"]);singleCharDelimiters=new Set([";","{","}","(",")","[","]"]);previousToken=null;isNumericStart(e){return/[0-9]/.test(e)}isValidNumber(e){if((e.match(/\./g)||[]).length>1)return!1;if(/[eE]/.test(e)){const t=e.split(/[eE]/);if(2!==t.length)return!1;const[r,n]=t;if(!this.isValidNumber(r))return!1;const i=n.replace(/^[+-]/,"");if(!/^\d+$/.test(i))return!1}return!0}readNumber(e,t){let r=t,n="",i=!1,o=!1;if("."===e[r]){if(!/[0-9]/.test(e[r+1]))throw new Error(`Unexpected character: ${e[r]}`);n=".",r++}for(;r<e.length;){const t=e[r],s=e[r+1];if(/[0-9]/.test(t))n+=t;else if("."!==t||i||o){if("e"!==t&&"E"!==t||o){if("."===t&&i)throw new Error("Invalid number format");break}o=!0,n+=t,"+"!==s&&"-"!==s||(n+=s,r++)}else i=!0,n+=t;r++}if(!this.isValidNumber(n))throw new Error("Invalid number format");return[n,r]}readMultilineComment(e,t){let r=t+2,n="",i=1;for(;r<e.length&&i>0;)"/"===e[r]&&"*"===e[r+1]?(i++,n+="/*",r+=2):"*"===e[r]&&"/"===e[r+1]?(i--,i>0&&(n+="*/"),r+=2):n+=e[r++];if(i>0)throw new Error("Unexpected character: EOF");return[n,r]}readTemplateLiteral(e,t){let r=t+1,n="";for(;r<e.length&&"`"!==e[r];)if("\\"===e[r]){const t=e[r+1];if(!["`","$","\\"].includes(t))throw new Error("Invalid escape sequence");n+="\\"+t,r+=2}else if("$"===e[r]&&"{"===e[r+1]){let t=1;const i=r;for(r+=2;r<e.length&&t>0;)"{"===e[r]&&t++,"}"===e[r]&&t--,r++;n+=e.slice(i,r)}else n+=e[r++];if(r>=e.length)throw new Error("Unterminated template literal");return[n,r+1]}readOperator(e,t){let r="",n="",i=t;for(;i<e.length&&/[=!<>&|+\-*/%?.]/.test(e[i]);)r+=e[i],this.operators.has(r)&&(n=r),i++;if(r.includes("=>")&&!this.operators.has(r))throw new Error("Unexpected character: >");return[n,n.length]}readIdentifier(e,t){let r=t;for(;r<e.length&&/[a-zA-Z0-9_$]/.test(e[r]);)r++;return[e.slice(t,r),r]}shouldAddSemicolon(e){return!!this.previousToken&&(this.previousToken.type!==exports.TokenType.Delimiter&&this.previousToken.type!==exports.TokenType.Comment&&this.previousToken.type!==exports.TokenType.TemplateLiteral&&!e.some((t=>t.type===exports.TokenType.Delimiter&&";"===t.value&&e.indexOf(t)===e.length-1)))}tokenize(e){const t=[];let r=0;const n=(e,r)=>{this.previousToken={type:e,value:r},t.push(this.previousToken)};for(;r<e.length;){let i=e[r];if("\\"===i&&"\n"===e[r+1]){r+=2;continue}if(/\s/.test(i)){"\n"===i&&this.shouldAddSemicolon(t)&&n(exports.TokenType.Delimiter,";"),r++;continue}if("/"===i&&"/"===e[r+1]){let t="";for(r+=2;r<e.length&&"\n"!==e[r];)t+=e[r++];t.endsWith("\r")&&(t=t.slice(0,-1)),n(exports.TokenType.Comment,t);continue}if("/"===i&&"*"===e[r+1]){const[t,i]=this.readMultilineComment(e,r);r=i,n(exports.TokenType.Comment,t);continue}if("`"===i){const[t,i]=this.readTemplateLiteral(e,r);r=i,n(exports.TokenType.TemplateLiteral,t);continue}if(this.isNumericStart(i)||"."===i&&this.isNumericStart(e[r+1])){const[t,i]=this.readNumber(e,r);r=i,n(exports.TokenType.Literal,t);continue}if(this.singleCharDelimiters.has(i)){n(exports.TokenType.Delimiter,i),r++;continue}const[o,s]=this.readOperator(e,r);if(o)r+=s,n(exports.TokenType.Operator,o);else{if(!/[a-zA-Z_$]/.test(i))throw new Error(`Unexpected character: ${i}`);{const[t,i]=this.readIdentifier(e,r);r=i,this.previousToken&&this.previousToken.type===exports.TokenType.Operator?n(exports.TokenType.Identifier,t):this.keywords.has(t)?n(exports.TokenType.Keyword,t):n(exports.TokenType.Identifier,t)}}}return this.shouldAddSemicolon(t)&&n(exports.TokenType.Delimiter,";"),n(exports.TokenType.EndOfStatement,"EOF"),t}};
//# sourceMappingURL=index.cjs.map
