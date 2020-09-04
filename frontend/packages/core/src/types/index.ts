export interface TagsData {
    runs: string[];
    tags: string[][];
}

export interface Run {
    label: string;
    colors: [string, string];
}

export interface Tag<R extends Run = Run> {
    runs: R[];
    label: string;
}

export interface TagWithSingleRun {
    label: string;
    run: Run;
}

export enum TimeMode {
    Step = 'step',
    Relative = 'relative',
    WallTime = 'wall'
}
