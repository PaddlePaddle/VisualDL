import Document, {Head, Main, NextScript, DocumentContext} from 'next/document';
import {ServerStyleSheet} from '~/utils/style';

export default class VDLDocument extends Document {
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

            return {
                ...initialProps,
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
        return (
            <html>
                <Head />
                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        );
    }
}
