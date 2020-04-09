declare type App = {
    name: string;
    script: string;
    cwd: string;
    args: string;
    instances: number;
    autorestart: boolean;
    watch: boolean;
    exec_mode: string;
    max_memory_restart: string;
    wait_ready: boolean;
    env: {
        [key: string]: string;
        NODE_ENV: string;
    };
};

declare const ecosystem: {
    apps: App[];
};

export default ecosystem;
