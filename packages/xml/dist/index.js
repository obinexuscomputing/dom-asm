class t{optimize(t){const e={...t.root};return e.children=this.optimizeChildren(t.root.children||[]),{root:e,metadata:this.computeMetadata(e)}}optimizeChildren(t){let e=t.filter((t=>{if("Text"===t.type)return t.value&&""!==t.value.trim();if("Element"===t.type){return(t.children||[]).some((t=>"Text"===t.type?t.value&&""!==t.value.trim():"Element"===t.type))||Object.keys(t.attributes||{}).length>0}return!0})).map((t=>"Element"===t.type&&t.children?{...t,children:this.optimizeChildren(t.children)}:t)),i=0;for(;i<e.length-1;)"Text"===e[i].type&&"Text"===e[i+1].type?(e[i].value=(e[i].value||"")+(e[i+1].value||""),e.splice(i+1,1)):i++;return e}computeMetadata(t){let e=0,i=0,n=0,s=0;const o=(t,r=!1)=>{if(!r)switch(e++,t.type){case"Element":i++;break;case"Text":n++;break;case"Comment":s++}t.children&&t.children.forEach((t=>o(t)))};return o(t,!0),{nodeCount:e,elementCount:i,textCount:n,commentCount:s}}}class e{options;constructor(t={}){this.options={indent:t.indent??"  ",newLine:t.newLine??"\n",xmlDeclaration:t.xmlDeclaration??!0,prettyPrint:t.prettyPrint??!0}}generate(t){let e="";return this.options.xmlDeclaration&&(e+='<?xml version="1.0" encoding="UTF-8"?>'+this.options.newLine),e+=this.generateNode(t.root,0),e}generateNode(t,e){switch(t.type){case"Element":return this.generateElement(t,e);case"Text":return this.generateText(t,e);case"Comment":return this.generateComment(t,e);case"Doctype":return this.generateDoctype(t,e);default:throw new Error(`Unknown node type: ${t.type}`)}}generateElement(t,e){const i=this.options.prettyPrint?this.getIndent(e):"";let n=i+"<"+(t.name||"");if(t.attributes&&(n+=Object.entries(t.attributes).map((([t,e])=>` ${t}="${this.escapeAttribute(String(e))}"`)).join("")),!t.children?.length)return n+"/>"+this.options.newLine;if(n+=">",1===t.children.length&&"Text"===t.children[0].type)return n+=this.escapeText(t.children[0].value||""),n+="</"+t.name+">"+this.options.newLine,n;n+=this.options.newLine;for(const i of t.children)n+=this.generateNode(i,e+1);return n+=i+"</"+t.name+">"+this.options.newLine,n}generateText(t,e){return(this.options.prettyPrint?this.getIndent(e):"")+this.escapeText(t.value||"")+this.options.newLine}generateComment(t,e){return(this.options.prettyPrint?this.getIndent(e):"")+"\x3c!--"+(t.value||"")+"--\x3e"+this.options.newLine}generateDoctype(t,e){return(this.options.prettyPrint?this.getIndent(e):"")+"<!DOCTYPE "+(t.value||"")+">"+this.options.newLine}getIndent(t){return this.options.indent.repeat(t)}escapeText(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}escapeAttribute(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}}class i{tokens;position;constructor(t){this.tokens=t||[],this.position=0}setTokens(t){this.tokens=t,this.position=0}parse(){this.position=0;const t={type:"Element",name:"root",children:[]},e=[t];let i=t;for(;this.position<this.tokens.length;){const t=this.tokens[this.position++];switch(t.type){case"StartTag":{const n={type:"Element",name:t.name,attributes:t.attributes,children:[]};i.children.push(n),t.selfClosing||(e.push(n),i=n);break}case"EndTag":if(e.length>1){if(i.name!==t.name)throw new Error(`Mismatched tags: opening "${i.name}" and closing "${t.name}" at line ${t.location.line}, column ${t.location.column}`);e.pop(),i=e[e.length-1]}break;case"Text":{const e=t.value?.trim();e&&i.children.push({type:"Text",value:e});break}case"Comment":case"Doctype":i.children.push({type:t.type,value:t.value})}}if(e.length>1){const t=e[e.length-1];throw new Error(`Unclosed tag: ${t.name}`)}return{root:t,metadata:this.computeMetadata(t)}}computeMetadata(t){let e=0,i=0,n=0,s=0;const o=(t,r=!1)=>{r||(e++,"Element"===t.type?i++:"Text"===t.type?n++:"Comment"===t.type&&s++),t.children&&t.children.forEach((t=>o(t)))};return o(t,!0),{nodeCount:e,elementCount:i,textCount:n,commentCount:s}}}class n{input;position;line;column;constructor(t){this.input=t,this.position=0,this.line=1,this.column=1}peek(t=0){return this.input[this.position+t]||""}consume(){const t=this.peek();return"\n"===t?(this.line++,this.column=1):this.column++,this.position++,t}readUntil(t){let e="";for(;this.position<this.input.length&&!("string"==typeof t?this.input.startsWith(t,this.position):t.test(this.peek()));)e+=this.consume();return e}skipWhitespace(){for(;/\s/.test(this.peek());)this.consume()}getCurrentLocation(){return{line:this.line,column:this.column}}}class s extends n{tokenize(){const t=[];for(;this.position<this.input.length;){const e=this.getCurrentLocation();if("<"===this.peek())if("!"===this.peek(1)){if(this.input.startsWith("\x3c!--",this.position)){const i=this.readComment();t.push({...i,location:e})}else if(this.input.startsWith("<!DOCTYPE",this.position)){const i=this.readDoctype();t.push({...i,location:e})}}else if("/"===this.peek(1)){const i=this.readEndTag();t.push({...i,location:e})}else{const i=this.readStartTag();t.push({...i,location:e})}else{const i=this.readText();i.value&&i.value.trim()&&t.push({...i,location:e})}}return t}readStartTag(){this.consume();const t=this.readUntil(/[\s\/>]/),e={};let i=!1;return this.readAttributes(e),this.skipWhitespace(),"/"===this.peek()&&(i=!0,this.consume()),this.consume(),{type:"StartTag",name:t,attributes:e,selfClosing:i,location:this.getCurrentLocation()}}readEndTag(){this.consume(),this.consume();const t=this.readUntil(/[\s>]/);return this.skipWhitespace(),this.consume(),{type:"EndTag",name:t,location:this.getCurrentLocation()}}readText(){return{type:"Text",value:this.readUntil("<"),location:this.getCurrentLocation()}}readComment(){this.position+=4;let t="";for(;this.position<this.input.length&&!this.input.startsWith("--\x3e",this.position);)t+=this.consume();return this.position<this.input.length&&(this.position+=3),{type:"Comment",value:t.trim(),location:this.getCurrentLocation()}}readDoctype(){this.position+=9,this.skipWhitespace();const t=this.readUntil(">");return this.consume(),{type:"Doctype",value:t.trim(),location:this.getCurrentLocation()}}readAttributes(t){for(;this.position<this.input.length&&(this.skipWhitespace(),">"!==this.peek()&&"/"!==this.peek()&&void 0!==this.peek());){const e=this.readUntil(/[\s=>/]/);if(!e)break;let i="";if(this.skipWhitespace(),"="===this.peek()){this.consume(),this.skipWhitespace();const t=this.peek();'"'===t||"'"===t?(this.consume(),i=this.readUntil(t),this.consume()):i=this.readUntil(/[\s>]/)}else i="true";t[e]=i}}}class o{options;schema;constructor(t={}){this.options={strictMode:!1,allowUnknownElements:!0,schema:t.schema,customValidators:t.customValidators||[]},this.schema=t.schema}validate(t){const e=[];return this.schema&&this.validateNode(t.root,e,[]),this.options.customValidators.forEach((i=>{e.push(...i(t))})),{valid:0===e.length,errors:e}}validateNode(t,e,i){if("Element"!==t.type)return;const n=[...i,t.name||""];if(this.schema?.elements){const i=this.schema.elements[t.name||""];if(!i&&this.options.strictMode)return void e.push({code:"UNKNOWN_ELEMENT",message:`Unknown element: ${t.name}`,nodePath:n.join("/")});i&&(this.validateAttributes(t,i,e,n),this.validateChildren(t,i,e,n))}t.children?.forEach((t=>{this.validateNode(t,e,n)}))}validateAttributes(t,e,i,n){const s=t.attributes||{};e.required?.forEach((t=>{s[t]||i.push({code:"MISSING_REQUIRED_ATTRIBUTE",message:`Missing required attribute: ${t}`,nodePath:n.join("/")})})),this.options.strictMode&&e.attributes&&Object.keys(s).forEach((t=>{e.attributes?.includes(t)||i.push({code:"UNKNOWN_ATTRIBUTE",message:`Unknown attribute: ${t}`,nodePath:n.join("/")})}))}validateChildren(t,e,i,n){const s=(t.children||[]).filter((t=>"Element"===t.type));e.children&&s.forEach((t=>{"Element"!==t.type||e.children?.includes(t.name||"")||i.push({code:"INVALID_CHILD_ELEMENT",message:`Invalid child element: ${t.name}`,nodePath:n.join("/")})}))}}class r{tokenizer;parser;optimizer;generator;validator;options;constructor(n={}){this.options={validateOnParse:!1,optimizeAST:!0,...n},this.tokenizer=new s(""),this.parser=new i,this.optimizer=new t,this.generator=new e(n.generatorOptions),this.validator=new o(n.validationOptions)}parse(t){this.tokenizer=new s(t);const e=this.tokenizer.tokenize();this.parser.setTokens(e);let i=this.parser.parse();if(this.options.validateOnParse){const t=this.validator.validate(i);if(!t.valid)throw new Error(`XML Validation failed: ${JSON.stringify(t.errors)}`)}return this.options.optimizeAST&&(i=this.optimizer.optimize(i)),i}generate(t){return this.generator.generate(t)}validate(t){return this.validator.validate(t)}optimize(t){return this.optimizer.optimize(t)}}export{r as DOMXML,e as DOMXMLGenerator,t as DOMXMLOptimizer,i as DOMXMLParser,s as DOMXMLTokenizer,o as DOMXMLValidator,n as XMLBaseTokenizer};
//# sourceMappingURL=index.js.map
