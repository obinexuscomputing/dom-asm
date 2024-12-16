module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: './tsconfig.json',
      isolatedModules: true
    }]
  },
  testMatch: ['**/tests/**/*.test.ts'], // Match test files in "tests" directory
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Alias for `src` directory
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Optional setup file
};
