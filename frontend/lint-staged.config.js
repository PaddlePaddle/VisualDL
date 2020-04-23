const path = require('path');
const fs = require('fs');

const checkTypes = filenames =>
    [
        ...new Set(
            filenames.map(filename => path.relative(path.join(__dirname, 'packages'), filename).split(path.sep)[0])
        )
    ]
        .map(p => path.join(__dirname, 'packages', p, 'tsconfig.json'))
        .filter(p => {
            try {
                return fs.statSync(p).isFile();
            } catch (e) {
                return false;
            }
        })
        .map(p => `tsc -p ${p} --noEmit`);

module.exports = {
    // lint all files when global package.json or eslint config changes.
    './(package.json|.eslintrc.js)': () =>
        `eslint --ext .tsx,.jsx.ts,.js --ignore-path ${path.join(__dirname, '.gitignore')} ${__dirname}`,

    // check types when ts file or package.json changes.
    './packages/*/package.json': checkTypes,
    './packages/**/*.ts?(x)': checkTypes,

    // lint changed files
    '**/*.(j|t)s?(x)': filenames => `eslint ${filenames.join(' ')}`
};
