!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).DOMHTML={})}(this,(function(t){"use strict";class e{input;position=0;line=1;column=1;constructor(t){this.input=t}tokenize(){const t=[];for(;this.position<this.input.length;){if("<"===this.peek())if(this.match("\x3c!--")){const e=this.readComment();"Comment"===e.type&&e.value&&t.push(e)}else this.match("<!DOCTYPE")?t.push(this.readDoctype()):"/"===this.peek(1)?t.push(this.readEndTag()):t.push(this.readStartTag());else{const e=this.readText();"Text"===e.type&&e.value&&t.push(e)}}return t}readComment(){const{line:t,column:e}=this.getCurrentLocation();this.consume(4);let n="";for(;this.position<this.input.length&&!this.match("--\x3e");)n+=this.consume();if(this.position>=this.input.length)throw new Error(`Unclosed comment at line ${t}, column ${e}`);return this.consume(3),{type:"Comment",value:n.trim(),line:t,column:e}}readDoctype(){const{line:t,column:e}=this.getCurrentLocation();this.consume(9);const n=this.readUntil(">").trim();return this.consume(),{type:"Doctype",value:n,line:t,column:e}}readStartTag(){const{line:t,column:e}=this.getCurrentLocation();this.consume();const n=this.readUntil(/[\s\/>]/).toLowerCase().trim();if(!n)throw new Error(`Invalid start tag at line ${t}, column ${e}`);const i={};let s=!1;for(this.skipWhitespace();this.position<this.input.length&&!this.match(">");){if(this.match("/>")||"/"===this.peek()){s=!0,this.consume();break}if(!/[a-zA-Z_]/.test(this.peek())){this.consume();continue}const t=this.readUntil(/[\s=\/>]/).trim();if(!t)break;if(this.skipWhitespace(),"="===this.peek()){let e;this.consume(),this.skipWhitespace();const n=this.peek();'"'===n||"'"===n?(this.consume(),e=this.readUntil(n),this.consume()):e=this.readUntil(/[\s\/>]/),i[t]=e}else i[t]="true";this.skipWhitespace()}return">"===this.peek()&&this.consume(),{type:"StartTag",name:n,attributes:i,selfClosing:s,line:t,column:e}}readEndTag(){const{line:t,column:e}=this.getCurrentLocation();this.consume(2);const n=this.readUntil(/[\s>]/).toLowerCase().trim();return this.skipWhitespace(),">"===this.peek()&&this.consume(),{type:"EndTag",name:n,line:t,column:e}}readText(){const{line:t,column:e}=this.getCurrentLocation();let n="";for(;this.position<this.input.length&&"<"!==this.peek();)n+=this.consume();return{type:"Text",value:n.trim(),line:t,column:e}}readUntil(t){const e=this.position;for(;this.position<this.input.length;){const e=this.peek();if("string"==typeof t?e===t:t.test(e))break;this.consume()}return this.input.slice(e,this.position)}peek(t=0){return this.input[this.position+t]||""}match(t){return this.input.startsWith(t,this.position)}consume(t=1){let e="";for(let n=0;n<t&&this.position<this.input.length;n++){const t=this.input[this.position];e+=t,"\n"===t?(this.line++,this.column=1):this.column++,this.position++}return e}skipWhitespace(){for(;this.position<this.input.length&&/\s/.test(this.peek());)this.consume()}getCurrentLocation(){return{line:this.line,column:this.column}}}class n extends Error{token;position;constructor(t,e,n){super(t),this.token=e,this.position=n,this.name="HTMLParserError"}}t.HTMLASTOptimizer=class{optimize(t){t.root&&(this.removeEmptyTextNodes(t.root),this.mergeTextNodes(t.root))}removeEmptyTextNodes(t){t.children&&(t.children=t.children.filter((t=>"Text"!==t.type||t.value&&""!==t.value.trim())),t.children.forEach((t=>{"Element"===t.type&&this.removeEmptyTextNodes(t)})))}mergeTextNodes(t){if(!t.children)return;t.children.forEach((t=>{"Element"===t.type&&this.mergeTextNodes(t)}));let e=0;for(;e<t.children.length-1;){const n=t.children[e],i=t.children[e+1];if("Text"===n.type&&"Text"===i.type){const s=[n.value||"",i.value||""].map((t=>t.trim())).join(" ").trim();n.value=s,t.children.splice(e+1,1)}else e++}}},t.HTMLCodeGenerator=class{selfClosingTags;constructor(t=["img","input","br","hr","meta","link"]){this.selfClosingTags=t}generateHTML(t){if("Text"===t.type)return t.value||"";if("Comment"===t.type)return`\x3c!-- ${t.value||""} --\x3e`;if("Element"===t.type){const e=this.generateAttributes(t.attributes||{}),n=t.children?.map((t=>this.generateHTML(t))).join("")||"";return this.isSelfClosingTag(t.name)?`<${t.name}${e} />`:`<${t.name}${e}>${n}</${t.name}>`}return""}generateAttributes(t){return Object.entries(t).map((([t,e])=>` ${t}="${e}"`)).join("")}isSelfClosingTag(t){return this.selfClosingTags.includes(t||"")}},t.HTMLParser=class{tokenizer;options;constructor(t={throwOnError:!0}){this.tokenizer=new e(""),this.options=t}parse(t){this.tokenizer=new e(t);const n=this.tokenizer.tokenize();try{const t=this.buildAST(n);return{root:t,metadata:this.computeMetadata(t)}}catch(t){if(this.options.throwOnError)throw t;return this.options.errorHandler&&this.options.errorHandler(t),{root:{type:"Element",name:"root",children:[],attributes:{}},metadata:{nodeCount:1,elementCount:1,textCount:0,commentCount:0}}}}buildAST(t){const e={type:"Element",name:"root",children:[],attributes:{}},i=[e];let s=e;for(let e=0;e<t.length;e++){const o=t[e];try{switch(o.type){case"StartTag":{const t={type:"Element",name:o.name,attributes:o.attributes||{},children:[]};s.children.push(t),o.selfClosing||(i.push(t),s=t);break}case"EndTag":if(i.length<=1){this.handleError(new n(`Unexpected closing tag "${o.name}"`,o,e));continue}if(s.name!==o.name){this.handleError(new n(`Mismatched tags: expected "${s.name}", got "${o.name}"`,o,e));continue}i.pop(),s=i[i.length-1];break;case"Text":o.value?.trim()&&s.children.push({type:"Text",value:o.value,children:[]});break;case"Comment":s.children.push({type:"Comment",value:o.value||"",children:[]})}}catch(t){this.handleError(t)}}if(i.length>1){const e=t[t.length-1];this.handleError(new n("Unclosed tags detected",e,t.length-1))}return e}handleError(t){if(this.options.errorHandler&&this.options.errorHandler(t),this.options.throwOnError)throw t}computeMetadata(t){let e=0,n=0,i=0,s=0;const o=t=>{switch(e++,t.type){case"Element":n++,t.children?.forEach(o);break;case"Text":i++;break;case"Comment":s++}};return o(t),{nodeCount:e,elementCount:n,textCount:i,commentCount:s}}setErrorHandler(t){this.options.errorHandler=t}},t.HTMLTokenizer=e,t.HTMLValidator=class{validate(t){const e=[];return this.traverse(t,e),{valid:0===e.length,errors:e}}traverse(t,e){if("Element"===t.type){t.name?.match(/^[a-zA-Z0-9\-]+$/)||e.push(`Invalid tag name: ${t.name||"undefined"}`);for(const n of t.children||[])this.traverse(n,e)}}}}));
//# sourceMappingURL=index.umd.js.map
