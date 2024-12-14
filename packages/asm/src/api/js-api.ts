import * as JS from "@obinexuscomputing/js";

export function parseJS(jsString: string) {
  if (!JS.parser) {
    throw new Error("JS parser is not implemented yet.");
  }
  return JS.parser.parse(jsString);
}
