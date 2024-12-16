!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).DOMCSS={})}(this,(function(t){"use strict";class e{input;position;line;column;constructor(t){this.input=t,this.position=0,this.line=1,this.column=1}isWhitespace(t){return" "===t||"\t"===t||"\n"===t||"\r"===t}isCommentStart(){return"/"===this.input[this.position]&&"*"===this.input[this.position+1]}isDelimiter(t){return["{","}",":",";",","].includes(t)}consumeWhitespace(){for(;this.isWhitespace(this.input[this.position]);)"\n"===this.input[this.position]?(this.line++,this.column=1):this.column++,this.position++}consumeComment(){const t=this.position;for(this.position+=2;this.position<this.input.length&&("*"!==this.input[this.position]||"/"!==this.input[this.position+1]);)"\n"===this.input[this.position]?(this.line++,this.column=1):this.column++,this.position++;return this.position+=2,{type:"comment",value:this.input.slice(t,this.position),position:{line:this.line,column:this.column}}}consumeDelimiter(){const t=this.input[this.position];return this.position++,this.column++,{type:"delimiter",value:t,position:{line:this.line,column:this.column}}}consumeOther(){const t=this.position;for(;this.position<this.input.length&&!this.isWhitespace(this.input[this.position])&&!this.isCommentStart()&&!this.isDelimiter(this.input[this.position]);)this.position++,this.column++;return{type:"other",value:this.input.slice(t,this.position),position:{line:this.line,column:this.column}}}tokenize(){const t=[];for(;this.position<this.input.length;){const e=this.input[this.position];this.isWhitespace(e)?this.consumeWhitespace():this.isCommentStart()?t.push(this.consumeComment()):this.isDelimiter(e)?t.push(this.consumeDelimiter()):t.push(this.consumeOther())}return t}}class i{tokens;position;constructor(t){this.tokens=t,this.position=0}currentToken(){return this.position<this.tokens.length?this.tokens[this.position]:null}consumeToken(){const t=this.currentToken();return t&&this.position++,t}parseStylesheet(){const t={type:"stylesheet",children:[]};for(;this.currentToken();){const e=this.parseRule();e&&t.children.push(e)}return t}parseRule(){const t=this.parseSelector();if(!t)return null;const e={type:"rule",children:[t]},i=this.currentToken();if("other"===i?.type&&"{"===i.value){this.consumeToken();const t=this.parseDeclarations();e.children.push(...t);const i=this.currentToken();if("other"!==i?.type||"}"!==i.value)throw new Error(`Unexpected token: expected '}' but found ${i?.value}`);this.consumeToken()}return e}parseSelector(){const t=this.currentToken();return"other"===t?.type?(this.consumeToken(),{type:"selector",value:t.value,children:[]}):null}parseDeclarations(){const t=[];for(;this.currentToken()&&"}"!==this.currentToken()?.value;){const e=this.parseDeclaration();e&&t.push(e)}return t}parseDeclaration(){const t=this.parseProperty();if(!t)return null;const e=this.currentToken();if("other"===e?.type&&":"===e.value){this.consumeToken();const e=this.parseValue();if(e){const i={type:"declaration",children:[t,e]},s=this.currentToken();return"other"===s?.type&&";"===s.value&&this.consumeToken(),i}}return null}parseProperty(){const t=this.currentToken();return"other"===t?.type?(this.consumeToken(),{type:"property",value:t.value,children:[]}):null}parseValue(){const t=this.currentToken();return"other"===t?.type?(this.consumeToken(),{type:"value",value:t.value,children:[]}):null}buildAST(){return this.parseStylesheet()}}class s{ast;constructor(t){this.ast=t}removeDuplicateDeclarations(t){if("rule"===t.type){const e=t.children.filter((t=>"declaration"===t.type)),i={};for(const t of e){const e=t.children.find((t=>"property"===t.type));e&&e.value&&(i[e.value]=t)}t.children=t.children.filter((t=>"declaration"!==t.type)).concat(Object.values(i))}for(const e of t.children)this.removeDuplicateDeclarations(e)}mergeAdjacentRules(t){if("stylesheet"===t.type){const e={};t.children=t.children.filter((t=>{if("rule"===t.type){const i=t.children.find((t=>"selector"===t.type));if(i&&i.value){if(e[i.value])return e[i.value].children.push(...t.children.filter((t=>"declaration"===t.type))),!1;e[i.value]=t}}return!0}))}for(const e of t.children)this.mergeAdjacentRules(e)}optimize(){return this.removeDuplicateDeclarations(this.ast),this.mergeAdjacentRules(this.ast),this.ast}}class n{ast;errors;constructor(t){this.ast=t,this.errors=[]}validateStylesheet(t){"stylesheet"!==t.type&&this.errors.push(`Invalid root node type: ${t.type}`);for(const e of t.children)"rule"===e.type?this.validateRule(e):this.errors.push(`Invalid child node type in stylesheet: ${e.type}`)}validateRule(t){const e=t.children.find((t=>"selector"===t.type));e&&e.value||this.errors.push("Missing or invalid selector in rule.");const i=t.children.filter((t=>"declaration"===t.type));for(const t of i)this.validateDeclaration(t)}validateDeclaration(t){const e=t.children.find((t=>"property"===t.type)),i=t.children.find((t=>"value"===t.type));e&&e.value||this.errors.push("Missing or invalid property in declaration."),i&&i.value||this.errors.push("Missing or invalid value in declaration.")}validate(){return this.validateStylesheet(this.ast),this.errors}}t.CSSASTOptimizer=s,t.CSSCodeGenerator=class{ast;constructor(t){this.ast=t}generateStylesheet(t){return t.children.map((t=>this.generateRule(t))).join("\n")}generateRule(t){const e=t.children.find((t=>"selector"===t.type)),i=t.children.filter((t=>"declaration"===t.type));if(!e)throw new Error("Rule missing a selector.");return`${this.generateSelector(e)} {\n    ${i.map((t=>this.generateDeclaration(t))).join("\n  ")}\n  }`}generateSelector(t){return t.value||""}generateDeclaration(t){const e=t.children.find((t=>"property"===t.type)),i=t.children.find((t=>"value"===t.type));if(!e||!i)throw new Error("Declaration missing a property or value.");return`${e.value}: ${i.value};`}generate(){if("stylesheet"!==this.ast.type)throw new Error("AST root node must be of type 'stylesheet'.");return this.generateStylesheet(this.ast)}},t.CSSParser=class{input;validate;constructor(t,e=!1){this.input=t,this.validate=e}parse(){const t=new e(this.input).tokenize();let r=new i(t).buildAST();if(this.validate){const t=new n(r).validate();if(t.length>0)throw new Error(`Validation errors:\n${t.join("\n")}`)}return r=new s(r).optimize(),r}},t.CSSTokenizer=e,t.CSSValidator=n}));
//# sourceMappingURL=index.umd.js.map
