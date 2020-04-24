export interface Run {
    label: string;
    colors: [string, string];
}

export interface Tag {
    runs: Run[];
    label: string;
}
