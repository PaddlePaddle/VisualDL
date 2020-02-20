import Document, {Head, Main, NextScript, DocumentContext, DocumentProps} from 'next/document';
import {ServerStyleSheet} from '~/utils/style';

interface VDLDocumentProps extends DocumentProps {
    languageDirection: string;
    language: string;
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

            // stealed from https://github.com/isaachinman/next-i18next/issues/20#issuecomment-558799264
            // FIXME: https://github.com/i18next/i18next-express-middleware/blob/master/src/index.js#L23-L26
            const {locals} = ctx.res as any;
            const additionalProps = {
                languageDirection: locals.languageDirection as string,
                language: locals.language as string
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
        const {languageDirection, language} = this.props;
        return (
            <html lang={language} dir={languageDirection}>
                <Head>
                    <link rel="shortcut icon" href="/favicon.ico" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        );
    }
}
