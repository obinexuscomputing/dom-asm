!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).DOMHTML={})}(this,(function(e){"use strict";class t{input;position=0;line=1;column=1;lastTokenEnd=0;constructor(e){this.input=e}tokenize(){this.position=0,this.line=1,this.column=1,this.lastTokenEnd=0;const e=[];let t=0;for(;this.position<this.input.length;){const s=this.peek();if("<"===s){if(t<this.position){const s=this.input.slice(t,this.position),i=this.createTextToken(s,t);this.isTextToken(i)&&i.value&&e.push(i)}const s=this.position;if(this.match("\x3c!--")){const t=this.readComment();this.isCommentToken(t)&&t.value&&e.push(t)}else if(this.match("<!DOCTYPE"))e.push(this.readDoctype());else if("/"===this.peek(1)){const t=this.readEndTag();e.push({...t,column:this.getColumnAtPosition(s)})}else e.push(this.readStartTag());t=this.position,this.lastTokenEnd=this.position}else this.position++,"\n"===s?(this.line++,this.column=1):this.column++}if(t<this.position){const s=this.input.slice(t,this.position),i=this.createTextToken(s,t);this.isTextToken(i)&&i.value&&e.push(i)}return e}isTextToken(e){return"Text"===e.type}isCommentToken(e){return"Comment"===e.type}createTextToken(e,t){let s=1,i=-1;for(let e=0;e<t;e++)"\n"===this.input[e]&&(s++,i=e);const n=-1===i?t+1:t-i;return{type:"Text",value:e.trim(),line:s,column:n}}readStartTag(){const{line:e,column:t}=this.getCurrentLocation();this.consume();const s=this.readTagName(),i={};let n=!1;for(;this.position<this.input.length&&!this.match(">");){if(this.skipWhitespace(),this.match("/>")){n=!0,this.position+=2,this.column+=2;break}if("/"===this.peek()){n=!0,this.consume();continue}const e=this.readUntil(/[\s=\/>]/).trim();if(!e)break;if(this.skipWhitespace(),"="===this.peek()){let t;this.consume(),this.skipWhitespace();const s=this.peek();'"'===s||"'"===s?(this.consume(),t=this.readUntil(s),this.consume()):t=this.readUntil(/[\s\/>]/),i[e]=t}else i[e]="true";this.skipWhitespace()}return">"===this.peek()&&this.consume(),{type:"StartTag",name:s,attributes:i,selfClosing:n,line:e,column:t}}readEndTag(){const{line:e,column:t}=this.getCurrentLocation();this.consume(2);const s=this.readTagName();return this.skipWhitespace(),">"===this.peek()&&this.consume(),{type:"EndTag",name:s,line:e,column:t}}readComment(){const{line:e,column:t}=this.getCurrentLocation();this.consume(4);let s="";for(;this.position<this.input.length&&!this.match("--\x3e");)s+=this.consume();return this.consume(3),{type:"Comment",value:s.trim(),line:e,column:t}}readDoctype(){const{line:e,column:t}=this.getCurrentLocation();this.consume(9);const s=this.readUntil(">").trim();return this.consume(),{type:"Doctype",value:s,line:e,column:t}}readTagName(){let e="";for(;this.position<this.input.length&&!/[\s>\/]/.test(this.peek());)e+=this.input[this.position],this.position++,this.column++;return e.toLowerCase().trim()}getColumnAtPosition(e){let t=this.input.lastIndexOf("\n",e-1);return-1===t?e+1:e-t}peek(e=0){return this.input[this.position+e]||""}match(e){return this.input.startsWith(e,this.position)}readUntil(e){const t=this.position;for(;this.position<this.input.length;){const t=this.peek();if("string"==typeof e?t===e:e.test(t))break;this.consume()}return this.input.slice(t,this.position)}consume(e=1){let t="";for(let s=0;s<e&&this.position<this.input.length;s++){const e=this.input[this.position];t+=e,"\n"===e?(this.line++,this.column=1):this.column++,this.position++}return t}skipWhitespace(){for(;this.position<this.input.length&&/\s/.test(this.peek());)this.consume()}getCurrentLocation(){return{line:this.line,column:this.column}}}class s extends Error{token;position;constructor(e,t,s){super(e),this.token=t,this.position=s,this.name="HTMLParserError"}}e.HTMLASTOptimizer=class{optimize(e){e.root&&(this.removeEmptyTextNodes(e.root),this.mergeTextNodes(e.root))}removeEmptyTextNodes(e){e.children&&(e.children=e.children.filter((t=>"Text"!==t.type||null!=t.value&&(""!==t.value.trim()||this.isSignificantWhitespace(t,e.children)))),e.children.forEach((e=>{"Element"===e.type&&this.removeEmptyTextNodes(e)})))}isSignificantWhitespace(e,t){if("Text"!==e.type||!e.value)return!1;const s=t.indexOf(e),i=s>0?t[s-1]:null,n=s<t.length-1?t[s+1]:null;return"Element"===i?.type||"Element"===n?.type}mergeTextNodes(e){if(e.children){e.children.forEach((e=>{"Element"===e.type&&this.mergeTextNodes(e)}));for(let t=0;t<e.children.length-1;t++){const s=e.children[t],i=e.children[t+1];if("Text"===s.type&&"Text"===i.type){const n=s.value||"",o=i.value||"";if(o.trim())if(n.trim()){const e=!n.endsWith(" ")&&!o.startsWith(" ");s.value=n+(e?" ":"")+o}else s.value=n+o;else s.value=n+o;e.children.splice(t+1,1),t--}}}}shouldPreserveWhitespace(e,t){return e.endsWith(" ")&&t}},e.HTMLCodeGenerator=class{selfClosingTags;constructor(e=["img","input","br","hr","meta","link"]){this.selfClosingTags=e}generateHTML(e){if("Text"===e.type)return e.value||"";if("Comment"===e.type)return`\x3c!-- ${e.value||""} --\x3e`;if("Element"===e.type){const t=this.generateAttributes(e.attributes||{}),s=e.children?.map((e=>this.generateHTML(e))).join("")||"";return this.isSelfClosingTag(e.name)?`<${e.name}${t} />`:`<${e.name}${t}>${s}</${e.name}>`}return""}generateAttributes(e){return Object.entries(e).map((([e,t])=>` ${e}="${t}"`)).join("")}isSelfClosingTag(e){return this.selfClosingTags.includes(e||"")}},e.HTMLParser=class{tokenizer;options;constructor(e={throwOnError:!0}){this.tokenizer=new t(""),this.options=e}parse(e){this.tokenizer=new t(e);const s=this.tokenizer.tokenize();try{const e=this.buildAST(s);return{root:e,metadata:this.computeMetadata(e)}}catch(e){if(this.options.throwOnError)throw e;return this.options.errorHandler&&this.options.errorHandler(e),{root:{type:"Element",name:"root",children:[],attributes:{}},metadata:{nodeCount:1,elementCount:1,textCount:0,commentCount:0}}}}buildAST(e){const t={type:"Element",name:"root",children:[],attributes:{}},i=[t];let n=t;for(let t=0;t<e.length;t++){const o=e[t];try{switch(o.type){case"StartTag":{const e={type:"Element",name:o.name,attributes:o.attributes||{},children:[]};n.children.push(e),o.selfClosing||(i.push(e),n=e);break}case"EndTag":if(i.length<=1){this.handleError(new s(`Unexpected closing tag "${o.name}"`,o,t));continue}if(n.name!==o.name){this.handleError(new s(`Mismatched tags: expected "${n.name}", got "${o.name}"`,o,t));continue}i.pop(),n=i[i.length-1];break;case"Text":o.value?.trim()&&n.children.push({type:"Text",value:o.value,children:[]});break;case"Comment":n.children.push({type:"Comment",value:o.value||"",children:[]})}}catch(e){this.handleError(e)}}if(i.length>1){const t=e[e.length-1];this.handleError(new s("Unclosed tags detected",t,e.length-1))}return t}handleError(e){if(this.options.errorHandler&&this.options.errorHandler(e),this.options.throwOnError)throw e}computeMetadata(e){let t=0,s=0,i=0,n=0;const o=e=>{switch(t++,e.type){case"Element":s++,e.children?.forEach(o);break;case"Text":i++;break;case"Comment":n++}};return o(e),{nodeCount:t,elementCount:s,textCount:i,commentCount:n}}setErrorHandler(e){this.options.errorHandler=e}},e.HTMLTokenizer=t,e.HTMLValidator=class{options;voidElements=new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);flowContent=new Set(["a","abbr","address","article","aside","audio","b","bdi","bdo","blockquote","br","button","canvas","cite","code","data","datalist","del","details","dfn","div","dl","em","embed","fieldset","figure","footer","form","h1","h2","h3","h4","h5","h6","header","hr","i","iframe","img","input","ins","kbd","label","main","map","mark","math","meter","nav","noscript","object","ol","output","p","picture","pre","progress","q","ruby","s","samp","script","section","select","small","span","strong","sub","sup","svg","table","template","textarea","time","u","ul","var","video","wbr"]);metadataContent=new Set(["base","link","meta","noscript","script","style","template","title"]);defaultOptions={spec:"html5",strictMode:!1,allowCustomElements:!0,allowNamespaces:!1,customNamespaces:[]};constructor(e={}){this.options=e,this.options={...this.defaultOptions,...e}}validate(e){const t={ancestors:[],inHead:!1,inBody:!1,hasHtml:!1,hasHead:!1,hasBody:!1,hasTitle:!1,contentCategories:new Set},s=[],i=[];return this.validateNode(e,t,s,i),this.options.strictMode&&this.validateDocumentStructure(t,s),{valid:0===s.length,errors:s,warnings:i}}validateNode(e,t,s,i){if("Element"===e.type){this.validateElement(e,t,s,i),this.updateDocumentContext(e,t);const n={...t};t.ancestors.push(e.name||""),t.parentTag=e.name,e.children?.forEach((e=>{this.validateNode(e,t,s,i)})),t.ancestors.pop(),t.parentTag=n.parentTag}}validateElement(e,t,s,i){e.name?(this.validateTagName(e,t,s,i),e.attributes&&this.validateAttributes(e,t,s,i),this.validateContentModel(e,t,s,i),this.voidElements.has(e.name.toLowerCase())&&e.children?.length&&s.push({type:"error",message:`Void element <${e.name}> cannot have children`,node:e,code:"E002"})):s.push({type:"error",message:"Element must have a name",node:e,code:"E001"})}validateTagName(e,t,s,i){const n=e.name||"";if("html6-xml"===this.options.spec){if(n.match(/^([a-zA-Z_][\w.-]*:)?[a-zA-Z_][\w.-]*$/)||s.push({type:"error",message:`Invalid XML tag name: ${n}`,node:e,code:"E003"}),n.includes(":")){const[t]=n.split(":");this.options.allowNamespaces?this.options.customNamespaces&&!this.options.customNamespaces.includes(t)&&s.push({type:"error",message:`Unknown namespace: ${t}`,node:e,code:"E005"}):s.push({type:"error",message:`Namespaces are not allowed: ${t}`,node:e,code:"E004"})}}else this.options.allowCustomElements||this.isValidHTML5TagName(n)||s.push({type:"error",message:`Invalid HTML5 tag name: ${n}`,node:e,code:"E006"})}validateAttributes(e,t,s,i){const n=e.attributes||{};for(const[t,o]of Object.entries(n))"html6-xml"===this.options.spec&&(t.match(/^[a-zA-Z_][\w.-]*$/)||s.push({type:"error",message:`Invalid XML attribute name: ${t}`,node:e,code:"E007"})),"html5"===this.options.spec&&t.startsWith("on")&&!this.isValidEventHandler(t)&&i.push({type:"warning",message:`Suspicious event handler attribute: ${t}`,node:e,code:"W001"}),"string"!=typeof o&&s.push({type:"error",message:`Attribute "${t}" must have a string value`,node:e,code:"E008"})}validateContentModel(e,t,s,i){const n=e.name?.toLowerCase();if(n){switch(n){case"title":(!e.children?.length||e.children.length>1)&&s.push({type:"error",message:"<title> must have exactly one text node child",node:e,code:"E009"});break;case"head":!t.hasTitle&&this.options.strictMode&&s.push({type:"error",message:"<head> must contain a <title> element",node:e,code:"E010"})}t.parentTag&&(this.isValidChild(t.parentTag,n)||s.push({type:"error",message:`<${n}> is not allowed as a child of <${t.parentTag}>`,node:e,code:"E011"}))}}updateDocumentContext(e,t){const s=e.name?.toLowerCase();if(s)switch(s){case"html":t.hasHtml=!0;break;case"head":t.hasHead=!0,t.inHead=!0;break;case"body":t.hasBody=!0,t.inBody=!0;break;case"title":t.hasTitle=!0}}validateDocumentStructure(e,t){e.hasHtml||t.push({type:"error",message:"Document must have an <html> root element",code:"E012"}),e.hasHead||t.push({type:"error",message:"Document must have a <head> element",code:"E013"}),e.hasBody||t.push({type:"error",message:"Document must have a <body> element",code:"E014"})}isValidHTML5TagName(e){return new Set([...this.flowContent,...this.metadataContent]).has(e.toLowerCase())}isValidEventHandler(e){return new Set(["onclick","onload","onsubmit","onchange","onkeyup","onkeydown","onmouseover","onmouseout","onfocus","onblur"]).has(e.toLowerCase())}isValidChild(e,t){e=e.toLowerCase(),t=t.toLowerCase();const s={head:this.metadataContent,body:this.flowContent};return!s[e]||s[e].has(t)}}}));
//# sourceMappingURL=index.umd.js.map
