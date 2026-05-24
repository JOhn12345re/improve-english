const path = require('path');

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
        diagnostics: false, // skip type-check in tests for speed
      },
    ],
  },
  collectCoverageFrom: ['**/*.(t|j)s', '!**/*.spec.(t|j)s', '!**/index.ts'],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: { lines: 90, functions: 90 },
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@englishflow/shared-types$': path.resolve(
      __dirname,
      '../../packages/shared-types/src/index.ts',
    ),
  },
};
