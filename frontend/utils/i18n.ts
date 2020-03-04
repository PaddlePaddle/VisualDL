import {NextComponentType, NextPageContext} from 'next';
import NextI18Next from 'next-i18next';

const isDev = process.env.NODE_ENV === 'development';

const nextI18Next = new NextI18Next({
    localePath: 'public/locales',
    browserLanguageDetection: !isDev,
    serverLanguageDetection: !isDev,
    defaultLanguage: 'en',
    otherLanguages: ['zh'],
    localeSubpaths: {
        zh: 'zh'
    }
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
