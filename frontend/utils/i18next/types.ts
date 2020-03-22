/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from 'react';

import {TFunction as I18NextTFunction, InitOptions, i18n} from 'i18next';
import {
    WithTranslation as ReactI18nextWithTranslation,
    TransProps,
    useTranslation,
    withTranslation
} from 'react-i18next';

import {LinkProps} from 'next/link';
import {SingletonRouter} from 'next/router';

export type InitConfig = {
    browserLanguageDetection?: boolean;
    serverLanguageDetection?: boolean;
    strictMode?: boolean;
    defaultLanguage: string;
    ignoreRoutes?: string[];
    localePath?: string;
    localeStructure?: string;
    otherLanguages: string[];
    localeSubpaths?: Record<string, string>;
    use?: any[];
    customDetectors?: any[];
    shallowRender?: boolean;
    errorStackTraceLimit?: number;
} & InitOptions;

export type Config = {
    fallbackLng: boolean;
    allLanguages: string[];
    whitelist: string[];
    preload: string[];
} & InitConfig;

export interface NextI18NextInternals {
    config: Config;
    i18n: I18n;
}

export type Trans = (props: TransProps) => any;
export type Link = React.ComponentClass<LinkProps>;
export type Router = SingletonRouter;
export type UseTranslation = typeof useTranslation;
export type AppWithTranslation = <P extends object>(Component: React.ComponentType<P> | React.ElementType<P>) => any;
export type TFunction = I18NextTFunction;
export type I18n = i18n;
export type WithTranslationHocType = typeof withTranslation;
export type WithTranslation = ReactI18nextWithTranslation;
export type InitPromise = Promise<TFunction | void>;

declare class NextI18Next {
    constructor(config: InitConfig);
    Trans: Trans;
    Link: Link;
    Router: Router;
    i18n: I18n;
    initPromise: InitPromise;
    config: Config;
    useTranslation: UseTranslation;
    withTranslation: WithTranslationHocType;
    appWithTranslation: AppWithTranslation;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            lng?: string;
        }
    }
}

export default NextI18Next;
