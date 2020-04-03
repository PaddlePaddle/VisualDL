import Document, {DocumentContext, DocumentProps, Head, Html, Main, NextScript} from 'next/document';

import {ServerStyleSheet} from '~/utils/style';

interface VDLDocumentProps extends DocumentProps {
    language: string;
    languageDir: string;
}

export default class VDLDocument extends Document<VDLDocumentProps> {
    static async getInitialProps(ctx: DocumentContext) {
        // https://github.com/zeit/next.js/blob/canary/examples/with-typescript-styled-components/pages/_document.tsx
        const sheet = new ServerStyleSheet();
        const originalRenderPage = ctx.renderPage;

        try {
            ctx.renderPage = () =>
                originalRenderPage({
                    enhanceApp: App => props => sheet.collectStyles(<App {...props} />)
                });

            const initialProps = await Document.getInitialProps(ctx);
            // steal from https://github.com/isaachinman/next-i18next/issues/20#issuecomment-558799264
            // FIXME: https://github.com/i18next/i18next-express-middleware/blob/master/src/index.js#L23-L26
            const additionalProps = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...((ctx.res as any)?.locals || {})
            };

            return {
                ...initialProps,
                ...additionalProps,
                styles: (
                    <>
                        {initialProps.styles}
                        {sheet.getStyleElement()}
                    </>
                )
            };
        } finally {
            sheet.seal();
        }
    }

    render() {
        const {language, languageDir} = this.props;
        return (
            <Html lang={language} dir={languageDir}>
                <Head />
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
