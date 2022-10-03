export default {
  cache: true,
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  maxWorkers: 1,
  preset: 'ts-jest',
  resolver: 'ts-jest-resolver',
  slowTestThreshold: 1,
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
