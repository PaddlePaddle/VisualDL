import React, {FunctionComponent} from 'react';
import {useTranslation, NextI18NextPage} from '~/utils/i18n';
import {NodeType, TypedNode} from '~/resource/graph';

const typeName: {[k in NodeType]: string} = {
    [NodeType.Input]: 'input',
    [NodeType.Output]: 'output',
    [NodeType.Op]: 'operator'
};

export interface NodeInfoProps {
    node?: TypedNode | {type: 'unknown'; guessType: NodeType; msg: string};
}

const NodeInfo: FunctionComponent<NodeInfoProps> = props => {
    const {t} = useTranslation(['graphs']);
    if (!props.node) {
        return <p>{t('click-node')}</p>;
    }

    const node = props.node;
    switch (node.type) {
        case NodeType.Input:
        case NodeType.Output:
            return (
                <ul>
                    <li>
                        {t('node-type')}: {typeName[node.type]}
                    </li>
                    <li>
                        {t('node-name')}: {node.name}
                    </li>
                    <li>
                        {t('node-data-shape')}: {node.shape}
                    </li>
                    <li>
                        {t('node-data-type')}: {node.data_type}
                    </li>
                </ul>
            );
        case NodeType.Op:
            return (
                <ul>
                    <li>
                        {t('node-type')}: {typeName[node.type]}
                    </li>
                    <li>
                        {t('input')}: {node.input}
                    </li>
                    <li>
                        {t('op-type')}: {node.opType}
                    </li>
                    <li>
                        {t('output')}: {node.output}
                    </li>
                </ul>
            );
        case 'unknown':
            return (
                <ul>
                    <li>
                        {t('node-type')}: {typeName[node.guessType]}
                    </li>
                </ul>
            );
        default:
            return <></>;
    }
};

export default NodeInfo;
