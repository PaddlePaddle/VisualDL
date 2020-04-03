export type NodeUID = string;
export enum NodeType {
    Input,
    Output,
    Op
}

export type InputNode = {
    data_type: string;
    name: string;
    shape: string[];
};

export type OutputNode = {
    data_type: string;
    name: string;
    shape: string[];
};

export type OpNode = {
    input: NodeUID[];
    output: NodeUID[];
    opType: string;
};

export type Node = InputNode | OutputNode | OpNode;
export type TypedNode =
    | (InputNode & {type: NodeType.Input})
    | (OutputNode & {type: NodeType.Output})
    | (OpNode & {type: NodeType.Op});

export type Edge = {
    source: string;
    target: string;
    label: string;
};

export interface Graph {
    input: InputNode[];
    output: OutputNode[];
    name: string;
    node: OpNode[];
    edges: Edge[];
}
