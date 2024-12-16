export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
      '^@obinexuscomputing/(.*)$': '<rootDir>/packages/$1/src',
    },
  };
  