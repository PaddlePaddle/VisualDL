import {NextComponentType, NextPageContext} from 'next';

import NextI18Next from '@visualdl/i18n';
import {env} from '../next.config';
import moment from 'moment';

const defaultLanguage = env.DEFAULT_LANGUAGE;
const allLanguages = env.LANGUAGES;
const otherLanguages = allLanguages.filter(lang => lang !== defaultLanguage);

const isDev = process.env.NODE_ENV === 'development';

allLanguages.forEach(async (lang: string) => {
    moment.updateLocale(lang, await import(`../public/locales/${lang}/moment.json`));
});

const nextI18Next = new NextI18Next({
    publicPath: env.PUBLIC_PATH,
    localePath: env.LOCALE_PATH,
    browserLanguageDetection: !isDev,
    serverLanguageDetection: !isDev,
    cleanCode: true,
    defaultLanguage,
    otherLanguages,
    localeSubpaths: otherLanguages.reduce((prev, curr) => {
        prev[curr] = curr;
        return prev;
    }, {} as Record<string, string>)
});

export default nextI18Next;

export const {i18n, config, appWithTranslation, withTranslation, useTranslation, Router, Link, Trans} = nextI18Next;

// from ~/node_modules/next/types/index.d.ts
// https://gitlab.com/kachkaev/website-frontend/-/blob/master/src/i18n.ts#L64-68
// eslint-disable-next-line @typescript-eslint/ban-types
export type NextI18NextPage<P = {}, IP = P> = NextComponentType<
    NextPageContext,
    IP & {namespacesRequired: string[]},
    P & {namespacesRequired: string[]}
>;
