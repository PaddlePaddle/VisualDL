import path from 'path';
import {promises as fs} from 'fs';
import consola from 'consola';
import yaml from 'js-yaml';
import {Module} from '@nuxt/types';

const logger = consola.withScope('nuxt:locale');

const localeModule: Module = async function localeModule(moduleOptions) {
    const options = Object.assign(
        {
            localeDir: './locales',
            localePath: 'locales',
            localesEnv: 'LOCALES',
            ext: '.yml'
        },
        this.options.locale,
        moduleOptions
    );

    const localeDir = path.resolve(this.options.srcDir || '.', options.localeDir);

    let locales: string[] = [];
    const stat = await fs.stat(localeDir);
    if (stat.isDirectory()) {
        locales = (await fs.readdir(options.localeDir))
            .filter(locale => locale.endsWith(options.ext))
            .map(locale => path.join(localeDir, locale));
        if (!locales.length) {
            logger.warn(`no locale file found in \`${options.localeDir}\`.`);
        }
    } else {
        logger.warn(`\`${options.localeDir}\` is not exist.`);
    }

    this.options.env = this.options.env || {};
    this.options.env[options.localesEnv] = locales.map(locale => path.basename(locale, options.ext)).join(',');

    logger.debug(`env \`${options.localesEnv}\` is set to \`${this.options.env[options.localesEnv]}\`.`);

    this.nuxt.hook('build:done', async () => {
        if (!this.options.dev && this.options.buildDir) {
            const outputPath = path.resolve(this.options.buildDir, 'dist', 'client', options.localePath);
            try {
                await fs.mkdir(outputPath);
            } catch {
                logger.error(`cannot create output dir \`${outputPath}\`.`);
                return;
            }
            for (const locale of locales) {
                const fileStat = await fs.stat(locale);
                if (fileStat.isFile()) {
                    const content = await fs.readFile(locale, 'utf-8');
                    try {
                        const json = yaml.safeLoad(content);
                        const outputFile = path.join(outputPath, `${path.basename(locale, options.ext)}.json`);
                        try {
                            await fs.writeFile(outputFile, JSON.stringify(json), {encoding: 'utf-8'});
                            logger.debug(`locale file write to \`${outputFile}\`.`);
                        } catch {
                            logger.error(`cannot write to file \`${outputFile}\`.`);
                        }
                    } catch {
                        logger.error(`cannot convert yaml to json from locale file \`${locale}\`.`);
                    }
                } else {
                    logger.error(`cannot read locale file \`${locale}\`.`);
                }
            }
        }
    });
};

export default localeModule;
