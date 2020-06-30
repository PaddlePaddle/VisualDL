module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    coveragePathIgnorePatterns: ['<rootDir>/next.config.js', '<rootDir>/node_modules/'],
    testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/out/', '<rootDir>/node_modules/'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '\\.css$': '<rootDir>/__mocks__/styleMock.js',
        '~/(.*)': '<rootDir>/$1'
    },
    snapshotSerializers: ['enzyme-to-json/serializer'],
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/tsconfig.test.json'
        }
    }
};
