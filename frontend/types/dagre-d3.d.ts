// dagre-d.ts
// Copied from existing type definition @types/dagre-d3, with some modification
declare module 'dagre-d3' {
    import {Selection, BaseType} from 'd3';
    import * as dagre from 'dagre';
    export const graphlib = dagre.graphlib;

    export const render: {new (): Render};
    export const intersect: {
        [shapeName: string]: (node: dagre.Node, points: Array<{}>, point: any) => void;
    };
    export interface Render {
        arrows(): {
            [arrowStyleName: string]: (
                parent: Selection<BaseType, any, BaseType, any>,
                id: string,
                edge: dagre.Edge,
                type: string
            ) => void;
        };
        (selection: Selection<BaseType, any, BaseType, any>, g: dagre.graphlib.Graph): void;
        shapes(): {
            [shapeStyleName: string]: (
                parent: Selection<BaseType, any, BaseType, any>,
                bbox: any,
                node: dagre.Node
            ) => void;
        };
    }
}
