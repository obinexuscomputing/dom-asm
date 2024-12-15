var e;!function(e){e[e.Keyword=0]="Keyword",e[e.Identifier=1]="Identifier",e[e.Operator=2]="Operator",e[e.Delimiter=3]="Delimiter",e[e.Literal=4]="Literal",e[e.TemplateLiteral=5]="TemplateLiteral",e[e.Comment=6]="Comment",e[e.EndOfStatement=7]="EndOfStatement",e[e.Number=8]="Number",e[e.String=9]="String"}(e||(e={}));class t{keywords=new Set(["const","let","var","if","else","function","return","for","while","true","false"]);operators=new Set(["=","+","-","*","/","%","===","!==","<",">","&&","||","!","==","=>","+=","-=","*=","/=","||=","&&=","??","?."]);singleCharDelimiters=new Set([";","{","}","(",")","[","]"]);previousToken=null;constructor(){}shouldAddSemicolon(t){return!!this.previousToken&&(this.previousToken.type!==e.Delimiter&&!t.some((t=>t.type===e.Delimiter&&";"===t.value)))}readOperator(e,t){let r="",i="",n=t;for(;n<e.length&&/[=!<>&|+\-*/%?.]/.test(e[n]);)r+=e[n],this.operators.has(r)&&(i=r),n++;if(i)return[i,i.length];if(this.operators.has(e[t]))return[e[t],1];throw new Error(`Unexpected character: ${e[t]}`)}tokenize(t){const r=[];let i=0;const n=(e,t)=>{this.previousToken={type:e,value:t},r.push(this.previousToken)};for(;i<t.length;){const r=t[i];if(/\s/.test(r)){i++;continue}if("/"===r&&"/"===t[i+1]){let r="";for(i+=2;i<t.length&&"\n"!==t[i];)r+=t[i++];n(e.Comment,r);continue}if("/"===r&&"*"===t[i+1]){let r="";for(i+=2;i<t.length&&("*"!==t[i]||"/"!==t[i+1]);)r+=t[i++];i+=2,n(e.Comment,r);continue}if(/[0-9]/.test(r)){let r="";for(;i<t.length&&/[0-9.]/.test(t[i]);)r+=t[i++];n(e.Literal,r);continue}if(/[a-zA-Z_$]/.test(r)){let r="";for(;i<t.length&&/[a-zA-Z0-9_$]/.test(t[i]);)r+=t[i++];this.keywords.has(r)?n(e.Keyword,r):n(e.Identifier,r);continue}const a=t.slice(i,i+2);if(this.operators.has(a))n(e.Operator,a),i+=2;else{if(!this.singleCharDelimiters.has(r))throw new Error(`Unexpected character: ${r}`);n(e.Delimiter,r),i++}}return n(e.EndOfStatement,"EOF"),r}}class r{tokens;position;constructor(e){this.tokens=e,this.position=0}currentToken(){return this.position<this.tokens.length?this.tokens[this.position]:null}consumeToken(){return this.tokens[this.position++]}parseProgram(){const e={type:"Program",children:[]};for(;this.currentToken();){const t=this.parseStatement();t&&e.children.push(t)}return e}parseStatement(){const t=this.currentToken();return t?.type===e.Keyword&&"const"===t.value?this.parseVariableDeclaration():null}parseVariableDeclaration(){this.consumeToken();const t=this.consumeToken();if(!t||t.type!==e.Identifier)throw new Error("Expected identifier after 'const'");const r=this.consumeToken();if(!r||"="!==r.value)throw new Error("Expected '=' after identifier");const i=this.consumeToken();if(!i||i.type!==e.Literal)throw new Error("Expected value after '='");return{type:"VariableDeclaration",children:[{type:"Identifier",value:t.value,children:[]},{type:"Literal",value:i.value,children:[]}]}}buildAST(){return this.parseProgram()}}class i{constructor(){}optimize(e){return function e(t){if("VariableDeclaration"===t.type&&t.children){const e=t.children[1];if("Literal"===e.type)return{type:"InlineConstant",value:`${t.children[0].value}=${e.value}`,children:[]}}return t.children&&(t.children=t.children.map(e)),t}(e)}}class n{errors;constructor(){this.errors=[]}validate(e){return this.errors=[],this.traverse(e),this.errors}traverse(e){switch(e.type){case"Program":this.validateProgram(e);break;case"VariableDeclaration":this.validateVariableDeclaration(e);break;case"InlineConstant":this.validateInlineConstant(e);break;case"Identifier":this.validateIdentifier(e);break;case"Literal":this.validateLiteral(e);break;default:this.errors.push(`Unknown node type: ${e.type}`)}if(e.children)for(const t of e.children)this.traverse(t)}validateProgram(e){e.children&&0!==e.children.length||this.errors.push("Program must contain at least one statement.")}validateVariableDeclaration(e){const[t,r]=e.children;t&&"Identifier"===t.type||this.errors.push("VariableDeclaration must have a valid identifier."),r&&"Literal"===r.type||this.errors.push("VariableDeclaration must have a valid literal value.")}validateInlineConstant(e){e.value||this.errors.push("InlineConstant must have a value.")}validateIdentifier(e){e.value&&/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(e.value)||this.errors.push(`Invalid identifier name: ${e.value}`)}validateLiteral(e){e.value||this.errors.push("Literal must have a value.")}}class a{constructor(){}generate(e){if("Program"===e.type)return e.children.map((e=>this.generate(e))).join("\n");if("VariableDeclaration"===e.type){const t=e.children.find((e=>"Identifier"===e.type)),r=e.children.find((e=>"Literal"===e.type));return`const ${t?.value} = ${r?.value};`}return""}}class s{parse(e){return"Program"===e.type?e.children?.map((e=>this.parse(e))):"VariableDeclaration"===e.type?`Declare ${e.children?.map((e=>this.parse(e))).join(" ")}`:"InlineConstant"===e.type?`Inline ${e.value}`:e.value}}export{r as JSASTBuilder,i as JSASTOptimizer,a as JSCodeGenerator,s as JSParser,e as JSTokenType,t as JSTokenizer,n as JSValidator};
//# sourceMappingURL=index.js.map
