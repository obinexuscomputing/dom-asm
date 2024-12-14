class t{root;constructor(){this.root={type:"Element",name:"root",children:[],parent:null}}buildAST(t){const e=[this.root];let i=this.root;for(const s of t)switch(s.type){case"StartTag":const t={type:"Element",name:s.name,attributes:s.attributes,children:[],parent:i};i.children.push(t),e.push(t),i=t;break;case"EndTag":if(i.name!==s.name)throw new Error(`Unmatched end tag: </${s.name}>. Expected </${i.name}>.`);e.pop(),i=e[e.length-1];break;case"Text":const n={type:"Text",value:s.value,children:[],parent:i};i.children.push(n);break;case"Comment":const r={type:"Comment",value:s.value,children:[],parent:i};i.children.push(r);break;default:throw new Error(`Unsupported token type: ${s}`)}return this.root}getRoot(){return this.root}printAST(t=this.root,e=0){const i="  ".repeat(e);"Element"===t.type?(console.log(`${i}<${t.name}>`),t.children.forEach((t=>this.printAST(t,e+1))),console.log(`${i}</${t.name}>`)):"Text"===t.type?console.log(`${i}${t.value}`):"Comment"===t.type&&console.log(`${i}\x3c!-- ${t.value} --\x3e`)}}class e{generateHTML(t){if("Text"===t.type)return t.value||"";if("Comment"===t.type)return`\x3c!-- ${t.value} --\x3e`;if("Element"===t.type){const e=this.generateAttributes(t.attributes||{}),i=t.children.map((t=>this.generateHTML(t))).join("");return this.isSelfClosingTag(t.name)?`<${t.name}${e} />`:`<${t.name}${e}>${i}</${t.name}>`}return""}generateAttributes(t){return Object.entries(t).map((([t,e])=>` ${t}="${e}"`)).join("")}isSelfClosingTag(t){return["img","input","br","hr","meta","link"].includes(t||"")}}class i{optimize(t){return this.removeEmptyNodes(t),this.mergeTextNodes(t),t}removeEmptyNodes(t){t.children=t.children.filter((t=>("Text"!==t.type||""!==t.value?.trim())&&(!("Element"===t.type&&0===t.children.length&&!this.isSelfClosingTag(t.name))&&(this.removeEmptyNodes(t),!0))))}mergeTextNodes(t){let e=0;for(;e<t.children.length-1;){const i=t.children[e],s=t.children[e+1];"Text"===i.type&&"Text"===s.type?(i.value=(i.value||"")+(s.value||""),t.children.splice(e+1,1)):(this.mergeTextNodes(i),e++)}}isSelfClosingTag(t){return["img","input","br","hr","meta","link"].includes(t||"")}}class s{input;position=0;constructor(t){this.input=t}tokenize(){const t=[];for(;this.position<this.input.length;){"<"===this.input[this.position]?"/"===this.input[this.position+1]?t.push(this.readEndTag()):"!"===this.input[this.position+1]?t.push(this.readComment()):t.push(this.readStartTag()):t.push(this.readText())}return t}readStartTag(){this.position++;const t=this.readUntil(/[ \/>]/),e={};for(;">"!==this.input[this.position]&&"/"!==this.input[this.position];){const t=this.readUntil("=").trim();this.position++;const i=this.input[this.position];this.position++;const s=this.readUntil(new RegExp(`${i}`));e[t]=s,this.position++}return"/"===this.input[this.position]&&this.position++,this.position++,{type:"StartTag",name:t,attributes:e}}readEndTag(){this.position+=2;const t=this.readUntil(">");return this.position++,{type:"EndTag",name:t}}readComment(){this.position+=4;const t=this.readUntil("--\x3e");return this.position+=3,{type:"Comment",value:t}}readText(){return{type:"Text",value:this.readUntil("<")}}readUntil(t){const e=this.position;for(;this.position<this.input.length&&!("string"==typeof t?this.input[this.position]===t:t.test(this.input[this.position]));)this.position++;return this.input.slice(e,this.position)}}class n{namespaceRules={html:["html","head","body","title","meta","link","p","div","a","img","media"]};attributeRules={"html:a":["href","title"],"html:img":["src","alt","width","height"],"html:media":["src","type","controls","autostart"]};validationCache=new Map;registerNamespace(t,e){this.namespaceRules[t]=e}registerAttributes(t,e){this.attributeRules[t]=e}validateAST(t){const e=this.getCacheKey(t);if(this.validationCache.has(e))return this.validationCache.get(e);const i=[];this.traverseAST(t,i);const s={valid:0===i.length,errors:i};return this.validationCache.set(e,s),s}traverseAST(t,e){"Element"===t.type&&this.validateElement(t,e);for(const i of t.children)this.traverseAST(i,e)}validateElement(t,e){if(!t.name)return;const[i,s]=t.name.split(":");if(this.namespaceRules[i]?this.namespaceRules[i].includes(s)||e.push(`Invalid tag <${t.name}> in namespace ${i}`):e.push(`Unknown namespace: ${i} in <${t.name}>`),t.attributes)for(const[i,s]of Object.entries(t.attributes)){(this.attributeRules[t.name]||[]).includes(i)||e.push(`Invalid attribute "${i}" on <${t.name}>`)}}getCacheKey(t){return JSON.stringify(t,((t,e)=>"parent"===t?void 0:e))}}class r{tokenizer;astBuilder;validator;constructor(){this.tokenizer=new s(""),this.astBuilder=new t,this.validator=new n}parse(t){this.tokenizer=new s(t);const e=this.tokenizer.tokenize(),i=this.astBuilder.buildAST(e);return{ast:i,validationResult:this.validator.validateAST(i)}}}export{t as AST,i as ASTOptimizer,e as CodeGenerator,s as HTMLTokenizer,r as Parser};
//# sourceMappingURL=index.js.map
