import {FallbackLng} from 'i18next';

export const lngsToLoad = (initialLng: string | null, fallbackLng: FallbackLng | false, otherLanguages?: string[]) => {
    const languages = [];

    if (initialLng) {
        languages.push(initialLng);
    }

    if (fallbackLng) {
        if (typeof fallbackLng === 'string' && fallbackLng !== initialLng) {
            languages.push(fallbackLng);
        }

        if (Array.isArray(fallbackLng)) {
            languages.push(...fallbackLng);
        } else if (initialLng && typeof fallbackLng !== 'string') {
            if (typeof fallbackLng[initialLng] === 'string') {
                languages.push(fallbackLng[initialLng]);
            } else if (Array.isArray(fallbackLng[initialLng])) {
                languages.push(...fallbackLng[initialLng]);
            }
        }

        if (!Array.isArray(fallbackLng) && typeof fallbackLng !== 'string' && fallbackLng.default) {
            languages.push(fallbackLng.default);
        }
    }

    if (initialLng && initialLng.includes('-') && Array.isArray(otherLanguages)) {
        const [languageFromLocale] = initialLng.split('-');
        otherLanguages.forEach(otherLanguage => {
            if (otherLanguage === languageFromLocale) {
                languages.push(otherLanguage);
            }
        });
    }

    return languages;
};
