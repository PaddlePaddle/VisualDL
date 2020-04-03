import {Handler} from 'express';
import NextI18Next from './types';

declare function nextI18NextMiddleware(nexti18next: NextI18Next): Handler[];

export default nextI18NextMiddleware;
