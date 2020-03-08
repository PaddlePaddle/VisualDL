import React, {FunctionComponent} from 'react';
import {useTranslation} from '~/utils/i18n';
import {NodeType, TypedNode} from '~/resource/graphs';
import styled from 'styled-components';
import {WithStyled} from '~/utils/style';

const typeName: {[k in NodeType]: string} = {
    [NodeType.Input]: 'input',
    [NodeType.Output]: 'output',
    [NodeType.Op]: 'operator'
};

export interface NodeInfoProps {
    node?: TypedNode | {type: 'unknown'; guessType: NodeType; msg: string};
}

const DataList: FunctionComponent<{items: {key: string; value: string | string[]}[]} & WithStyled> = props => {
    return (
        <ul className={props.className}>
            {props.items.map(({key, value}) => (
                <li key={key}>
                    {key}: {value}
                </li>
            ))}
        </ul>
    );
};

const PropertyList = styled(DataList)`
    padding: 0;
    list-style: none;
    color: #666;
    li + li {
        margin-top: 1em;
    }
`;

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
                <PropertyList
                    items={[
                        {key: t('node-type'), value: typeName[node.type]},
                        {key: t('node-name'), value: node.name},
                        {key: t('node-data-shape'), value: node.shape},
                        {key: t('node-data-tyep'), value: node.data_type}
                    ]}
                />
            );
        case NodeType.Op:
            return (
                <PropertyList
                    items={[
                        {key: t('node-type'), value: typeName[node.type]},
                        {key: t('input'), value: node.input},
                        {key: t('op-type'), value: node.opType},
                        {key: t('output'), value: node.output}
                    ]}
                />
            );
        case 'unknown':
            return <PropertyList items={[{key: t('node-type'), value: typeName[node.guessType]}]} />;
        default:
            return <></>;
    }
};

export default NodeInfo;
