declare type NextEnv = {
    API_URL: string;
    DEFAULT_LANGUAGE: string;
    LANGUAGES: string[];
    LOCALE_PATH: string;
};

declare interface NextConfig {
    env: NextEnv;
}

const nextConfig: NextConfig;

export default nextConfig;

export const env: NextEnv;
