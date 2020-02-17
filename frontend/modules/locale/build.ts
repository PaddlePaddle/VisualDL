import path from 'path';
import {promises as fs} from 'fs';
import yaml from 'js-yaml';
import {ModuleThis} from '@nuxt/types';
import {ModuleOptions} from './index';
import logger from './logger';

export default function buildLocales(this: ModuleThis, options: Required<ModuleOptions>, locales: string[]): void {
    if (!this.options.dev) {
        this.nuxt.hook('build:done', async () => {
            const outputPath = path.resolve(
                this.options.buildDir || '../../.nuxt',
                'dist',
                'client',
                options.localePath
            );
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
        });
    }
}
