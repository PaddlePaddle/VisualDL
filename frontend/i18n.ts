import NextI18Next from 'next-i18next';

export default new NextI18Next({
    defaultLanguage: 'en',
    otherLanguages: ['zh'],
    localeSubpaths: {
        zh: 'zh'
    }
});
