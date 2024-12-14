var e;!function(e){e[e.Keyword=0]="Keyword",e[e.Identifier=1]="Identifier",e[e.Operator=2]="Operator",e[e.Delimiter=3]="Delimiter",e[e.Literal=4]="Literal",e[e.TemplateLiteral=5]="TemplateLiteral",e[e.Comment=6]="Comment",e[e.EndOfStatement=7]="EndOfStatement"}(e||(e={}));class t{constructor(){this.keywords=new Set(["const","let","var","if","else","function","return","for","while"]),this.operators=new Set(["=","+","-","*","/","%","===","!==","<",">","&&","||","!"]),this.delimiters=new Set([";","{","}","(",")","[","]"]),this.singleCharDelimiters=new Set([";","{","}","(",")","[","]"]),this.previousToken=null}tokenize(t){const r=[];let i=0;const n=(e,t)=>{this.previousToken={type:e,value:t},r.push(this.previousToken)};for(;i<t.length;){let r=t[i];if(/\s/.test(r)){"\n"===r&&this.previousToken&&this.previousToken.type!==e.Delimiter&&this.previousToken.type!==e.Comment&&this.previousToken.type!==e.TemplateLiteral&&this.previousToken.type!==e.Operator&&(console.log("ASI Debug: Adding semicolon after:",this.previousToken),n(e.Delimiter,";")),i++;continue}if("`"===r){let r="";for(i++;i<t.length&&"`"!==t[i];)if("$"===t[i]&&"{"===t[i+1]){for(r+="${",i+=2;i<t.length&&"}"!==t[i];)r+=t[i++];r+="}",i++}else r+=t[i++];if(i>=t.length)throw new Error("Unterminated template literal");i++,n(e.TemplateLiteral,r);continue}if(this.singleCharDelimiters.has(r)){if(";"===r&&this.previousToken?.type===e.TemplateLiteral){i++;continue}n(e.Delimiter,r),i++;continue}let o="";for(;this.operators.has(o+t[i]);)o+=t[i++];if(o)n(e.Operator,o);else if(/[a-zA-Z_$]/.test(r)){let r="";for(;/[a-zA-Z0-9_$]/.test(t[i]);)r+=t[i++];n(this.keywords.has(r)?e.Keyword:e.Identifier,r)}else{if(!/[0-9]/.test(r))throw new Error(`Unexpected character: ${r}`);{let r="";for(;/[0-9.]/.test(t[i]);)r+=t[i++];n(e.Literal,r)}}}return this.previousToken&&this.previousToken.type!==e.Delimiter&&n(e.Delimiter,";"),n(e.EndOfStatement,"EOF"),r}}class r{build(t){const r={type:"Program",children:[]};let i=0;function n(){const r=t[i];if(r.type===e.Literal)return i++,{type:"Literal",value:r.value};if(r.type===e.Identifier)return i++,{type:"Identifier",value:r.value};if(r.type===e.Keyword&&"const"===r.value){i++;const e=n();i++;const t=n();return i++,{type:"VariableDeclaration",value:"const",children:[e,t]}}throw new Error(`Unexpected token: ${r.type===e.EndOfStatement?"EOF":r.value}`)}for(;i<t.length&&t[i].type!==e.EndOfStatement;)r.children?.push(n());return r}}class i{optimize(e){return function e(t){if("VariableDeclaration"===t.type&&t.children){const e=t.children[1];if("Literal"===e.type)return{type:"InlineConstant",value:`${t.children[0].value}=${e.value}`}}return t.children&&(t.children=t.children.map(e)),t}(e)}}export{r as ASTBuilder,i as ASTOptimizer,e as TokenType,t as Tokenizer};
//# sourceMappingURL=index.js.map
