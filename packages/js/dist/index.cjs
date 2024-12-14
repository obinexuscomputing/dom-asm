"use strict";var e;exports.TokenType=void 0,(e=exports.TokenType||(exports.TokenType={}))[e.Keyword=0]="Keyword",e[e.Identifier=1]="Identifier",e[e.Operator=2]="Operator",e[e.Delimiter=3]="Delimiter",e[e.Literal=4]="Literal",e[e.TemplateLiteral=5]="TemplateLiteral",e[e.Comment=6]="Comment",e[e.EndOfStatement=7]="EndOfStatement";exports.ASTBuilder=class{build(e){const t={type:"Program",children:[]};let r=0;function n(){const t=e[r];if(t.type===exports.TokenType.Literal)return r++,{type:"Literal",value:t.value};if(t.type===exports.TokenType.Identifier)return r++,{type:"Identifier",value:t.value};if(t.type===exports.TokenType.Keyword&&"const"===t.value){r++;const e=n();r++;const t=n();return r++,{type:"VariableDeclaration",value:"const",children:[e,t]}}throw new Error(`Unexpected token: ${t.type===exports.TokenType.EndOfStatement?"EOF":t.value}`)}for(;r<e.length&&e[r].type!==exports.TokenType.EndOfStatement;)t.children?.push(n());return t}},exports.ASTOptimizer=class{optimize(e){return function e(t){if("VariableDeclaration"===t.type&&t.children){const e=t.children[1];if("Literal"===e.type)return{type:"InlineConstant",value:`${t.children[0].value}=${e.value}`}}return t.children&&(t.children=t.children.map(e)),t}(e)}},exports.Tokenizer=class{constructor(){this.keywords=new Set(["const","let","var","if","else","function","return","for","while","true","false"]),this.operators=new Set(["=","+","-","*","/","%","===","!==","<",">","&&","||","!","==","=>","+=","-=","*=","/=","||=","&&=","??","?."]),this.delimiters=new Set([";","{","}","(",")","[","]"]),this.singleCharDelimiters=new Set([";","{","}","(",")","[","]"]),this.previousToken=null}isValidOperatorChar(e){return/[=!<>&|+\-*/%?.]/.test(e)}tokenize(e){const t=[];let r=0;const n=(e,r)=>{this.previousToken={type:e,value:r},t.push(this.previousToken)},o=()=>this.previousToken&&this.previousToken.type!==exports.TokenType.Delimiter&&this.previousToken.type!==exports.TokenType.Comment&&this.previousToken.type!==exports.TokenType.TemplateLiteral&&!t.some((e=>e.type===exports.TokenType.Delimiter&&";"===e.value&&t.indexOf(e)===t.length-1)),i=()=>{let t="",n=!1,o=!1;if("."===e[r]){if(!/[0-9]/.test(e[r+1]))throw new Error(`Unexpected character: ${e[r]}`);t="0.",r++}for(;r<e.length;){const i=e[r];if(/[0-9]/.test(i))t+=i;else if("."!==i||n){if("e"!==i&&"E"!==i||o)break;{const n=e[r+1];if(!t.length||!/[0-9]/.test(t[t.length-1]))break;o=!0,t+=i,"+"!==n&&"-"!==n||(t+=n,r++)}}else{if(o)break;n=!0,t+=i}r++}if(t.endsWith("e")||t.endsWith("E")||t.endsWith("+")||t.endsWith("-")||t.endsWith("."))throw new Error("Invalid number format");return t},s=()=>{let t="",n="",o=r;for(;o<e.length&&this.isValidOperatorChar(e[o]);)t+=e[o],this.operators.has(t)&&(n=t),o++;if(!n){const t=e.slice(r,r+3);if("==>"===t||t.startsWith(">>"))throw new Error("Unexpected character: >");throw new Error(`Unexpected character: ${e[r]}`)}return r+=n.length,n};for(;r<e.length;){let t=e[r];if(/\s/.test(t))"\n"===t&&o()&&n(exports.TokenType.Delimiter,";"),r++;else if("/"!==t||"/"!==e[r+1])if("/"!==t||"*"!==e[r+1])if("`"!==t)if(this.singleCharDelimiters.has(t))n(exports.TokenType.Delimiter,t),r++;else if(this.isValidOperatorChar(t)){const e=s();n(exports.TokenType.Operator,e)}else if(/[a-zA-Z_$]/.test(t)){let t="";for(;r<e.length&&/[a-zA-Z0-9_$]/.test(e[r]);)t+=e[r++];n(this.keywords.has(t)?exports.TokenType.Keyword:exports.TokenType.Identifier,t)}else{if(!/[0-9.]/.test(t))throw new Error(`Unexpected character: ${t}`);{const e=i();n(exports.TokenType.Literal,e)}}else{let t="";for(r++;r<e.length&&"`"!==e[r];)if("\\"===e[r]){const n=e[r+1];if("`"!==n&&"$"!==n&&"\\"!==n)throw new Error("Invalid escape sequence");t+=e[r]+n,r+=2}else if("$"===e[r]&&"{"===e[r+1]){t+="${",r+=2;let n=1;for(;r<e.length&&n>0;)"{"===e[r]&&n++,"}"===e[r]&&n--,t+=e[r],r++}else t+=e[r++];if(r>=e.length)throw new Error("Unterminated template literal");r++,n(exports.TokenType.TemplateLiteral,t)}else{let t="";r+=2;let o=1;for(;r<e.length&&o>0;)if("/"===e[r]&&"*"===e[r+1]?(o++,t+="/*",r+=2):"*"===e[r]&&"/"===e[r+1]?(o--,o>0&&(t+="*/"),r+=2):t+=e[r++],r>=e.length&&o>0)throw new Error("Unexpected character: EOF");n(exports.TokenType.Comment,t)}else{let t="";for(r+=2;r<e.length&&"\n"!==e[r];)t+=e[r++];n(exports.TokenType.Comment,t)}}return o()&&n(exports.TokenType.Delimiter,";"),n(exports.TokenType.EndOfStatement,"EOF"),t}};
//# sourceMappingURL=index.cjs.map
