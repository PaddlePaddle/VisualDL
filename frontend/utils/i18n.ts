import {NextComponentType, NextPageContext} from 'next';
import NextI18Next from 'next-i18next';

const isProduction = process.env.NODE_ENV === 'production';

const nextI18Next = new NextI18Next({
    browserLanguageDetection: isProduction,
    serverLanguageDetection: isProduction,
    defaultNS: 'common',
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
