"use strict";class t{input;position=0;constructor(t){this.input=t}tokenize(){const t=[];for(;this.position<this.input.length;){"<"===this.input[this.position]?"/"===this.input[this.position+1]?t.push(this.readEndTag()):"!"===this.input[this.position+1]?t.push(this.readComment()):t.push(this.readStartTag()):t.push(this.readText())}return t}readStartTag(){this.position++;const t=this.readUntil(/[ \/>]/),e={};for(;">"!==this.input[this.position]&&"/"!==this.input[this.position];){const t=this.readUntil("=").trim();this.position++;const i=this.input[this.position];this.position++;const n=this.readUntil(new RegExp(`${i}`));e[t]=n,this.position++}return"/"===this.input[this.position]&&this.position++,this.position++,{type:"StartTag",name:t,attributes:e}}readEndTag(){this.position+=2;const t=this.readUntil(">");return this.position++,{type:"EndTag",name:t}}readComment(){this.position+=4;const t=this.readUntil("--\x3e");return this.position+=3,{type:"Comment",value:t}}readText(){return{type:"Text",value:this.readUntil("<")}}readUntil(t){const e=this.position;for(;this.position<this.input.length&&!("string"==typeof t?this.input[this.position]===t:t.test(this.input[this.position]));)this.position++;return this.input.slice(e,this.position)}}class e{root;constructor(){this.root={type:"Element",name:"root",children:[],parent:null}}buildAST(t){const e=[this.root];let i=this.root;for(const n of t)switch(n.type){case"StartTag":const t={type:"Element",name:n.name,attributes:n.attributes,children:[],parent:i};i.children.push(t),e.push(t),i=t;break;case"EndTag":if(i.name!==n.name)throw new Error(`Unmatched end tag: </${n.name}>. Expected </${i.name}>.`);e.pop(),i=e[e.length-1];break;case"Text":const r={type:"Text",value:n.value,children:[],parent:i};i.children.push(r);break;case"Comment":const s={type:"Comment",value:n.value,children:[],parent:i};i.children.push(s);break;default:throw new Error(`Unsupported token type: ${n}`)}return this.root}getRoot(){return this.root}printAST(t=this.root,e=0){const i="  ".repeat(e);"Element"===t.type?(console.log(`${i}<${t.name}>`),t.children.forEach((t=>this.printAST(t,e+1))),console.log(`${i}</${t.name}>`)):"Text"===t.type?console.log(`${i}${t.value}`):"Comment"===t.type&&console.log(`${i}\x3c!-- ${t.value} --\x3e`)}}class i{namespaceRules={html:["html","head","body","title","meta","link","p","div","a","img","media"]};attributeRules={"html:a":["href","title"],"html:img":["src","alt","width","height"],"html:media":["src","type","controls","autostart"]};validationCache=new Map;registerNamespace(t,e){this.namespaceRules[t]=e}registerAttributes(t,e){this.attributeRules[t]=e}validateAST(t){const e=this.getCacheKey(t);if(this.validationCache.has(e))return this.validationCache.get(e);const i=[];this.traverseAST(t,i);const n={valid:0===i.length,errors:i};return this.validationCache.set(e,n),n}traverseAST(t,e){"Element"===t.type&&this.validateElement(t,e);for(const i of t.children)this.traverseAST(i,e)}validateElement(t,e){if(!t.name)return;const[i,n]=t.name.split(":");if(this.namespaceRules[i]?this.namespaceRules[i].includes(n)||e.push(`Invalid tag <${t.name}> in namespace ${i}`):e.push(`Unknown namespace: ${i} in <${t.name}>`),t.attributes)for(const[i,n]of Object.entries(t.attributes)){(this.attributeRules[t.name]||[]).includes(i)||e.push(`Invalid attribute "${i}" on <${t.name}>`)}}getCacheKey(t){return JSON.stringify(t,((t,e)=>"parent"===t?void 0:e))}}class n extends Error{token;position;constructor(t,e,i){super(t),this.name="ParserError",this.token=e,this.position=i,Error.captureStackTrace&&Error.captureStackTrace(this,n)}}exports.AST=e,exports.CodeGenerator=class{generateHTML(t){if("Text"===t.type)return t.value||"";if("Comment"===t.type)return`\x3c!-- ${t.value} --\x3e`;if("Element"===t.type){const e=this.generateAttributes(t.attributes||{}),i=t.children.map((t=>this.generateHTML(t))).join("");return this.isSelfClosingTag(t.name)?`<${t.name}${e} />`:`<${t.name}${e}>${i}</${t.name}>`}return""}generateAttributes(t){return Object.entries(t).map((([t,e])=>` ${t}="${e}"`)).join("")}isSelfClosingTag(t){return["img","input","br","hr","meta","link"].includes(t||"")}},exports.HTMLTokenizer=t,exports.Optimizer=class{optimize(t){return this.removeEmptyNodes(t),this.mergeTextNodes(t),t}removeEmptyNodes(t){t.children=t.children.filter((t=>("Text"!==t.type||""!==t.value?.trim())&&(!("Element"===t.type&&0===t.children.length&&!this.isSelfClosingTag(t.name))&&(this.removeEmptyNodes(t),!0))))}mergeTextNodes(t){let e=0;for(;e<t.children.length-1;){const i=t.children[e],n=t.children[e+1];"Text"===i.type&&"Text"===n.type?(i.value=(i.value||"")+(n.value||""),t.children.splice(e+1,1)):(this.mergeTextNodes(i),e++)}}isSelfClosingTag(t){return["img","input","br","hr","meta","link"].includes(t||"")}},exports.Parser=class{tokenizer;astBuilder;validator;errorHandler=null;shouldThrow=!0;constructor(n={throwOnError:!0}){this.tokenizer=new t(""),this.astBuilder=new e,this.validator=new i,this.shouldThrow=n.throwOnError}setErrorHandler(t){this.errorHandler=t,this.shouldThrow=!1}handleError(t){if(this.errorHandler)this.errorHandler(t);else{if(this.shouldThrow)throw t;console.error(`Error at position ${t.position}: ${t.message}`),console.error(`Problematic token: ${JSON.stringify(t.token)}`)}}isWhitespace(t){return/^\s*$/.test(t)}parse(e){this.tokenizer=new t(e);const i=this.tokenizer.tokenize(),n=this.buildASTWithRecovery(i);return this.cleanWhitespace(n),n}cleanWhitespace(t){t.children&&(t.children=t.children.filter((t=>!("Text"===t.type&&this.isWhitespace(t.value??"")))),t.children.forEach((t=>this.cleanWhitespace(t))))}isElementNode(t){return"Element"===t.type}buildASTWithRecovery(t){const e=this.astBuilder.getRoot(),i=[e];let r=e,s=!1;for(let e=0;e<t.length;e++){const o=t[e];try{switch(o.type){case"StartTag":{const t={type:"Element",name:o.name??"unknown",attributes:o.attributes||{},children:[],parent:r};r.children.push(t),i.push(t),r=t,s=!1;break}case"EndTag":{if(s)continue;const t=i.findIndex((t=>this.isElementNode(t)&&t.name===o.name));if(-1===t){this.handleError(new n(`Unmatched end tag: </${o.name}>. Expected </${this.isElementNode(r)?r.name:"unknown"}>.`,o,e)),s=!0;continue}for(;i.length>t;)i.pop();r=i[i.length-1];break}case"Text":if(!s){const t={type:"Text",value:o.value??"",children:[],parent:r};r.children.push(t)}break;case"Comment":if(!s){const t={type:"Comment",value:o.value??"",children:[],parent:r};r.children.push(t)}}}catch(t){if(t instanceof n){this.handleError(t),s=!0;continue}throw t}}for(;i.length>1;){const e=i.pop();this.isElementNode(e)&&this.handleError(new n(`Unclosed tag: <${e.name}>`,{type:"StartTag",name:e.name,attributes:{}},t.length))}return e}},exports.ParserError=n,exports.Validator=i;
//# sourceMappingURL=index.cjs.map