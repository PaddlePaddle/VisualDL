import {
    AppWithTranslation,
    Config,
    I18n,
    InitConfig,
    InitPromise,
    Link as LinkType,
    Router,
    Trans as TransType,
    UseTranslation,
    WithTranslationHocType
} from '../types';
import {Trans, useTranslation, withTranslation} from 'react-i18next';
import {appWithTranslation, withInternals} from './hocs';

import {Link} from './components';
import {consoleMessage} from './utils';
import {createConfig} from './config/create-config';
import createI18NextClient from './create-i18next-client';
import hoistNonReactStatics from 'hoist-non-react-statics';
import {wrapRouter} from './router';

export {withTranslation} from 'react-i18next';

export default class NextI18Next {
    readonly Trans: TransType;
    readonly Link: LinkType;
    readonly Router: Router;
    readonly i18n: I18n;
    readonly initPromise: InitPromise;
    readonly config: Config;
    readonly useTranslation: UseTranslation;
    readonly withTranslation: WithTranslationHocType;
    readonly appWithTranslation: AppWithTranslation;

    readonly consoleMessage: typeof consoleMessage;
    readonly withNamespaces: () => void;

    constructor(userConfig: InitConfig) {
        this.config = createConfig(userConfig as Config);
        this.consoleMessage = consoleMessage.bind(this);

        /* Validation */
        if (this.config.otherLanguages.length <= 0) {
            throw new Error(
                'To properly initialise a next-i18next instance you must provide one or more locale codes in config.otherLanguages.'
            );
        }
        this.withNamespaces = () => {
            throw new Error(
                'next-i18next has upgraded to react-i18next v10 - please rename withNamespaces to withTranslation.'
            );
        };

        const {i18n, initPromise} = createI18NextClient(this.config);
        this.i18n = i18n;
        this.initPromise = initPromise || Promise.resolve();

        this.appWithTranslation = appWithTranslation.bind(this);
        this.withTranslation = (namespace, options) => Component =>
            hoistNonReactStatics(withTranslation(namespace, options)(Component), Component);

        const nextI18NextInternals = {config: this.config, i18n: this.i18n};
        this.Link = withInternals(Link, nextI18NextInternals) as LinkType;
        this.Router = wrapRouter(nextI18NextInternals);

        /* Directly export `react-i18next` methods */
        this.Trans = Trans;
        this.useTranslation = useTranslation;
    }
}
