module.exports = {
    '**/*.ts?(x)': filenames => [
        'tsc -p tsconfig.json --noEmit',
        'tsc -p server/tsconfig.json --noEmit',
        `eslint ${filenames.join(' ')}`
    ],
    '**/*.js?(x)': filenames => `eslint ${filenames.join(' ')}`
};
