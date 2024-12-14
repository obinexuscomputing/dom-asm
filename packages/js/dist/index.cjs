"use strict";var e;exports.TokenType=void 0,(e=exports.TokenType||(exports.TokenType={}))[e.Keyword=0]="Keyword",e[e.Identifier=1]="Identifier",e[e.Operator=2]="Operator",e[e.Delimiter=3]="Delimiter",e[e.Literal=4]="Literal",e[e.TemplateLiteral=5]="TemplateLiteral",e[e.Comment=6]="Comment",e[e.EndOfStatement=7]="EndOfStatement";exports.ASTBuilder=class{build(e){const t={type:"Program",children:[]};let r=0;function n(){const t=e[r];if(t.type===exports.TokenType.Literal)return r++,{type:"Literal",value:t.value};if(t.type===exports.TokenType.Identifier)return r++,{type:"Identifier",value:t.value};if(t.type===exports.TokenType.Keyword&&"const"===t.value){r++;const e=n();r++;const t=n();return r++,{type:"VariableDeclaration",value:"const",children:[e,t]}}throw new Error(`Unexpected token: ${t.type===exports.TokenType.EndOfStatement?"EOF":t.value}`)}for(;r<e.length&&e[r].type!==exports.TokenType.EndOfStatement;)t.children?.push(n());return t}},exports.ASTOptimizer=class{optimize(e){return function e(t){if("VariableDeclaration"===t.type&&t.children){const e=t.children[1];if("Literal"===e.type)return{type:"InlineConstant",value:`${t.children[0].value}=${e.value}`}}return t.children&&(t.children=t.children.map(e)),t}(e)}},exports.Tokenizer=class{constructor(){this.keywords=new Set(["const","let","var","if","else","function","return","for","while","true","false"]),this.operators=new Set(["=","+","-","*","/","%","===","!==","<",">","&&","||","!","==","=>","+=","-=","*=","/=","||=","&&=","??","?."]),this.delimiters=new Set([";","{","}","(",")","[","]"]),this.singleCharDelimiters=new Set([";","{","}","(",")","[","]"]),this.previousToken=null}isNumericStart(e){return/[0-9]/.test(e)}isValidNumber(e){if((e.match(/\./g)||[]).length>1)return!1;if(/[eE]/.test(e)){const t=e.split(/[eE]/);if(2!==t.length)return!1;const[r,n]=t;if(!this.isValidNumber(r))return!1;const i=n.replace(/^[+-]/,"");if(!/^\d+$/.test(i))return!1}return!0}tokenize(e){const t=[];let r=0;const n=(e,r)=>{this.previousToken={type:e,value:r},t.push(this.previousToken)},i=()=>this.previousToken&&this.previousToken.type!==exports.TokenType.Delimiter&&this.previousToken.type!==exports.TokenType.Comment&&this.previousToken.type!==exports.TokenType.TemplateLiteral&&!t.some((e=>e.type===exports.TokenType.Delimiter&&";"===e.value&&t.indexOf(e)===t.length-1)),o=()=>{let t="",n=!1,i=!1;if("."===e[r]){if(!/[0-9]/.test(e[r+1]))throw new Error(`Unexpected character: ${e[r]}`);t=".",r++}for(;r<e.length;){const o=e[r],s=e[r+1];if(/[0-9]/.test(o))t+=o;else if("."!==o||n||i){if("e"!==o&&"E"!==o||i){if("."===o&&n)throw new Error("Invalid number format");break}i=!0,t+=o,"+"!==s&&"-"!==s||(t+=s,r++)}else n=!0,t+=o;r++}if(!this.isValidNumber(t))throw new Error("Invalid number format");return t};for(;r<e.length;){let s=e[r];if(/\s/.test(s)){"\n"===s&&i()&&n(exports.TokenType.Delimiter,";"),r++;continue}if("/"===s&&"/"===e[r+1]){let t="";for(r+=2;r<e.length&&"\n"!==e[r];)t+=e[r++];t.endsWith("\r")&&(t=t.slice(0,-1)),n(exports.TokenType.Comment,t);continue}if("/"===s&&"*"===e[r+1]){let t="";r+=2;let i=1;for(;r<e.length&&i>0;)"/"===e[r]&&"*"===e[r+1]?(i++,t+="/*",r+=2):"*"===e[r]&&"/"===e[r+1]?(i--,i>0&&(t+="*/"),r+=2):t+=e[r++];if(i>0)throw new Error("Unexpected character: EOF");n(exports.TokenType.Comment,t);continue}if("`"===s){let t="";for(r++;r<e.length&&"`"!==e[r];)if("\\"===e[r]){const n=e[r+1];if(!["`","$","\\"].includes(n))throw new Error("Invalid escape sequence");t+="\\"+n,r+=2}else if("$"===e[r]&&"{"===e[r+1]){let n=1;const i=r;for(r+=2;r<e.length&&n>0;)"{"===e[r]&&n++,"}"===e[r]&&n--,r++;t+=e.slice(i,r)}else t+=e[r++];if(r>=e.length)throw new Error("Unterminated template literal");r++,n(exports.TokenType.TemplateLiteral,t);continue}if(this.isNumericStart(s)||"."===s&&this.isNumericStart(e[r+1])){const e=o();n(exports.TokenType.Literal,e);continue}if(this.singleCharDelimiters.has(s)){n(exports.TokenType.Delimiter,s),r++;continue}let l="",p="",a=r;for(;a<e.length&&/[=!<>&|+\-*/%?.]/.test(e[a]);)l+=e[a],this.operators.has(l)&&(p=l),a++;if(l.includes("=>")&&!this.operators.has(l))throw new Error("Unexpected character: >");if(p)r+=p.length,n(exports.TokenType.Operator,p);else{if(!/[a-zA-Z_$]/.test(s))return i()&&n(exports.TokenType.Delimiter,";"),n(exports.TokenType.EndOfStatement,"EOF"),t;{let t="";for(;r<e.length&&/[a-zA-Z0-9_$]/.test(e[r]);)t+=e[r++];if("true"===t||"false"===t)n(exports.TokenType.Literal,t);else{n(this.keywords.has(t)?exports.TokenType.Keyword:exports.TokenType.Identifier,t)}}}}}};
//# sourceMappingURL=index.cjs.map
