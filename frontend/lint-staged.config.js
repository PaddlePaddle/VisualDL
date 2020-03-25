module.exports = {
    '**/*.ts?(x)': () => ['tsc -p tsconfig.json --noEmit', 'tsc -p server/tsconfig.json --noEmit'],
    '**/*.(j|t)s?(x)': filenames => `eslint ${filenames.join(' ')}`
};
