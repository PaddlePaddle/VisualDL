import React, {FunctionComponent} from 'react';

import GraphSidebar from '~/components/GraphPage/GraphSidebar';
import Properties from '~/components/GraphPage/Properties';
import {Properties as PropertiesType} from '~/resource/graph/types';
import {useTranslation} from '~/utils/i18n';

type NodePropertiesSidebarProps = {
    data?: PropertiesType | null;
    onClose?: () => unknown;
    showNodeDodumentation?: () => unknown;
};

const NodePropertiesSidebar: FunctionComponent<NodePropertiesSidebarProps> = ({
    data,
    onClose,
    showNodeDodumentation
}) => {
    const {t} = useTranslation('graph');

    return (
        <GraphSidebar title={t('graph:node-properties')} onClose={onClose}>
            <Properties {...data} showNodeDodumentation={showNodeDodumentation} />
        </GraphSidebar>
    );
};

export default NodePropertiesSidebar;
