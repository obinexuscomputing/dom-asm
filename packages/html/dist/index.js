class t{input;position=0;line=1;column=1;constructor(t){this.input=t}tokenize(){const t=[];for(;this.position<this.input.length;){if("<"===this.peek())if(this.match("\x3c!--")){const e=this.readComment();"Comment"===e.type&&e.value&&t.push(e)}else this.match("<!DOCTYPE")?t.push(this.readDoctype()):"/"===this.peek(1)?t.push(this.readEndTag()):t.push(this.readStartTag());else{const e=this.readText();"Text"===e.type&&e.value&&t.push(e)}}return t}readStartTag(){const{line:t,column:e}=this.getCurrentLocation();this.consume();const i=this.readTagName(),n={};let s=!1;for(this.position;this.position<this.input.length&&!this.match(">");){if(this.skipWhitespace(),this.match("/>")){s=!0,this.position+=2,this.column+=2;break}if("/"===this.peek()){s=!0,this.consume();continue}const t=this.readUntil(/[\s=\/>]/).trim();if(!t)break;if(this.skipWhitespace(),"="===this.peek()){let e;this.consume(),this.skipWhitespace();const i=this.peek();'"'===i||"'"===i?(this.consume(),e=this.readUntil(i),this.consume()):e=this.readUntil(/[\s\/>]/),n[t]=e}else n[t]="true";this.skipWhitespace()}return">"===this.peek()&&this.consume(),{type:"StartTag",name:i,attributes:n,selfClosing:s,line:t,column:e}}readComment(){const{line:t,column:e}=this.getCurrentLocation();this.consume(4);let i="";for(;this.position<this.input.length&&!this.match("--\x3e");)i+=this.consume();return this.consume(3),{type:"Comment",value:i.trim(),line:t,column:e}}readText(){const{line:t,column:e}=this.getCurrentLocation();let i="";const n=this.position;for(;this.position<this.input.length&&"<"!==this.peek();)i+=this.input[this.position],this.position++;const s={type:"Text",value:i.trim(),line:t,column:e};for(let t=n;t<this.position;t++)"\n"===this.input[t]?(this.line++,this.column=1):this.column++;return s}readEndTag(){const{line:t,column:e}=this.getCurrentLocation();this.position,this.position+=2,this.column+=2;const i=this.readTagName();return this.skipWhitespace(),this.position<this.input.length&&(this.position++,this.column++),{type:"EndTag",name:i,line:t,column:e}}readTagName(){let t="";for(;this.position<this.input.length&&!/[\s>\/]/.test(this.peek());)t+=this.input[this.position],this.position++,this.column++;return t.toLowerCase().trim()}readDoctype(){const{line:t,column:e}=this.getCurrentLocation();this.consume(9);const i=this.readUntil(">").trim();return this.consume(),{type:"Doctype",value:i,line:t,column:e}}peek(t=0){return this.input[this.position+t]||""}match(t){return this.input.startsWith(t,this.position)}readUntil(t){const e=this.position;for(;this.position<this.input.length;){const e=this.peek();if("string"==typeof t?e===t:t.test(e))break;this.consume()}return this.input.slice(e,this.position)}consume(t=1){let e="";for(let i=0;i<t&&this.position<this.input.length;i++){const t=this.input[this.position];e+=t,"\n"===t?(this.line++,this.column=1):this.column++,this.position++}return e}skipWhitespace(){for(;this.position<this.input.length&&/\s/.test(this.peek());)this.consume()}getCurrentLocation(){return{line:this.line,column:this.column}}}class e extends Error{token;position;constructor(t,e,i){super(t),this.token=e,this.position=i,this.name="HTMLParserError"}}class i{tokenizer;options;constructor(e={throwOnError:!0}){this.tokenizer=new t(""),this.options=e}parse(e){this.tokenizer=new t(e);const i=this.tokenizer.tokenize();try{const t=this.buildAST(i);return{root:t,metadata:this.computeMetadata(t)}}catch(t){if(this.options.throwOnError)throw t;return this.options.errorHandler&&this.options.errorHandler(t),{root:{type:"Element",name:"root",children:[],attributes:{}},metadata:{nodeCount:1,elementCount:1,textCount:0,commentCount:0}}}}buildAST(t){const i={type:"Element",name:"root",children:[],attributes:{}},n=[i];let s=i;for(let i=0;i<t.length;i++){const o=t[i];try{switch(o.type){case"StartTag":{const t={type:"Element",name:o.name,attributes:o.attributes||{},children:[]};s.children.push(t),o.selfClosing||(n.push(t),s=t);break}case"EndTag":if(n.length<=1){this.handleError(new e(`Unexpected closing tag "${o.name}"`,o,i));continue}if(s.name!==o.name){this.handleError(new e(`Mismatched tags: expected "${s.name}", got "${o.name}"`,o,i));continue}n.pop(),s=n[n.length-1];break;case"Text":o.value?.trim()&&s.children.push({type:"Text",value:o.value,children:[]});break;case"Comment":s.children.push({type:"Comment",value:o.value||"",children:[]})}}catch(t){this.handleError(t)}}if(n.length>1){const i=t[t.length-1];this.handleError(new e("Unclosed tags detected",i,t.length-1))}return i}handleError(t){if(this.options.errorHandler&&this.options.errorHandler(t),this.options.throwOnError)throw t}computeMetadata(t){let e=0,i=0,n=0,s=0;const o=t=>{switch(e++,t.type){case"Element":i++,t.children?.forEach(o);break;case"Text":n++;break;case"Comment":s++}};return o(t),{nodeCount:e,elementCount:i,textCount:n,commentCount:s}}setErrorHandler(t){this.options.errorHandler=t}}class n{validate(t){const e=[];return this.traverse(t,e),{valid:0===e.length,errors:e}}traverse(t,e){if("Element"===t.type){t.name?.match(/^[a-zA-Z0-9\-]+$/)||e.push(`Invalid tag name: ${t.name||"undefined"}`);for(const i of t.children||[])this.traverse(i,e)}}}class s{selfClosingTags;constructor(t=["img","input","br","hr","meta","link"]){this.selfClosingTags=t}generateHTML(t){if("Text"===t.type)return t.value||"";if("Comment"===t.type)return`\x3c!-- ${t.value||""} --\x3e`;if("Element"===t.type){const e=this.generateAttributes(t.attributes||{}),i=t.children?.map((t=>this.generateHTML(t))).join("")||"";return this.isSelfClosingTag(t.name)?`<${t.name}${e} />`:`<${t.name}${e}>${i}</${t.name}>`}return""}generateAttributes(t){return Object.entries(t).map((([t,e])=>` ${t}="${e}"`)).join("")}isSelfClosingTag(t){return this.selfClosingTags.includes(t||"")}}class o{optimize(t){t.root&&(this.removeEmptyTextNodes(t.root),this.mergeTextNodes(t.root))}removeEmptyTextNodes(t){t.children&&(t.children=t.children.filter((t=>"Text"!==t.type||null!=t.value)),t.children.forEach((t=>{"Element"===t.type&&this.removeEmptyTextNodes(t)})))}mergeTextNodes(t){if(!t.children)return;t.children.forEach((t=>{"Element"===t.type&&this.mergeTextNodes(t)}));let e=0;for(;e<t.children.length-1;){const i=t.children[e],n=t.children[e+1];if("Text"===i.type&&"Text"===n.type){const s=i.value||"",o=n.value||"";i.value=s+o,t.children.splice(e+1,1)}else e++}t.children=t.children.map((t=>"Text"===t.type&&null!=t.value?{...t,value:t.value}:t))}}export{o as HTMLASTOptimizer,s as HTMLCodeGenerator,i as HTMLParser,t as HTMLTokenizer,n as HTMLValidator};
//# sourceMappingURL=index.js.map
