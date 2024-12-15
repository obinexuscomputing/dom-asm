class t{root;metadata;constructor(t,e){this.root=t,this.metadata=e}computeMetadata(){let t=0,e=0,i=0,n=0;const s=r=>{switch(t++,r.type){case"Element":e++,r.children?.forEach(s);break;case"Text":i++;break;case"Comment":n++}};return s(this.root),{nodeCount:t,elementCount:e,textCount:i,commentCount:n}}addChildNode(t,e){t.children=t.children||[],t.children.push(e)}removeChildNode(t,e){t.children=t.children?.filter((t=>t!==e))||[]}}class e{optimize(e){const i=this.optimizeNode(e.root);return new t(i,e.computeMetadata())}optimizeChildren(t){let e=t.filter((t=>{if("Text"===t.type)return""!==t.value?.trim();if("Element"===t.type){return(t.children||[]).some((t=>"Text"===t.type?""!==t.value?.trim():"Element"===t.type))||Object.keys(t.attributes||{}).length>0}return!0})).map((t=>"Element"===t.type&&t.children?{...t,children:this.optimizeChildren(t.children)}:t)),i=0;for(;i<e.length-1;){const t=e[i],n=e[i+1];"Text"===t.type&&"Text"===n.type?(t.value=(t.value||"")+(n.value||""),e.splice(i+1,1)):i++}return e}optimizeNode(t){return t.children&&(t.children=this.optimizeChildren(t.children)),t}computeMetadata(t){let e=0,i=0,n=0,s=0;const r=t=>{switch(e++,t.type){case"Element":i++;break;case"Text":n++;break;case"Comment":s++}t.children&&t.children.forEach(r)};return r(t),{nodeCount:e,elementCount:i,textCount:n,commentCount:s}}}class i{options;constructor(t={}){this.options={indent:t.indent??"  ",newLine:t.newLine??"\n",xmlDeclaration:t.xmlDeclaration??!0,prettyPrint:t.prettyPrint??!0}}generate(t){let e="";return this.options.xmlDeclaration&&(e+='<?xml version="1.0" encoding="UTF-8"?>'+this.options.newLine),e+=this.generateNode(t.root,0),e}generateNode(t,e){switch(t.type){case"Element":return this.generateElement(t,e);case"Text":return this.generateText(t,e);case"Comment":return this.generateComment(t,e);case"Doctype":return this.generateDoctype(t,e);default:throw new Error(`Unknown node type: ${t.type}`)}}generateElement(t,e){const i=this.options.prettyPrint?this.getIndent(e):"";let n=i+"<"+(t.name||"");if(t.attributes&&(n+=Object.entries(t.attributes).map((([t,e])=>` ${t}="${this.escapeAttribute(String(e))}"`)).join("")),!t.children?.length)return n+"/>"+this.options.newLine;if(n+=">",1===t.children.length&&"Text"===t.children[0].type)return n+=this.escapeText(t.children[0].value||""),n+="</"+t.name+">"+this.options.newLine,n;n+=this.options.newLine;for(const i of t.children)n+=this.generateNode(i,e+1);return n+=i+"</"+t.name+">"+this.options.newLine,n}generateText(t,e){return(this.options.prettyPrint?this.getIndent(e):"")+this.escapeText(t.value||"")+this.options.newLine}generateComment(t,e){return(this.options.prettyPrint?this.getIndent(e):"")+"\x3c!--"+(t.value||"")+"--\x3e"+this.options.newLine}generateDoctype(t,e){return(this.options.prettyPrint?this.getIndent(e):"")+"<!DOCTYPE "+(t.value||"")+">"+this.options.newLine}getIndent(t){return this.options.indent.repeat(t)}escapeText(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}escapeAttribute(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}}class n{tokens;position;constructor(t){this.tokens=t||[],this.position=0}setTokens(t){this.tokens=t,this.position=0}parse(){this.position=0;const e={type:"Element",name:"#document",children:[],attributes:{}},i=[e];let n=e;for(;this.position<this.tokens.length;){const t=this.tokens[this.position++];switch(t.type){case"StartTag":{const e={type:"Element",name:t.name,attributes:t.attributes||{},children:[]};n.children.push(e),t.selfClosing||(i.push(e),n=e);break}case"EndTag":if(!(i.length>1))throw new Error(`Unexpected closing tag: "${t.name}".`);{const e=i.pop();if(e.name!==t.name)throw new Error(`Mismatched tags: expected closing tag for "${e.name}", but found "${t.name}".`);n=i[i.length-1]}break;case"Text":{const e=t.value?.trim();e&&n.children.push({type:"Text",value:e});break}case"Comment":n.children.push({type:"Comment",value:t.value||""});break;case"Doctype":n.children.push({type:"Doctype",value:t.value||""});break;default:throw new Error(`Unexpected token type: "${t.type}".`)}}if(i.length>1){const t=i.pop();throw new Error(`Unclosed tag: "${t.name}".`)}const s=e.children[0],r=this.computeMetadata(s);return new t(s,r)}computeMetadata(t){let e=0,i=0,n=0,s=0;const r=t=>{switch(e++,t.type){case"Element":i++,t.children?.forEach(r);break;case"Text":n++;break;case"Comment":s++}};return r(t),{nodeCount:e,elementCount:i,textCount:n,commentCount:s}}}class s{input;position;line;column;type;constructor(t){this.input=t,this.position=0,this.line=1,this.column=1}peek(t=0){return this.input[this.position+t]||""}peekSequence(t){return this.input.slice(this.position,this.position+t)}matches(t){return this.input.startsWith(t,this.position)}consume(){const t=this.peek();return"\n"===t?(this.line++,this.column=1):this.column++,this.position++,t}consumeSequence(t){let e="";for(let i=0;i<t;i++)e+=this.consume();return e}readUntil(t,e={}){const{escape:i=!1,includeStop:n=!1,skipStop:s=!0}=e;let r="",o=!1;for(;this.position<this.input.length;){const e=this.peek();if(i&&"\\"===e&&!o){o=!0,r+=this.consume();continue}const a="string"==typeof t?this.matches(t):t.test(e);if(!o&&a){n?r+="string"==typeof t?this.consumeSequence(t.length):this.consume():s&&(this.position+="string"==typeof t?t.length:1);break}r+=this.consume(),o=!1}return r}readWhile(t){let e="",i=0;for(;this.position<this.input.length&&t(this.peek(),i);)e+=this.consume(),i++;return e}skipWhitespace(){this.readWhile((t=>/\s/.test(t)))}getCurrentLocation(){return{line:this.line,column:this.column}}isNameChar(t){return/[a-zA-Z0-9_\-:]/.test(t)}isIdentifierStart(t){return/[a-zA-Z_]/.test(t)}isIdentifierPart(t){return/[a-zA-Z0-9_\-]/.test(t)}readIdentifier(){return this.isIdentifierStart(this.peek())?this.readWhile(((t,e)=>0===e?this.isIdentifierStart(t):this.isIdentifierPart(t))):""}readQuotedString(){const t=this.peek();if('"'!==t&&"'"!==t)return"";this.consume();const e=this.readUntil(t,{escape:!0});return this.consume(),e}hasMore(){return this.position<this.input.length}addError(t){const e=this.getCurrentLocation();console.error(`Error at line ${e.line}, column ${e.column}: ${t}`)}saveState(){return{position:this.position,line:this.line,column:this.column}}restoreState(t){this.position=t.position,this.line=t.line,this.column=t.column}}class r extends s{constructor(t){super(t)}tokenize(){const t=[];let e=null,i="";for(;this.position<this.input.length;){const n=this.peek(),s={line:this.line,column:this.column};"<"===n?(i.trim()&&t.push({type:"Text",value:i.trim(),location:e}),i="",e=null,this.matches("\x3c!--")?t.push(this.readComment(s)):this.matches("<!DOCTYPE")?t.push(this.readDoctype(s)):"/"===this.peek(1)?t.push(this.readEndTag(s)):t.push(this.readStartTag(s))):(e||(e={...s}),i+=this.consume())}return i.trim()&&t.push({type:"Text",value:i.trim(),location:e}),t}readText(){const t=this.getCurrentLocation();return{type:"Text",value:this.readUntil("<",{includeStop:!1}).trim(),location:t}}readStartTag(t){this.consume();const e=this.readTagName(),i=this.readAttributes();let n=!1;return this.skipWhitespace(),"/"===this.peek()&&(n=!0,this.consume()),">"===this.peek()&&this.consume(),{type:"StartTag",name:e,attributes:i,selfClosing:n,location:t}}readEndTag(t){this.consumeSequence(2);const e=this.readTagName();return this.skipWhitespace(),">"===this.peek()&&this.consume(),{type:"EndTag",name:e,location:t}}readComment(t){this.consumeSequence(4);const e=this.readUntil("--\x3e");return this.consumeSequence(3),{type:"Comment",value:e.trim(),location:t}}readDoctype(t){this.consumeSequence(9),this.skipWhitespace();const e=this.readUntil(">");return this.consume(),{type:"Doctype",value:e.trim(),location:t}}readAttributes(){const t={};for(;this.position<this.input.length&&(this.skipWhitespace(),">"!==this.peek()&&"/"!==this.peek()&&this.peek());){const e=this.readAttributeName();if(!e)break;this.skipWhitespace(),"="===this.peek()?(this.consume(),this.skipWhitespace(),t[e]=this.readAttributeValue()):t[e]="true"}return t}readTagName(){return this.readWhile((t=>this.isNameChar(t)))}readAttributeName(){return this.readWhile((t=>this.isNameChar(t)))}readAttributeValue(){const t=this.peek();if('"'===t||"'"===t){this.consume();const e=this.readUntil(t);return this.consume(),e}return this.readUntil(/[\s>\/]/)}}class o{options;schema;constructor(t={}){this.options={strictMode:!1,allowUnknownElements:!0,schema:t.schema,customValidators:t.customValidators||[]},this.schema=t.schema}validate(t){const e=[];return this.schema&&this.validateNode(t.root,e,[]),this.options.customValidators.forEach((i=>{e.push(...i(t))})),{valid:0===e.length,errors:e}}validateNode(t,e,i){if("Element"!==t.type)return;const n=[...i,t.name||""];if(this.schema?.elements){const i=this.schema.elements[t.name||""];if(!i&&this.options.strictMode)return void e.push({code:"UNKNOWN_ELEMENT",message:`Unknown element: ${t.name}`,nodePath:n.join("/")});i&&(this.validateAttributes(t,i,e,n),this.validateChildren(t,i,e,n))}t.children?.forEach((t=>{this.validateNode(t,e,n)}))}validateAttributes(t,e,i,n){const s=t.attributes||{};e.required?.forEach((t=>{s[t]||i.push({code:"MISSING_REQUIRED_ATTRIBUTE",message:`Missing required attribute: ${t}`,nodePath:n.join("/")})})),this.options.strictMode&&e.attributes&&Object.keys(s).forEach((t=>{e.attributes?.includes(t)||i.push({code:"UNKNOWN_ATTRIBUTE",message:`Unknown attribute: ${t}`,nodePath:n.join("/")})}))}validateChildren(t,e,i,n){const s=(t.children||[]).filter((t=>"Element"===t.type));e.children&&s.forEach((t=>{"Element"!==t.type||e.children?.includes(t.name||"")||i.push({code:"INVALID_CHILD_ELEMENT",message:`Invalid child element: ${t.name}`,nodePath:n.join("/")})}))}}class a{tokenizer;parser;optimizer;generator;validator;options;constructor(t={}){this.options={validateOnParse:!1,optimizeAST:!0,...t},this.tokenizer=new r(""),this.parser=new n,this.optimizer=new e,this.generator=new i(t.generatorOptions),this.validator=new o(t.validationOptions)}parse(t){this.tokenizer=new r(t);const e=this.tokenizer.tokenize();this.parser.setTokens(e);let i=this.parser.parse();if(this.options.validateOnParse){const t=this.validator.validate(i);if(!t.valid)throw new Error(`XML Validation failed: ${JSON.stringify(t.errors)}`)}return this.options.optimizeAST&&(i=this.optimizer.optimize(i)),i}generate(t){return this.generator.generate(t)}validate(t){return this.validator.validate(t)}optimize(t){return this.optimizer.optimize(t)}}export{a as DOMXML,e as DOMXMLASTOptimizer,i as DOMXMLGenerator,n as DOMXMLParser,r as DOMXMLTokenizer,o as DOMXMLValidator,s as XMLBaseTokenizer};
//# sourceMappingURL=index.js.map
