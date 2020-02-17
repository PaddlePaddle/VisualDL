import axios from 'axios';

export default (locale: string): void => {
    axios.defaults.headers.common['Accept-Language'] = locale;
};
