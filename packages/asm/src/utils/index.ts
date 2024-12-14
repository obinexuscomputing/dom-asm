export function notImplemented(moduleName: string, featureName: string): never {
    throw new Error(`The feature "${featureName}" in the module "${moduleName}" is not yet implemented.`);
  }
  