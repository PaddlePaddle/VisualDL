import type {Point} from './types';

export type {Dimension, Reduction, Point} from './types';

const dividePoints = (points: Point[], keyword?: string) => {
    if (!keyword) {
        return [[], points];
    }

    const matched: Point[] = [];
    const missing: Point[] = [];
    points.forEach(point => {
        if (point.name.includes(keyword)) {
            matched.push(point);
            return;
        }
        missing.push(point);
    });

    return [matched, missing];
};

const combineLabel = (points: Point['value'][], labels: string[], visibility?: boolean) =>
    points.map((value, i) => {
        const name = labels[i] || '';
        return {
            name,
            showing: !!visibility,
            value
        };
    });

export const divide = ({
    points,
    keyword,
    labels,
    visibility
}: {
    points: Point['value'][];
    keyword?: string;
    labels: string[];
    visibility?: boolean;
}) => dividePoints(combineLabel(points, labels, visibility), keyword);
