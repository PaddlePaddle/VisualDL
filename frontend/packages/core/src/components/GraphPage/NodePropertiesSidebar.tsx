/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {FunctionComponent} from 'react';

import GraphSidebar from '~/components/GraphPage/GraphSidebar';
import Properties from '~/components/GraphPage/Properties';
import type {Properties as PropertiesType} from '~/resource/graph/types';
import {useTranslation} from 'react-i18next';

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
