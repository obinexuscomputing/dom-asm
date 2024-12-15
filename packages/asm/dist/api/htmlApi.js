import * as fs from "fs";
export function parseFile(file) {
    const content = fs.readFileSync(file, "utf-8");
    // Replace with your actual HTML parsing logic
    return { content, parsed: "HTML Parsed Result" };
}
//# sourceMappingURL=htmlApi.js.map