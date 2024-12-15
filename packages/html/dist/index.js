class t{input;position=0;line=1;column=1;constructor(t){this.input=t}tokenize(){const t=[];for(;this.position<this.input.length;){"<"===this.peek()?this.match("\x3c!--")?t.push(this.readComment()):this.match("<!DOCTYPE")?t.push(this.readDoctype()):"/"===this.peek(1)?t.push(this.readEndTag()):t.push(this.readStartTag()):t.push(this.readText())}return t}readDoctype(){const{line:t,column:e}=this.getCurrentLocation();this.consume(9);const i=this.readUntil(">").trim();return this.consume(),{type:"Doctype",value:i,line:t,column:e}}readEndTag(){const{line:t,column:e}=this.getCurrentLocation();this.consume(2);const i=this.readUntil(">").toLowerCase().trim();return this.consume(),{type:"EndTag",name:i,line:t,column:e}}readStartTag(){const{line:t,column:e}=this.getCurrentLocation();this.consume();const i=this.readUntil(/[ \/>]/).toLowerCase().trim();if(!i)throw new Error(`Invalid start tag at line ${t}, column ${e}`);const s={};let n=!1;for(;this.peek()&&">"!==this.peek();){if(this.skipWhitespace(),"/"===this.peek()){n=!0,this.consume();break}const t=this.readUntil(/[= \/>]/).trim();if(!t)break;if("="===this.peek()){this.consume();const e=this.peek();if('"'===e||"'"===e){this.consume();const i=this.readUntil(e);this.consume(),s[t]=i}else s[t]=this.readUntil(/[ \/>]/)}else s[t]="true"}if(">"!==this.peek())throw new Error(`Unclosed tag: <${i} at line ${t}, column ${e}`);return this.consume(),{type:"StartTag",name:i,attributes:s,selfClosing:n,line:t,column:e}}readComment(){const{line:t,column:e}=this.getCurrentLocation();this.consume(4);const i=this.readUntil("--\x3e");return this.consume(3),{type:"Comment",value:i,line:t,column:e}}readText(){const{line:t,column:e}=this.getCurrentLocation();return{type:"Text",value:this.readUntil("<").trim(),line:t,column:e}}readUntil(t){const e=this.position;for(;this.position<this.input.length&&!("string"==typeof t?this.input[this.position]===t:t.test(this.input.slice(this.position,this.position+1)));)this.consume();return this.input.slice(e,this.position)}peek(t=0){return this.input[this.position+t]||""}match(t){return this.input.startsWith(t,this.position)}matches(t){const e=this.input.slice(this.position);return"string"==typeof t?e.startsWith(t):t.test(e)}consume(t=1){let e="";for(let i=0;i<t;i++){const t=this.input[this.position];"\n"===t?(this.line++,this.column=1):this.column++,e+=t,this.position++}return e}skipWhitespace(){for(;/\s/.test(this.peek());)this.consume()}addError(t){console.error(`Error at line ${this.line}, column ${this.column}: ${t}`)}getCurrentLocation(){return{line:this.line,column:this.column}}}class e{tokenizer;constructor(){this.tokenizer=new t("")}parse(e){this.tokenizer=new t(e);const i=this.tokenizer.tokenize();return this.buildAST(i)}buildAST(t){const e={type:"Element",name:"root",children:[]},i=[e];let s=e;for(const e of t)switch(e.type){case"Doctype":s.children?.push({type:"Doctype",value:e.value});break;case"StartTag":const t={type:"Element",name:e.name,attributes:e.attributes,children:[]};s.children?.push(t),i.push(t),s=t;break;case"EndTag":i.length>1&&(i.pop(),s=i[i.length-1]);break;case"Text":case"Comment":s.children?.push({type:e.type,value:e.value})}if(i.length>1)throw new Error("Unclosed tags detected");return e}}class i{validate(t){const e=[];return this.traverse(t,e),{valid:0===e.length,errors:e}}traverse(t,e){if("Element"===t.type){t.name?.match(/^[a-zA-Z0-9\-]+$/)||e.push(`Invalid tag name: ${t.name||"undefined"}`);for(const i of t.children||[])this.traverse(i,e)}}}class s{optimize(t){return this.removeEmptyNodes(t.root),this.mergeTextNodes(t.root),t}removeEmptyNodes(t){t.children&&(t.children=t.children.filter((t=>!!("Text"!==t.type||""!==t.value?.trim()&&t.value)&&(this.removeEmptyNodes(t),!0))))}mergeTextNodes(t){if(t.children){let e=0;for(;e<t.children.length-1;){const i=t.children[e],s=t.children[e+1];"Text"===i.type&&"Text"===s.type?(i.value=(i.value||"")+(s.value||""),t.children.splice(e+1,1)):(this.mergeTextNodes(i),e++)}}}}class n{selfClosingTags;constructor(t=["img","input","br","hr","meta","link"]){this.selfClosingTags=t}generateHTML(t){if("Text"===t.type)return t.value||"";if("Comment"===t.type)return`\x3c!-- ${t.value||""} --\x3e`;if("Element"===t.type){const e=this.generateAttributes(t.attributes||{}),i=t.children?.map((t=>this.generateHTML(t))).join("")||"";return this.isSelfClosingTag(t.name)?`<${t.name}${e} />`:`<${t.name}${e}>${i}</${t.name}>`}return""}generateAttributes(t){return Object.entries(t).map((([t,e])=>` ${t}="${e}"`)).join("")}isSelfClosingTag(t){return this.selfClosingTags.includes(t||"")}}export{s as HTMLASTOptimizer,n as HTMLCodeGenerator,e as HTMLParser,t as HTMLTokenizer,i as HTMLValidator};
//# sourceMappingURL=index.js.map
