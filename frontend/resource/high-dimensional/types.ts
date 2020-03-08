export type Dimension = '2d' | '3d';
export type Reduction = 'pca' | 'tsne';

export type Point = {
    name: string;
    value: [number, number] | [number, number, number];
    showing: boolean;
};

export type DivideParams = {
    points: Point['value'][];
    keyword?: string;
    labels: string[];
    visibility?: boolean;
};
