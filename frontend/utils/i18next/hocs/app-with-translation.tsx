/* eslint-disable @typescript-eslint/no-explicit-any */

import {I18nextProvider, withSSR} from 'react-i18next';
import {isServer, lngFromReq, lngPathCorrector, lngsToLoad} from '../utils';

import {AppContext} from 'next/app';
import {I18n} from '../types';
import NextI18Next from '../index';
import {NextPageContext} from 'next';
import {NextStaticProvider} from '../components';
import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import {withRouter} from 'next/router';

interface Props {
    initialLanguage: string;
    initialI18nStore: any;
    i18nServerInstance: any;
}

interface WrappedComponentProps {
    pageProps: {
        namespacesRequired?: string[];
    };
}

type I18nReq = {
    i18n?: I18n;
    locale?: string;
    lng?: string;
    language?: string;
};

type I18nRes = {
    locals?: {
        language?: string;
        languageDir?: string;
    };
};

export const appWithTranslation = function(this: NextI18Next, WrappedComponent: any) {
    const WrappedComponentWithSSR = withSSR()(WrappedComponent);
    const {config, i18n} = this;
    const consoleMessage = this.consoleMessage.bind(this);

    const clientLoadNamespaces = (lng: string, namespaces: string[]) =>
        Promise.all(namespaces.filter(ns => !i18n.hasResourceBundle(lng, ns)).map(ns => i18n.reloadResources(lng, ns)));

    class AppWithTranslation extends React.Component<Props> {
        constructor(props: any) {
            super(props);
            if (!isServer()) {
                const changeLanguageCallback = (prevLng: string, newLng: string) => {
                    const {router} = props;
                    const {pathname, asPath, query} = router;
                    const routeInfo = {pathname, query};

                    if ((i18n as any).initializedLanguageOnce && typeof newLng === 'string' && prevLng !== newLng) {
                        const {as, href} = lngPathCorrector(config, {as: asPath, href: routeInfo}, newLng);
                        router.replace(href, as, {shallow: config.shallowRender});
                    }
                };

                const changeLanguage = i18n.changeLanguage.bind(i18n);
                i18n.changeLanguage = async (newLng: string, callback = () => null) => {
                    const prevLng = i18n.language;
                    if (typeof newLng === 'string' && (i18n as any).initializedLanguageOnce === true) {
                        const usedNamespaces = Object.entries((i18n.reportNamespaces as any).usedNamespaces)
                            .filter(x => x[1] === true)
                            .map(x => x[0]);
                        await clientLoadNamespaces(newLng, usedNamespaces);
                    }
                    return changeLanguage(newLng, () => {
                        changeLanguageCallback(prevLng, newLng);
                        callback(null, i18n.t);
                    });
                };
            }
        }

        static async getInitialProps(ctx: AppContext) {
            let wrappedComponentProps: WrappedComponentProps = {pageProps: {}};
            if (WrappedComponent.getInitialProps) {
                wrappedComponentProps = await WrappedComponent.getInitialProps(ctx);
            }
            if (typeof wrappedComponentProps.pageProps === 'undefined') {
                consoleMessage(
                    'error',
                    'If you have a getInitialProps method in your custom _app.js file, you must explicitly return pageProps. For more information, see: https://github.com/zeit/next.js#custom-app'
                );
            }

            /*
                Initiate vars to return
            */
            const req = ctx.ctx.req as (NextPageContext['req'] & I18nReq) | undefined;
            let initialI18nStore: Record<string, any> = {};
            let initialLanguage = null;
            let i18nServerInstance = null;

            if (req && !req.i18n) {
                const {router} = ctx;
                const result = router.asPath.match(/^\/(.*?)\//);
                const lng = result ? result[1] : process.env.DEFAULT_LANGUAGE;
                req.i18n = i18n.cloneInstance({initImmediate: false, lng});
                const res = ctx.ctx.res as (NextPageContext['res'] & I18nRes) | undefined;
                const setContextLocale = (lng?: string) => {
                    // SEE: i18n-express-middleware
                    req.language = req.locale = req.lng = lng;
                    if (res) {
                        res.locals = res.locals || {};
                        res.locals.language = lng;
                        res.locals.languageDir = i18n.dir(lng);
                    }
                };
                setContextLocale(lng);
                i18n.on('languageChanged', setContextLocale);
            }

            /*
                Step 1: Determine initial language
            */
            if (req && req.i18n) {
                initialLanguage = lngFromReq(req as any);

                /*
                    Perform a lang change in case we're not on the right lang
                */
                await req.i18n.changeLanguage(initialLanguage as string);
            } else if (Array.isArray(i18n.languages) && i18n.languages.length > 0) {
                initialLanguage = i18n.language;
            }

            /*
                Step 2: Determine namespace dependencies
            */
            let namespacesRequired = config.ns;
            if (Array.isArray(wrappedComponentProps.pageProps.namespacesRequired)) {
                ({namespacesRequired} = wrappedComponentProps.pageProps);
            } else {
                consoleMessage(
                    'warn',
                    `You have not declared a namespacesRequired array on your page-level component: ${ctx.Component
                        .displayName ||
                        ctx.Component.name ||
                        'Component'}. This will cause all namespaces to be sent down to the client, possibly negatively impacting the performance of your app. For more info, see: https://github.com/isaachinman/next-i18next#4-declaring-namespace-dependencies`
                );
            }

            /*
                We must always send down the defaultNS, otherwise
                the client will trigger a request for it and issue
                the "Did not expect server HTML to contain a <h1> in <div>"
                error
            */
            if (typeof config.defaultNS === 'string' && !(namespacesRequired as string[]).includes(config.defaultNS)) {
                (namespacesRequired as string[]).push(config.defaultNS);
            }

            /*
                Step 3: Perform data fetching, depending on environment
            */
            if (req && req.i18n) {
                /*
                    Detect the languages to load based upon the fallbackLng configuration
                */
                const {fallbackLng} = config;
                const languagesToLoad = lngsToLoad(initialLanguage, fallbackLng, config.otherLanguages);

                /*
                    Initialize the store with the languagesToLoad and
                    necessary namespaces needed to render this specific tree
                */
                languagesToLoad.forEach(lng => {
                    initialI18nStore[lng as string] = {};
                    (namespacesRequired as string[]).forEach(ns => {
                        initialI18nStore[lng as string][ns] =
                            ((req.i18n as I18n).services.resourceStore.data[lng as string] || {})[ns] || {};
                    });
                });
            } else if (Array.isArray(i18n.languages) && i18n.languages.length > 0) {
                /*
                    Load newly-required translations if changing route client side
                */
                await clientLoadNamespaces(i18n.languages[0], namespacesRequired as string[]);

                initialI18nStore = (i18n as any).store.data;
            }

            /*
                Step 4: Overwrite i18n.toJSON method to be able to serialize the instance
            */
            if (req && req.i18n) {
                (req.i18n as any).toJSON = () => null;
                i18nServerInstance = req.i18n;
            }

            /*
                `pageProps` will get serialized automatically by NextJs
            */
            return {
                initialI18nStore,
                initialLanguage,
                i18nServerInstance,
                ...wrappedComponentProps
            };
        }

        render() {
            const {initialLanguage, initialI18nStore, i18nServerInstance} = this.props;

            return (
                <I18nextProvider i18n={i18nServerInstance || i18n}>
                    <NextStaticProvider>
                        <WrappedComponentWithSSR
                            initialLanguage={initialLanguage}
                            initialI18nStore={initialI18nStore}
                            {...this.props}
                        />
                    </NextStaticProvider>
                </I18nextProvider>
            );
        }
    }

    return hoistNonReactStatics(withRouter(AppWithTranslation as any), WrappedComponent, {getInitialProps: true});
};
