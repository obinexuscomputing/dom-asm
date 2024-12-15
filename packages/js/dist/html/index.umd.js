!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).DOMHTML={})}(this,(function(e){"use strict";var t;e.TokenType=void 0,(t=e.TokenType||(e.TokenType={}))[t.Keyword=0]="Keyword",t[t.Identifier=1]="Identifier",t[t.Operator=2]="Operator",t[t.Delimiter=3]="Delimiter",t[t.Literal=4]="Literal",t[t.TemplateLiteral=5]="TemplateLiteral",t[t.Comment=6]="Comment",t[t.EndOfStatement=7]="EndOfStatement";e.ASTBuilder=class{build(t){const r={type:"Program",children:[]};let n=0;function i(){const r=t[n];if(r.type===e.TokenType.Literal)return n++,{type:"Literal",value:r.value};if(r.type===e.TokenType.Identifier)return n++,{type:"Identifier",value:r.value};if(r.type===e.TokenType.Keyword&&"const"===r.value){n++;const e=i();n++;const t=i();return n++,{type:"VariableDeclaration",value:"const",children:[e,t]}}throw new Error(`Unexpected token: ${r.type===e.TokenType.EndOfStatement?"EOF":r.value}`)}for(;n<t.length&&t[n].type!==e.TokenType.EndOfStatement;)r.children?.push(i());return r}},e.ASTOptimizer=class{optimize(e){return function e(t){if("VariableDeclaration"===t.type&&t.children){const e=t.children[1];if("Literal"===e.type)return{type:"InlineConstant",value:`${t.children[0].value}=${e.value}`}}return t.children&&(t.children=t.children.map(e)),t}(e)}},e.Tokenizer=class{constructor(){this.keywords=new Set(["const","let","var","if","else","function","return","for","while","true","false"]),this.operators=new Set(["=","+","-","*","/","%","===","!==","<",">","&&","||","!","==","=>","+=","-=","*=","/=","||=","&&=","??","?."]),this.delimiters=new Set([";","{","}","(",")","[","]"]),this.singleCharDelimiters=new Set([";","{","}","(",")","[","]"]),this.previousToken=null}isNumericStart(e){return/[0-9]/.test(e)}isValidNumber(e){if((e.match(/\./g)||[]).length>1)return!1;if(/[eE]/.test(e)){const t=e.split(/[eE]/);if(2!==t.length)return!1;const[r,n]=t;if(!this.isValidNumber(r))return!1;const i=n.replace(/^[+-]/,"");if(!/^\d+$/.test(i))return!1}return!0}readNumber(e,t){let r=t,n="",i=!1,o=!1;if("."===e[r]){if(!/[0-9]/.test(e[r+1]))throw new Error(`Unexpected character: ${e[r]}`);n=".",r++}for(;r<e.length;){const t=e[r],l=e[r+1];if(/[0-9]/.test(t))n+=t;else if("."!==t||i||o){if("e"!==t&&"E"!==t||o){if("."===t&&i)throw new Error("Invalid number format");break}o=!0,n+=t,"+"!==l&&"-"!==l||(n+=l,r++)}else i=!0,n+=t;r++}if(!this.isValidNumber(n))throw new Error("Invalid number format");return[n,r]}readMultilineComment(e,t){let r=t+2,n="",i=1;for(;r<e.length&&i>0;)"/"===e[r]&&"*"===e[r+1]?(i++,n+="/*",r+=2):"*"===e[r]&&"/"===e[r+1]?(i--,i>0&&(n+="*/"),r+=2):n+=e[r++];if(i>0)throw new Error("Unexpected character: EOF");return[n,r]}readTemplateLiteral(e,t){let r=t+1,n="";for(;r<e.length&&"`"!==e[r];)if("\\"===e[r]){const t=e[r+1];if(!["`","$","\\"].includes(t))throw new Error("Invalid escape sequence");n+="\\"+t,r+=2}else if("$"===e[r]&&"{"===e[r+1]){let t=1;const i=r;for(r+=2;r<e.length&&t>0;)"{"===e[r]&&t++,"}"===e[r]&&t--,r++;n+=e.slice(i,r)}else n+=e[r++];if(r>=e.length)throw new Error("Unterminated template literal");return[n,r+1]}readOperator(e,t){let r="",n="",i=t;for(;i<e.length&&/[=!<>&|+\-*/%?.]/.test(e[i]);)r+=e[i],this.operators.has(r)&&(n=r),i++;if(r.includes("=>")&&!this.operators.has(r))throw new Error("Unexpected character: >");return[n,n.length]}readIdentifier(e,t){let r=t;for(;r<e.length&&/[a-zA-Z0-9_$]/.test(e[r]);)r++;return[e.slice(t,r),r]}shouldAddSemicolon(t){return!!this.previousToken&&(this.previousToken.type!==e.TokenType.Delimiter&&this.previousToken.type!==e.TokenType.Comment&&this.previousToken.type!==e.TokenType.TemplateLiteral&&!t.some((r=>r.type===e.TokenType.Delimiter&&";"===r.value&&t.indexOf(r)===t.length-1)))}tokenize(t){const r=[];let n=0;const i=(e,t)=>{this.previousToken={type:e,value:t},r.push(this.previousToken)};for(;n<t.length;){let o=t[n];if("\\"===o&&"\n"===t[n+1]){n+=2;continue}if(/\s/.test(o)){"\n"===o&&this.shouldAddSemicolon(r)&&i(e.TokenType.Delimiter,";"),n++;continue}if("/"===o&&"/"===t[n+1]){let r="";for(n+=2;n<t.length&&"\n"!==t[n];)r+=t[n++];r.endsWith("\r")&&(r=r.slice(0,-1)),i(e.TokenType.Comment,r);continue}if("/"===o&&"*"===t[n+1]){const[r,o]=this.readMultilineComment(t,n);n=o,i(e.TokenType.Comment,r);continue}if("`"===o){const[r,o]=this.readTemplateLiteral(t,n);n=o,i(e.TokenType.TemplateLiteral,r);continue}if(this.isNumericStart(o)||"."===o&&this.isNumericStart(t[n+1])){const[r,o]=this.readNumber(t,n);n=o,i(e.TokenType.Literal,r);continue}if(this.singleCharDelimiters.has(o)){i(e.TokenType.Delimiter,o),n++;continue}const[l,s]=this.readOperator(t,n);if(l)n+=s,i(e.TokenType.Operator,l);else{if(!/[a-zA-Z_$]/.test(o))throw new Error(`Unexpected character: ${o}`);{const[r,o]=this.readIdentifier(t,n);n=o,this.previousToken&&this.previousToken.type===e.TokenType.Operator?i(e.TokenType.Identifier,r):this.keywords.has(r)?i(e.TokenType.Keyword,r):i(e.TokenType.Identifier,r)}}}return this.shouldAddSemicolon(r)&&i(e.TokenType.Delimiter,";"),i(e.TokenType.EndOfStatement,"EOF"),r}}}));
//# sourceMappingURL=index.umd.js.map