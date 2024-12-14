module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1', // Support path aliases for src
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Transform TypeScript files
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.ts', // Match test files in the `tests` folder
  ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json', // Use the project's tsconfig
    },
  },
};
