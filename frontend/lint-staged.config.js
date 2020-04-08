const path = require('path');

module.exports = {
    '**/*.ts?(x)': async filenames =>
        [
            ...new Set(
                filenames.map(
                    filename => path.relative(path.join(process.cwd(), 'packages'), filename).split(path.sep)[0]
                )
            )
        ].map(p => `tsc -p ${path.join(process.cwd(), 'packages', p, 'tsconfig.json')} --noEmit`),
    '**/*.(j|t)s?(x)': filenames => `eslint ${filenames.join(' ')}`
};
