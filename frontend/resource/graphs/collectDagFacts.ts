import {Graph, InputNode, Node, NodeType, NodeUID} from './types';

interface DagNode {
    key: string;
    type: NodeType;
    label: string;
    shape: string;
    class: string;
}
type DagEdge = [string, string];

interface NodeRelation {
    input: NodeUID[];
    output: NodeUID[];
}
interface NodeRelationMapping {
    [nodeUID: string]: NodeRelation;
}

type WithUID<T> = T & {uid: NodeUID};
type WithUIDMap<T> = T extends (infer U)[] ? WithUID<U>[] : WithUID<T>;

type NodeFinder = (type: NodeType, uid: NodeUID) => undefined | Node;
const OP_NODE_PREFIX = 'opNode_';

/* misc */
const genNodeUID = (type: NodeType, id: number | string) => {
    switch (type) {
        case NodeType.Op:
            return `${OP_NODE_PREFIX}${id}`;
        case NodeType.Input:
        case NodeType.Output:
            return `${id}`;
    }
};
const assignNodeUID = <T extends Node>(type: NodeType, node: T[]): WithUID<T>[] => {
    const process = (node: T, i: number) => {
        const uid = genNodeUID(type, i);

        return {...node, uid};
    };
    return node.map(process);
};

const createNodeFinder = (graph?: Graph) => {
    if (!graph) {
        return () => undefined;
    }

    const reverseInputIdx = graph.input.reduce<{[k: string]: number}>((memo, input, i) => {
        memo[genNodeUID(NodeType.Input, input.name)] = i;
        return memo;
    }, {});
    const reverseOutputIdx = graph.output.reduce<{[k: string]: number}>((memo, input, i) => {
        memo[genNodeUID(NodeType.Output, input.name)] = i;
        return memo;
    }, {});

    return (type: NodeType, nodeUID: NodeUID) => {
        switch (type) {
            case NodeType.Input: {
                const idx = reverseInputIdx[nodeUID];
                return idx == undefined ? undefined : graph.input[idx];
            }
            case NodeType.Output: {
                const idx = reverseOutputIdx[nodeUID];
                return idx == undefined ? undefined : graph.output[idx];
            }
            case NodeType.Op: {
                const idx = +nodeUID.replace(OP_NODE_PREFIX, '');
                return graph.node[idx];
            }
        }
    };
};

const relationPush = (
    nodeRelationMapping: NodeRelationMapping,
    nodeUID: NodeUID,
    key: keyof NodeRelation,
    value: NodeUID
) => {
    const leaf = nodeRelationMapping[nodeUID] || {input: [], output: []};
    leaf[key].push(value);
    nodeRelationMapping[nodeUID] = leaf;
};

const traverseRelation = (
    nodeMapping: NodeRelationMapping,
    process: (bridge: NodeUID, inputTo: NodeUID, outputTo: NodeUID) => void
) => {
    for (const [nodeUID, relations] of Object.entries(nodeMapping)) {
        const {input, output} = relations;

        input.forEach(inputTo => {
            output.forEach(outputTo => {
                process(nodeUID, inputTo, outputTo);
            });
        });
    }
};

const buildNodeRelationMapping = (nodeList: WithUIDMap<Graph['node']>) => {
    return nodeList.reduce<NodeRelationMapping>((memo, node) => {
        const uid = node.uid;
        // reverse
        (node.output || []).forEach(v => relationPush(memo, v, 'input', uid));
        (node.input || []).forEach(v => relationPush(memo, v, 'output', uid));

        return memo;
    }, {});
};

const expandRelations = (nodeMapping: NodeRelationMapping) => {
    const briefLayer: {nodes: DagNode[]; edges: DagEdge[]} = {nodes: [], edges: []};
    // a tmp node the middle man between input & output
    const detailLayer: {nodes: DagNode[]; edges: DagEdge[]} = {nodes: [], edges: []};

    traverseRelation(nodeMapping, (bridge, inputTo, outputTo) => {
        detailLayer.nodes.push({
            key: bridge,
            label: bridge,
            shape: 'diamond',
            class: 'output',
            type: NodeType.Output
        });

        detailLayer.edges.push([inputTo, bridge]);
        detailLayer.edges.push([bridge, outputTo]);
        briefLayer.edges.push([inputTo, outputTo]);
    });

    return {
        briefLayer,
        detailLayer
    };
};

const extractInputLayer = (nodeRelationMapping: NodeRelationMapping, findNode: NodeFinder) => {
    const nodes: DagNode[] = [];
    const edges: DagEdge[] = [];
    for (const [nodeUID, relations] of Object.entries(nodeRelationMapping)) {
        if (relations.input.length !== 0) {
            continue;
        }
        const sepIdx = nodeUID.indexOf('@');
        const inputNodeUID = sepIdx > 0 ? nodeUID.slice(0, sepIdx) : nodeUID;
        const inputNode = findNode(NodeType.Input, inputNodeUID) as InputNode;
        nodes.push({
            key: inputNodeUID,
            type: NodeType.Input,
            label: `
id: ${inputNode.name}
type: ${inputNode.data_type}
dims: ${inputNode.shape.join(' × ')}
`,
            shape: 'rect',
            class: 'input'
        });

        relations.output.forEach(o => edges.push([inputNodeUID, o]));
    }

    return {nodes, edges};
};

const extractOutputLayer = (nodeRelationMapping: NodeRelationMapping) => {
    const nodes: DagNode[] = [];
    const edges: DagEdge[] = [];
    for (const [nodeUID, relations] of Object.entries(nodeRelationMapping)) {
        if (relations.output.length !== 0) {
            continue;
        }
        nodes.push({
            key: nodeUID,
            type: NodeType.Output,
            label: nodeUID,
            shape: 'diamond',
            class: 'output'
        });

        for (const inputNode of relations.input) {
            edges.push([nodeUID, inputNode]);
        }
    }

    return {
        nodes,
        edges
    };
};

export const collectDagFacts = (graph?: Graph) => {
    const findNode = createNodeFinder(graph);
    const nodeList = assignNodeUID(NodeType.Op, graph ? graph.node : []);
    const nodeRelationMapping = buildNodeRelationMapping(nodeList);

    const inputLayer = extractInputLayer(nodeRelationMapping, findNode);
    const outputLayer = extractOutputLayer(nodeRelationMapping);

    const backboneNodes = nodeList.map(n => ({
        key: n.uid,
        type: NodeType.Op,
        label: n.opType,
        shape: 'rect',
        class: 'operator'
    }));

    const {briefLayer: bl, detailLayer: dl} = expandRelations(nodeRelationMapping);
    const briefLayer = {nodes: backboneNodes, edges: bl.edges};
    const detailLayer = {nodes: briefLayer.nodes.concat(dl.nodes), edges: dl.edges};

    return {
        briefLayer,
        detailLayer,
        inputLayer,
        outputLayer,
        findNode
    };
};
