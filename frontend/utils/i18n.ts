import React from 'react';
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

export default nextI18Next;

export const {i18n, appWithTranslation, withTranslation, Router, Link, Trans} = nextI18Next;
