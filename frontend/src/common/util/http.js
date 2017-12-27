import axios from 'axios';
import qs from 'qs';
import Notification from '../component/Notification';

const STATUS = 'status';
const STATUSINFO = 'msg';

const instance = axios.create({
    baseURL: '/',
    timeout: 30000
});

const responseErrorStatus = response => {
    const data = response.data;
    if (data[STATUS] !== 0) {
        Notification.error(data[STATUSINFO]);
        return Promise.reject(data);
    }
    return data;
};

const responseNetError = error => {
    Notification.error('net error');
    return Promise.reject(error);
};

// post from
const formInstance = axios.create({
    baseURL: '/',
    timeout: 3000,
    transformRequest: [data => qs.stringify(data)],
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json,application/vnd.ms-excel'
    }
});

formInstance.interceptors.response.use(responseErrorStatus, responseNetError);

instance.interceptors.response.use(responseErrorStatus, responseNetError);

export const makeService = (url, opt = {method: 'get'}) => (params = {}) => {
    if (opt.method === 'delete' || opt.method === 'get') {
        params = {params};
    }
    return instance[opt.method](url, params);
};

export const makeFormService = (url, method = 'post') => (params = {}) => formInstance[method](url, params);
