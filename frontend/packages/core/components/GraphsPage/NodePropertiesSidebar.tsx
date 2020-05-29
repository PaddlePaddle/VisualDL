import React, {FunctionComponent} from 'react';

import GraphSidebar from '~/components/GraphsPage/GraphSidebar';
import Properties from '~/components/GraphsPage/Properties';
import {Properties as PropertiesType} from '~/resource/graphs/types';
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
    const {t} = useTranslation('graphs');

    return (
        <GraphSidebar title={t('graphs:node-properties')} onClose={onClose}>
            <Properties {...data} showNodeDodumentation={showNodeDodumentation} />
        </GraphSidebar>
    );
};

export default NodePropertiesSidebar;
