"use strict";class e{root;metadata;constructor(e,t){this.root=e,this.metadata=t}computeMetadata(){let e=0,t=0,i=0,n=0;const s=r=>{switch(e++,r.type){case"Element":t++;break;case"Text":i++;break;case"Comment":n++}r.children&&r.children.forEach(s)};return s(this.root),{nodeCount:e,elementCount:t,textCount:i,commentCount:n}}addChildNode(e,t){e.children=e.children||[],e.children.push(t)}removeChildNode(e,t){e.children=e.children?.filter((e=>e!==t))||[]}}class t{optimize(t){const i=this.optimizeNode(t.root);return new e(i,t.computeMetadata())}optimizeChildren(e){let t=e.filter((e=>{if("Text"===e.type)return""!==e.value?.trim();if("Element"===e.type){return(e.children||[]).some((e=>"Text"===e.type?""!==e.value?.trim():"Element"===e.type))||Object.keys(e.attributes||{}).length>0}return!0})).map((e=>"Element"===e.type&&e.children?{...e,children:this.optimizeChildren(e.children)}:e)),i=0;for(;i<t.length-1;)"Text"===t[i].type&&"Text"===t[i+1].type?(t[i].value=(t[i].value||"")+(t[i+1].value||""),t.splice(i+1,1)):i++;return t}optimizeNode(e){return e.children&&(e.children=e.children.filter((e=>"Text"===e.type?""!==e.value?.trim():"Doctype"!==e.type||Object.keys(e.attributes||{}).length>0)).map((e=>this.optimizeNode(e)))),e}computeMetadata(e){let t=0,i=0,n=0,s=0;const r=e=>{switch(t++,e.type){case"Element":i++;break;case"Text":n++;break;case"Comment":s++}e.children&&e.children.forEach(r)};return r(e),{nodeCount:t,elementCount:i,textCount:n,commentCount:s}}}class i{options;constructor(e={}){this.options={indent:e.indent??"  ",newLine:e.newLine??"\n",xmlDeclaration:e.xmlDeclaration??!0,prettyPrint:e.prettyPrint??!0}}generate(e){let t="";return this.options.xmlDeclaration&&(t+='<?xml version="1.0" encoding="UTF-8"?>'+this.options.newLine),t+=this.generateNode(e.root,0),t}generateNode(e,t){switch(e.type){case"Element":return this.generateElement(e,t);case"Text":return this.generateText(e,t);case"Comment":return this.generateComment(e,t);case"Doctype":return this.generateDoctype(e,t);default:throw new Error(`Unknown node type: ${e.type}`)}}generateElement(e,t){const i=this.options.prettyPrint?this.getIndent(t):"";let n=i+"<"+(e.name||"");if(e.attributes&&(n+=Object.entries(e.attributes).map((([e,t])=>` ${e}="${this.escapeAttribute(String(t))}"`)).join("")),!e.children?.length)return n+"/>"+this.options.newLine;if(n+=">",1===e.children.length&&"Text"===e.children[0].type)return n+=this.escapeText(e.children[0].value||""),n+="</"+e.name+">"+this.options.newLine,n;n+=this.options.newLine;for(const i of e.children)n+=this.generateNode(i,t+1);return n+=i+"</"+e.name+">"+this.options.newLine,n}generateText(e,t){return(this.options.prettyPrint?this.getIndent(t):"")+this.escapeText(e.value||"")+this.options.newLine}generateComment(e,t){return(this.options.prettyPrint?this.getIndent(t):"")+"\x3c!--"+(e.value||"")+"--\x3e"+this.options.newLine}generateDoctype(e,t){return(this.options.prettyPrint?this.getIndent(t):"")+"<!DOCTYPE "+(e.value||"")+">"+this.options.newLine}getIndent(e){return this.options.indent.repeat(e)}escapeText(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}escapeAttribute(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}}class n{tokens;position;constructor(e){this.tokens=e||[],this.position=0}setTokens(e){this.tokens=e,this.position=0}parse(){this.position=0;const t={type:"Element",name:"#document",children:[],attributes:{}},i=[t];let n=t;for(;this.position<this.tokens.length;){const e=this.tokens[this.position++];switch(e.type){case"StartTag":{const t={type:"Element",name:e.name,attributes:e.attributes||{},children:[]};n.children.push(t),e.selfClosing||(i.push(t),n=t);break}case"EndTag":if(!(i.length>1))throw new Error(`Unexpected closing tag: "${e.name}".`);{const t=i.pop();if(t.name!==e.name)throw new Error(`Mismatched tags: expected closing tag for "${t.name}", but found "${e.name}".`);n=i[i.length-1]}break;case"Text":{const t=e.value?.trim();t&&n.children.push({type:"Text",value:t});break}case"Comment":n.children.push({type:"Comment",value:e.value||""});break;case"Doctype":n.children.push({type:"Doctype",value:e.value||""});break;default:throw new Error(`Unexpected token type: "${e.type}".`)}}if(i.length>1){const e=i.pop();throw new Error(`Unclosed tag: "${e.name}".`)}const s=t.children[0],r=this.computeMetadata(s);return new e(s,r)}computeMetadata(e){let t=0,i=0,n=0,s=0;const r=e=>{switch(t++,e.type){case"Element":i++,e.children?.forEach(r);break;case"Text":n++;break;case"Comment":s++}};return r(e),{nodeCount:t,elementCount:i,textCount:n,commentCount:s}}}class s{input;position;line;column;type;constructor(e){this.input=e,this.position=0,this.line=1,this.column=1}peek(e=0){return this.input[this.position+e]||""}peekSequence(e){return this.input.slice(this.position,this.position+e)}matches(e){return this.input.startsWith(e,this.position)}consume(){const e=this.peek();return"\n"===e?(this.line++,this.column=1):this.column++,this.position++,e}consumeSequence(e){let t="";for(let i=0;i<e;i++)t+=this.consume();return t}readUntil(e,t={}){const{escape:i=!1,includeStop:n=!1,skipStop:s=!0}=t;let r="",o=!1;for(;this.position<this.input.length;){const t=this.peek();if(i&&"\\"===t&&!o){o=!0,r+=this.consume();continue}const a="string"==typeof e?this.matches(e):e.test(t);if(!o&&a){n?r+="string"==typeof e?this.consumeSequence(e.length):this.consume():s&&(this.position+="string"==typeof e?e.length:1);break}r+=this.consume(),o=!1}return r}readWhile(e){let t="",i=0;for(;this.position<this.input.length&&e(this.peek(),i);)t+=this.consume(),i++;return t}skipWhitespace(){this.readWhile((e=>/\s/.test(e)))}getCurrentLocation(){return{line:this.line,column:this.column}}isNameChar(e){return/[a-zA-Z0-9_\-:]/.test(e)}isIdentifierStart(e){return/[a-zA-Z_]/.test(e)}isIdentifierPart(e){return/[a-zA-Z0-9_\-]/.test(e)}readIdentifier(){return this.isIdentifierStart(this.peek())?this.readWhile(((e,t)=>0===t?this.isIdentifierStart(e):this.isIdentifierPart(e))):""}readQuotedString(){const e=this.peek();if('"'!==e&&"'"!==e)return"";this.consume();const t=this.readUntil(e,{escape:!0});return this.consume(),t}hasMore(){return this.position<this.input.length}addError(e){const t=this.getCurrentLocation();console.error(`Error at line ${t.line}, column ${t.column}: ${e}`)}saveState(){return{position:this.position,line:this.line,column:this.column}}restoreState(e){this.position=e.position,this.line=e.line,this.column=e.column}}class r extends s{constructor(e){super(e)}tokenize(){const e=[];let t=null,i="";for(;this.position<this.input.length;){const n=this.peek(),s={line:this.line,column:this.column};"<"===n?(i.trim()&&e.push({type:"Text",value:i.trim(),location:t}),i="",t=null,this.matches("\x3c!--")?e.push(this.readComment(s)):this.matches("<!DOCTYPE")?e.push(this.readDoctype(s)):"/"===this.peek(1)?e.push(this.readEndTag(s)):e.push(this.readStartTag(s))):(t||(t={...s}),i+=this.consume())}return i.trim()&&e.push({type:"Text",value:i.trim(),location:t}),e}readText(){const e=this.getCurrentLocation();return{type:"Text",value:this.readUntil("<",{includeStop:!1}).trim(),location:e}}readStartTag(e){this.consume();const t=this.readTagName(),i=this.readAttributes();let n=!1;return this.skipWhitespace(),"/"===this.peek()&&(n=!0,this.consume()),">"===this.peek()&&this.consume(),{type:"StartTag",name:t,attributes:i,selfClosing:n,location:e}}readEndTag(e){this.consumeSequence(2);const t=this.readTagName();return this.skipWhitespace(),">"===this.peek()&&this.consume(),{type:"EndTag",name:t,location:e}}readComment(e){this.consumeSequence(4);const t=this.readUntil("--\x3e");return this.consumeSequence(3),{type:"Comment",value:t.trim(),location:e}}readDoctype(e){this.consumeSequence(9),this.skipWhitespace();const t=this.readUntil(">");return this.consume(),{type:"Doctype",value:t.trim(),location:e}}readAttributes(){const e={};for(;this.position<this.input.length&&(this.skipWhitespace(),">"!==this.peek()&&"/"!==this.peek()&&this.peek());){const t=this.readAttributeName();if(!t)break;this.skipWhitespace(),"="===this.peek()?(this.consume(),this.skipWhitespace(),e[t]=this.readAttributeValue()):e[t]="true"}return e}readTagName(){return this.readWhile((e=>this.isNameChar(e)))}readAttributeName(){return this.readWhile((e=>this.isNameChar(e)))}readAttributeValue(){const e=this.peek();if('"'===e||"'"===e){this.consume();const t=this.readUntil(e);return this.consume(),t}return this.readUntil(/[\s>\/]/)}}class o{options;schema;constructor(e={}){this.options={strictMode:!1,allowUnknownElements:!0,schema:e.schema,customValidators:e.customValidators||[]},this.schema=e.schema}validate(e){const t=[];return this.schema&&this.validateNode(e.root,t,[]),this.options.customValidators.forEach((i=>{t.push(...i(e))})),{valid:0===t.length,errors:t}}validateNode(e,t,i){if("Element"!==e.type)return;const n=[...i,e.name||""];if(this.schema?.elements){const i=this.schema.elements[e.name||""];if(!i&&this.options.strictMode)return void t.push({code:"UNKNOWN_ELEMENT",message:`Unknown element: ${e.name}`,nodePath:n.join("/")});i&&(this.validateAttributes(e,i,t,n),this.validateChildren(e,i,t,n))}e.children?.forEach((e=>{this.validateNode(e,t,n)}))}validateAttributes(e,t,i,n){const s=e.attributes||{};t.required?.forEach((e=>{s[e]||i.push({code:"MISSING_REQUIRED_ATTRIBUTE",message:`Missing required attribute: ${e}`,nodePath:n.join("/")})})),this.options.strictMode&&t.attributes&&Object.keys(s).forEach((e=>{t.attributes?.includes(e)||i.push({code:"UNKNOWN_ATTRIBUTE",message:`Unknown attribute: ${e}`,nodePath:n.join("/")})}))}validateChildren(e,t,i,n){const s=(e.children||[]).filter((e=>"Element"===e.type));t.children&&s.forEach((e=>{"Element"!==e.type||t.children?.includes(e.name||"")||i.push({code:"INVALID_CHILD_ELEMENT",message:`Invalid child element: ${e.name}`,nodePath:n.join("/")})}))}}exports.DOMXML=class{tokenizer;parser;optimizer;generator;validator;options;constructor(e={}){this.options={validateOnParse:!1,optimizeAST:!0,...e},this.tokenizer=new r(""),this.parser=new n,this.optimizer=new t,this.generator=new i(e.generatorOptions),this.validator=new o(e.validationOptions)}parse(e){this.tokenizer=new r(e);const t=this.tokenizer.tokenize();this.parser.setTokens(t);let i=this.parser.parse();if(this.options.validateOnParse){const e=this.validator.validate(i);if(!e.valid)throw new Error(`XML Validation failed: ${JSON.stringify(e.errors)}`)}return this.options.optimizeAST&&(i=this.optimizer.optimize(i)),i}generate(e){return this.generator.generate(e)}validate(e){return this.validator.validate(e)}optimize(e){return this.optimizer.optimize(e)}},exports.DOMXMLASTOptimizer=t,exports.DOMXMLGenerator=i,exports.DOMXMLParser=n,exports.DOMXMLTokenizer=r,exports.DOMXMLValidator=o,exports.XMLBaseTokenizer=s;
//# sourceMappingURL=index.cjs.map
