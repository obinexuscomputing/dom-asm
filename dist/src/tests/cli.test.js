import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
describe("CLI Tests", () => {
    it("should display help", async () => {
        const { stdout } = await execAsync("dom-asm --help");
        expect(stdout).toContain("Usage:");
    });
    it("should build the project", async () => {
        const { stdout } = await execAsync("dom-asm build");
        expect(stdout).toContain("Building the DOM project...");
    });
    it("should validate a file", async () => {
        const { stdout } = await execAsync("dom-asm validate index.html");
        expect(stdout).toContain("Validating file: index.html");
    });
});
//# sourceMappingURL=cli.test.js.map