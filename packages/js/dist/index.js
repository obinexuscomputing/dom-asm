var e;!function(e){e[e.Keyword=0]="Keyword",e[e.Identifier=1]="Identifier",e[e.Operator=2]="Operator",e[e.Delimiter=3]="Delimiter",e[e.Literal=4]="Literal",e[e.TemplateLiteral=5]="TemplateLiteral",e[e.Comment=6]="Comment",e[e.EndOfStatement=7]="EndOfStatement"}(e||(e={}));class t{keywords=new Set(["const","let","var","if","else","function","return","for","while","true","false"]);operators=new Set(["=","+","-","*","/","%","===","!==","<",">","&&","||","!","==","=>","+=","-=","*=","/=","||=","&&=","??","?."]);delimiters=new Set([";","{","}","(",")","[","]"]);singleCharDelimiters=new Set([";","{","}","(",")","[","]"]);previousToken=null;isNumericStart(e){return/[0-9]/.test(e)}isValidNumber(e){if((e.match(/\./g)||[]).length>1)return!1;if(/[eE]/.test(e)){const t=e.split(/[eE]/);if(2!==t.length)return!1;const[r,i]=t;if(!this.isValidNumber(r))return!1;const n=i.replace(/^[+-]/,"");if(!/^\d+$/.test(n))return!1}return!0}readNumber(e,t){let r=t,i="",n=!1,o=!1;if("."===e[r]){if(!/[0-9]/.test(e[r+1]))throw new Error(`Unexpected character: ${e[r]}`);i=".",r++}for(;r<e.length;){const t=e[r],l=e[r+1];if(/[0-9]/.test(t))i+=t;else if("."!==t||n||o){if("e"!==t&&"E"!==t||o){if("."===t&&n)throw new Error("Invalid number format");break}o=!0,i+=t,"+"!==l&&"-"!==l||(i+=l,r++)}else n=!0,i+=t;r++}if(!this.isValidNumber(i))throw new Error("Invalid number format");return[i,r]}readMultilineComment(e,t){let r=t+2,i="",n=1;for(;r<e.length&&n>0;)"/"===e[r]&&"*"===e[r+1]?(n++,i+="/*",r+=2):"*"===e[r]&&"/"===e[r+1]?(n--,n>0&&(i+="*/"),r+=2):i+=e[r++];if(n>0)throw new Error("Unexpected character: EOF");return[i,r]}readTemplateLiteral(e,t){let r=t+1,i="";for(;r<e.length&&"`"!==e[r];)if("\\"===e[r]){const t=e[r+1];if(!["`","$","\\"].includes(t))throw new Error("Invalid escape sequence");i+="\\"+t,r+=2}else if("$"===e[r]&&"{"===e[r+1]){let t=1;const n=r;for(r+=2;r<e.length&&t>0;)"{"===e[r]&&t++,"}"===e[r]&&t--,r++;i+=e.slice(n,r)}else i+=e[r++];if(r>=e.length)throw new Error("Unterminated template literal");return[i,r+1]}readOperator(e,t){let r="",i="",n=t;for(;n<e.length&&/[=!<>&|+\-*/%?.]/.test(e[n]);)r+=e[n],this.operators.has(r)&&(i=r),n++;if(r.includes("=>")&&!this.operators.has(r))throw new Error("Unexpected character: >");return[i,i.length]}readIdentifier(e,t){let r=t;for(;r<e.length&&/[a-zA-Z0-9_$]/.test(e[r]);)r++;return[e.slice(t,r),r]}shouldAddSemicolon(t){return!!this.previousToken&&(this.previousToken.type!==e.Delimiter&&this.previousToken.type!==e.Comment&&this.previousToken.type!==e.TemplateLiteral&&!t.some((r=>r.type===e.Delimiter&&";"===r.value&&t.indexOf(r)===t.length-1)))}tokenize(t){const r=[];let i=0;const n=(e,t)=>{this.previousToken={type:e,value:t},r.push(this.previousToken)};for(;i<t.length;){let o=t[i];if("\\"===o&&"\n"===t[i+1]){i+=2;continue}if(/\s/.test(o)){"\n"===o&&this.shouldAddSemicolon(r)&&n(e.Delimiter,";"),i++;continue}if("/"===o&&"/"===t[i+1]){let r="";for(i+=2;i<t.length&&"\n"!==t[i];)r+=t[i++];r.endsWith("\r")&&(r=r.slice(0,-1)),n(e.Comment,r);continue}if("/"===o&&"*"===t[i+1]){const[r,o]=this.readMultilineComment(t,i);i=o,n(e.Comment,r);continue}if("`"===o){const[r,o]=this.readTemplateLiteral(t,i);i=o,n(e.TemplateLiteral,r);continue}if(this.isNumericStart(o)||"."===o&&this.isNumericStart(t[i+1])){const[r,o]=this.readNumber(t,i);i=o,n(e.Literal,r);continue}if(this.singleCharDelimiters.has(o)){n(e.Delimiter,o),i++;continue}const[l,s]=this.readOperator(t,i);if(l)i+=s,n(e.Operator,l);else{if(!/[a-zA-Z_$]/.test(o))throw new Error(`Unexpected character: ${o}`);{const[r,o]=this.readIdentifier(t,i);i=o,this.previousToken&&this.previousToken.type===e.Operator?n(e.Identifier,r):this.keywords.has(r)?n(e.Keyword,r):n(e.Identifier,r)}}}return this.shouldAddSemicolon(r)&&n(e.Delimiter,";"),n(e.EndOfStatement,"EOF"),r}}class r{build(t){const r={type:"Program",children:[]};let i=0;function n(){const r=t[i];if(r.type===e.Literal)return i++,{type:"Literal",value:r.value};if(r.type===e.Identifier)return i++,{type:"Identifier",value:r.value};if(r.type===e.Keyword&&"const"===r.value){i++;const e=n();i++;const t=n();return i++,{type:"VariableDeclaration",value:"const",children:[e,t]}}throw new Error(`Unexpected token: ${r.type===e.EndOfStatement?"EOF":r.value}`)}for(;i<t.length&&t[i].type!==e.EndOfStatement;)r.children?.push(n());return r}}class i{optimize(e){return function e(t){if("VariableDeclaration"===t.type&&t.children){const e=t.children[1];if("Literal"===e.type)return{type:"InlineConstant",value:`${t.children[0].value}=${e.value}`}}return t.children&&(t.children=t.children.map(e)),t}(e)}}export{r as ASTBuilder,i as ASTOptimizer,e as TokenType,t as Tokenizer};
//# sourceMappingURL=index.js.map
