module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'], // Test files in the `tests` folder
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/dist/'], // Ignore compiled files
  rootDir: '.',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1', // Support for path aliases
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Use ts-jest for TypeScript files
  },
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json', // Specify the tsconfig
      diagnostics: true, // Enable TypeScript diagnostics
    },
  },
};
