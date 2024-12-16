module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Explicitly set the path for transforming files
  transformIgnorePatterns: [
    '/node_modules/',
    'dist/'
  ],
  // Ensure ts-jest can find your tsconfig
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
    "transform": {
  "^.+\\.tsx?$": ["ts-jest", { "isolatedModules": true }]
}

  }
};