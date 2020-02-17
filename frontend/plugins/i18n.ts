import {Plugin} from '@nuxt/types';
import updateLocale from '~/utils/updateLocale';

const i18nPlugin: Plugin = ({route}): void => updateLocale(route.meta[0]?.locale || process.env.DEFAULT_LANG);

export default i18nPlugin;
