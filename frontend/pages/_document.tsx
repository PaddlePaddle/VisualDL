import Document, {Head, Main, NextScript} from 'next/document';
import {DocumentContext, DocumentProps} from 'next/document';
import {ServerStyleSheet} from '~/utils/style';

interface VDLDocumentProps extends DocumentProps {
    languageDirection: string;
    language: string;
    styleTags: ReturnType<ServerStyleSheet['getStyleElement']>;
}

// stealed from https://github.com/isaachinman/next-i18next/issues/20#issuecomment-558799264
export default class VDLDocument extends Document<VDLDocumentProps> {
    static async getInitialProps(ctx: DocumentContext) {
        // steal from https://dev.to/aprietof/nextjs--styled-components-the-really-simple-guide----101c
        const initialProps = await Document.getInitialProps(ctx);

        // FIXME: https://github.com/i18next/i18next-express-middleware/blob/master/src/index.js#L23-L26
        const {locals} = ctx.res as any;
        const additionalProps = {
            languageDirection: locals.languageDirection as string,
            language: locals.language as string
        };

        // FIXME:
        // https://github.com/zeit/next.js/issues/7322
        // this may happen after a hmr and page reload...
        const sheet = new ServerStyleSheet();
        const page = ctx.renderPage(App => props => sheet.collectStyles(<App {...props} />));
        const styleTags = sheet.getStyleElement();

        return {...initialProps, ...additionalProps, ...page, ...styleTags};
    }

    render() {
        const {languageDirection, language, styleTags} = this.props;
        return (
            <html lang={language} dir={languageDirection}>
                <Head>
                    {styleTags}
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </html>
        );
    }
}
