/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This file is used to generate environment variables which used by the app

// PUBLIC_PATH is for assets, can be set to a CDN address
process.env.SNOWPACK_PUBLIC_PATH = process.env.CDN_VERSION
    ? `https://visualdl-static.cdn.bcebos.com/assets/${process.env.CDN_VERSION}`
    : process.env.PUBLIC_PATH === '/' || !process.env.PUBLIC_PATH
    ? ''
    : process.env.PUBLIC_PATH;

// BASE_URI is for env and router, must be local address which starts with a `/` or empty string
// if it is not set and PUBLIC_PATH is not a CDN address, it will be set to the same value of PUBLIC_PATH
process.env.SNOWPACK_PUBLIC_BASE_URI =
    process.env.SNOWPACK_PUBLIC_PATH.startsWith('/') || process.env.PUBLIC_PATH === ''
        ? process.env.SNOWPACK_PUBLIC_PATH
        : process.env.BASE_URI === '/' || !process.env.BASE_URI
        ? ''
        : process.env.BASE_URI;

// API_URL is for api requests
// it will be set to `${BASE_URI}/api` by default
// if it is set to a absolute address refer to another hostname, CORS headers must be set
process.env.SNOWPACK_PUBLIC_API_URL = process.env.API_URL || `${process.env.SNOWPACK_PUBLIC_BASE_URI}/api`;

// TELEMETRY_ID is for Baidu Tongji
// set to an empty string will disable telemetry
process.env.SNOWPACK_PUBLIC_TELEMETRY_ID = process.env.TELEMETRY_ID || '';

// API_TOKEN_KEY is for vdl-service
// if it is set, api requests will add an additional header `X-VisualDL-Instance-ID` from the token key in query string
process.env.SNOWPACK_PUBLIC_API_TOKEN_KEY = process.env.API_TOKEN_KEY || '';

// supported languages
process.env.SNOWPACK_PUBLIC_LANGUAGES = process.env.LANGUAGES || 'en,zh';
// default language
process.env.SNOWPACK_PUBLIC_DEFAULT_LANGUAGE = process.env.DEFAULT_LANGUAGE || 'en';
// theme
process.env.SNOWPACK_PUBLIC_THEME = process.env.THEME || '';
