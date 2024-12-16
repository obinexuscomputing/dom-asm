"use strict";class t{input;position=0;line=1;column=1;constructor(t){this.input=t}tokenize(){const t=[];for(;this.position<this.input.length;){"<"===this.peek()?this.match("\x3c!--")?t.push(this.readComment()):this.match("<!DOCTYPE")?t.push(this.readDoctype()):"/"===this.peek(1)?t.push(this.readEndTag()):t.push(this.readStartTag()):t.push(this.readText())}return t}readDoctype(){const{line:t,column:e}=this.getCurrentLocation();this.consume(9);const n=this.readUntil(">").trim();return this.consume(),{type:"Doctype",value:n,line:t,column:e}}readEndTag(){const{line:t,column:e}=this.getCurrentLocation();this.consume(2);const n=this.readUntil(">").toLowerCase().trim();return this.consume(),{type:"EndTag",name:n,line:t,column:e}}readStartTag(){const{line:t,column:e}=this.getCurrentLocation();this.consume();const n=this.readUntil(/[ \/>]/).toLowerCase().trim();if(!n)throw new Error(`Invalid start tag at line ${t}, column ${e}`);const s={};let i=!1;for(;this.peek()&&">"!==this.peek();){if(this.skipWhitespace(),"/"===this.peek()){i=!0,this.consume();break}const t=this.readUntil(/[= \/>]/).trim();if(!t)break;if("="===this.peek()){this.consume();const e=this.peek();if('"'===e||"'"===e){this.consume();const n=this.readUntil(e);this.consume(),s[t]=n}else s[t]=this.readUntil(/[ \/>]/)}else s[t]="true"}if(">"!==this.peek())throw new Error(`Unclosed tag: <${n} at line ${t}, column ${e}`);return this.consume(),{type:"StartTag",name:n,attributes:s,selfClosing:i,line:t,column:e}}readComment(){const{line:t,column:e}=this.getCurrentLocation();this.consume(4);const n=this.readUntil("--\x3e");return this.consume(3),{type:"Comment",value:n,line:t,column:e}}readText(){const{line:t,column:e}=this.getCurrentLocation();return{type:"Text",value:this.readUntil("<").trim(),line:t,column:e}}readUntil(t){const e=this.position;for(;this.position<this.input.length&&!("string"==typeof t?this.input[this.position]===t:t.test(this.input.slice(this.position,this.position+1)));)this.consume();return this.input.slice(e,this.position)}peek(t=0){return this.input[this.position+t]||""}match(t){return this.input.startsWith(t,this.position)}matches(t){const e=this.input.slice(this.position);return"string"==typeof t?e.startsWith(t):t.test(e)}consume(t=1){let e="";for(let n=0;n<t;n++){const t=this.input[this.position];"\n"===t?(this.line++,this.column=1):this.column++,e+=t,this.position++}return e}skipWhitespace(){for(;/\s/.test(this.peek());)this.consume()}addError(t){console.error(`Error at line ${this.line}, column ${this.column}: ${t}`)}getCurrentLocation(){return{line:this.line,column:this.column}}}class e{tokens;position;constructor(t){this.tokens=t,this.position=0}buildAST(){const t={type:"Element",name:"root",children:[]},e=[t];let n=t;for(;this.position<this.tokens.length;){const t=this.tokens[this.position++];switch(t.type){case"StartTag":const s={type:"Element",name:t.name,attributes:t.attributes,children:[]};n.children?.push(s),e.push(s),n=s;break;case"EndTag":e.length>1&&n.name===t.name?(e.pop(),n=e[e.length-1]):console.warn(`Unmatched end tag: ${t.name} at position ${this.position}`);break;case"Text":case"Comment":n.children?.push({type:t.type,value:t.value});break;default:console.warn(`Unexpected token type: ${t.type} at position ${this.position}`)}}return e.length>1&&console.warn(`Unclosed tags detected: ${e.slice(1).map((t=>t.name))}`),{root:t,metadata:this.computeMetadata(t)}}computeMetadata(t){let e=0,n=0,s=0,i=0;return function t(o){e++,"Element"===o.type&&n++,"Text"===o.type&&s++,"Comment"===o.type&&i++,o.children?.forEach(t)}(t),{nodeCount:e,elementCount:n,textCount:s,commentCount:i}}}class n extends Error{token;position;constructor(t,e,s){super(t),this.name="HTMLParserError",this.token=e,this.position=s,Error.captureStackTrace&&Error.captureStackTrace(this,n)}}exports.HTMLASTOptimizer=class{optimize(t){return this.removeEmptyNodes(t.root),this.mergeTextNodes(t.root),t}removeEmptyNodes(t){t.children&&(t.children=t.children.filter((t=>!!("Text"!==t.type||""!==t.value?.trim()&&t.value)&&(this.removeEmptyNodes(t),!0))))}mergeTextNodes(t){if(!t.children)return;let e=0;for(;e<t.children.length-1;){const n=t.children[e],s=t.children[e+1];"Text"===n.type&&"Text"===s.type?(n.value=(n.value||"")+(s.value||""),t.children.splice(e+1,1)):(this.mergeTextNodes(n),e++)}}},exports.HTMLCodeGenerator=class{selfClosingTags;constructor(t=["img","input","br","hr","meta","link"]){this.selfClosingTags=t}generateHTML(t){if("Text"===t.type)return t.value||"";if("Comment"===t.type)return`\x3c!-- ${t.value||""} --\x3e`;if("Element"===t.type){const e=this.generateAttributes(t.attributes||{}),n=t.children?.map((t=>this.generateHTML(t))).join("")||"";return this.isSelfClosingTag(t.name)?`<${t.name}${e} />`:`<${t.name}${e}>${n}</${t.name}>`}return""}generateAttributes(t){return Object.entries(t).map((([t,e])=>` ${t}="${e}"`)).join("")}isSelfClosingTag(t){return this.selfClosingTags.includes(t||"")}},exports.HTMLParser=class{tokenizer;options;constructor(e={throwOnError:!0}){this.tokenizer=new t(""),this.options=e}parse(n){const s=new t(n).tokenize();try{return new e(s).buildAST()}catch(t){if(this.options.throwOnError)throw t;return this.options.errorHandler&&this.options.errorHandler(t),{root:{type:"Element",name:"root",children:[]},metadata:{nodeCount:0,elementCount:0,textCount:0,commentCount:0}}}}setErrorHandler(t){this.options.errorHandler=t}buildAST(t){const e={type:"Element",name:"root",children:[]},s=[e];let i=e;for(const e of t)switch(e.type){case"Doctype":i.children?.push({type:"Doctype",value:e.value});break;case"StartTag":const t={type:"Element",name:e.name,attributes:e.attributes,children:[]};i.children?.push(t),s.push(t),i=t;break;case"EndTag":if(s.length>1)s.pop(),i=s[s.length-1];else if(this.options.errorHandler){const t=new n(`Unmatched end tag: ${e.name}`,e,s.length);this.options.errorHandler(t)}break;case"Text":case"Comment":i.children?.push({type:e.type,value:e.value})}if(s.length>1)throw new n("Unclosed tags detected",t[t.length-1],s.length);return e}},exports.HTMLTokenizer=t,exports.HTMLValidator=class{validate(t){const e=[];return this.traverse(t,e),{valid:0===e.length,errors:e}}traverse(t,e){if("Element"===t.type){t.name?.match(/^[a-zA-Z0-9\-]+$/)||e.push(`Invalid tag name: ${t.name||"undefined"}`);for(const n of t.children||[])this.traverse(n,e)}}};
//# sourceMappingURL=index.cjs.map
