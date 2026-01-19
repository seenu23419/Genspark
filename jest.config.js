export default {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleFileExtensions: ['js', 'json', 'node'],
  collectCoverageFrom: [
    'server.ts',
    'services/**/*.ts',
    'components/**/*.tsx',
    'screens/**/*.tsx',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/']
};
