import axios from 'axios';
import qs from 'qs';
// import Notification from '../component/Notification';

// const STATUS = 'status';
// const STATUSINFO = 'msg';

const instance = axios.create({
  baseURL: '/',
  timeout: 30000,
});

// for better ux, don't send the error msg because there will be too mutch error
const responseErrorStatus = (response) => {
  const data = response.data;
  // if (data[STATUS] !== 0) {
  //     Notification.error(data[STATUSINFO]);
  //     return Promise.reject(data);
  // }
  return data;
};

// for better ux, don't send the error msg because there will be too much error
const responseNetError = (error) => {
  // Notification.error('net error');
  return Promise.reject(error);
};

// post form
const formInstance = axios.create({
  baseURL: '/',
  timeout: 3000,
  transformRequest: [(data) => qs.stringify(data)],
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json,application/vnd.ms-excel',
  },
});


formInstance.interceptors.response.use(responseErrorStatus, responseNetError);

instance.interceptors.response.use(responseErrorStatus, responseNetError);

export const makeService = (url, opt = {method: 'get'}) => (params = {}) => {
  if (opt.method === 'delete' || opt.method === 'get') {
    params = {params};
  }
  // if ('mock' && 'graph') {
  //   return
  // }
  let test_response = instance[opt.method](url, params);
  // console.log('url');
  // console.log(url);
  // console.log('params');
  // console.log(params);
  return test_response
};

export const makeFormService = (url, method = 'post') => (params = {}) => formInstance[method](url, params);
