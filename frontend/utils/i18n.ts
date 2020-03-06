import {NextComponentType, NextPageContext} from 'next';
import moment from 'moment';
import NextI18Next from './i18next';
import {env} from '../next.config';

const defaultLanguage = env.DEFAULT_LANGUAGE;
const allLanguages = env.LANGUAGES;
const otherLanguages = allLanguages.filter(lang => lang !== defaultLanguage);

const isDev = process.env.NODE_ENV === 'development';

allLanguages.forEach(async (lang: string) => {
    moment.updateLocale(lang, await import(`../public/locales/${lang}/moment.json`));
});

const nextI18Next = new NextI18Next({
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

// from ~/node_modules/next/types/index.d.ts
// https://gitlab.com/kachkaev/website-frontend/-/blob/master/src/i18n.ts#L64-68
export type NextI18NextPage<P = {}, IP = P> = NextComponentType<
    NextPageContext,
    IP & {namespacesRequired: string[]},
    P & {namespacesRequired: string[]}
>;

export default nextI18Next;

export const {i18n, appWithTranslation, withTranslation, useTranslation, Router, Link, Trans} = nextI18Next;
