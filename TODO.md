# DOM-ASM TODO

## Milestones

### **Version 1.1.0**
#### Enhancements:
- **Parser Fixes**:
  - [ ] Fix `HTMLParser` to handle unclosed tags gracefully.
  - [ ] Improve `HTMLTokenizer` for better handling of malformed `<!DOCTYPE>` declarations.
  - [ ] Add support for nested `<style>` and `<script>` blocks in HTML parsing.
  - [ ] Enhance `JSTokenizer` to handle:
    - [ ] Multi-character operators (e.g., `===`, `!==`, `&&`, `||`).
    - [ ] ES6+ syntax (e.g., arrow functions, template literals).
  - [ ] Validate CSS for standard properties and values.

#### Features:
- [ ] Implement **`dom-xml`** module:
  - [ ] XML Tokenizer:
    - [ ] Support for namespaces (e.g., `<ns:tag>`).
    - [ ] Handle self-closing tags (e.g., `<tag />`).
  - [ ] XML Parser:
    - [ ] Build an AST with hierarchical structure.
    - [ ] Support attributes and CDATA sections.
  - [ ] XML Validator:
    - [ ] Validate well-formed XML.
    - [ ] Check for undefined namespaces and attributes.

- [ ] Implement **`dom-json`** module:
  - [ ] JSON Tokenizer:
    - [ ] Parse nested objects and arrays.
    - [ ] Handle special characters in strings.
  - [ ] JSON Parser:
    - [ ] Convert JSON into an abstract syntax tree (AST).
    - [ ] Support partial JSON for streaming.
  - [ ] JSON Validator:
    - [ ] Check for duplicate keys in objects.
    - [ ] Validate against a schema (if provided).

---

### **Version 1.2.0**
#### Enhancements:
- [ ] Add **optimization** capabilities for `dom-xml`:
  - [ ] Remove redundant whitespace.
  - [ ] Normalize attribute ordering.
- [ ] Add **optimization** capabilities for `dom-json`:
  - [ ] Remove unnecessary whitespace and comments.
  - [ ] Minify JSON output for size reduction.

#### Features:
- [ ] CLI Support:
  - [ ] Add `dom-xml` CLI commands:
    - [ ] Parse XML files.
    - [ ] Validate and optimize XML files.
  - [ ] Add `dom-json` CLI commands:
    - [ ] Parse JSON files.
    - [ ] Validate and optimize JSON files.

---

### **Version 2.0.0**
#### Enhancements:
- [ ] Introduce **streaming parsers** for large files:
  - [ ] Handle files incrementally for `dom-xml` and `dom-json`.
  - [ ] Support memory-efficient parsing of HTML, CSS, and JavaScript.
- [ ] Add support for custom error handling in all parsers.

#### Features:
- [ ] Implement pluggable architecture for extending parsers:
  - [ ] Add hooks for custom validation rules.
  - [ ] Allow user-defined token handlers.

---

## Immediate Next Steps (Short-Term Tasks)

1. **Bug Fixes**:
   - [ ] Fix `HTMLTokenizer` issue with `<!DOCTYPE>` misidentification.
   - [ ] Ensure `JSTokenizer` processes single-character operators correctly.

2. **Documentation**:
   - [ ] Update CLI usage examples to include future `dom-xml` and `dom-json` commands.

3. **Testing**:
   - [ ] Add comprehensive test cases for HTML parsing:
     - [ ] Malformed tags.
     - [ ] Nested `style` and `script` blocks.
   - [ ] Add JSON test cases for:
     - [ ] Deeply nested objects and arrays.
     - [ ] Large files exceeding memory limits.

4. **Refactoring**:
   - [ ] Modularize shared tokenizer logic for reusability in `dom-xml` and `dom-json`.

---

## Milestone Tracking

| Version | Feature/Enhancement             | Status  |
|---------|---------------------------------|---------|
| 1.1.0   | Parser fixes and `dom-xml`/`dom-json` modules | Pending |
| 1.2.0   | Optimization for XML and JSON   | Pending |
| 2.0.0   | Streaming parsers and pluggable architecture | Planned |
