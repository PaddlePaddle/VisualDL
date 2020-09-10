process.env.SNOWPACK_PUBLIC_PATH =
    process.env.PUBLIC_PATH === '/' || !process.env.PUBLIC_PATH ? '' : process.env.PUBLIC_PATH;
process.env.SNOWPACK_PUBLIC_API_URL = process.env.API_URL || `${process.env.SNOWPACK_PUBLIC_PATH}/api`;
process.env.SNOWPACK_PUBLIC_TELEMETRY_ID = process.env.TELEMETRY_ID || '';
process.env.SNOWPACK_PUBLIC_API_TOKEN_KEY = process.env.API_TOKEN_KEY || '';
process.env.SNOWPACK_PUBLIC_LANGUAGES = process.env.LANGUAGES || 'en,zh';
process.env.SNOWPACK_PUBLIC_DEFAULT_LANGUAGE = process.env.DEFAULT_LANGUAGE || 'en';
process.env.SNOWPACK_PUBLIC_THEME = process.env.THEME || '';
