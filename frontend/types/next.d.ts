import next, {NextPageContext} from 'next';
import i18NextExpressMiddleware from 'i18next-express-middleware';

declare module 'next' {
    // FIXME: ~/node_modules/i18next-express-middleware/index.d.ts
    interface NextI18NextPageContext extends NextPageContext {
        req?: Express.Request;
        res?: Express.Response;
    }
}
