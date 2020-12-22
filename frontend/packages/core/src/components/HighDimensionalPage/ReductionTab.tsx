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

import type {Reduction} from '~/resource/high-dimensional';
import Tab from '~/components/Tab';
import {useTranslation} from 'react-i18next';

const reductions: Reduction[] = ['tsne', 'pca', 'umap'];

type ReductionTabProps = {
    value: Reduction;
    onChange?: (value: Reduction) => unknown;
};

const ReductionTab: FunctionComponent<ReductionTabProps> = ({value, onChange}) => {
    const {t} = useTranslation('high-dimensional');

    return (
        <Tab
            list={reductions.map(value => ({value, label: t(`high-dimensional:reduction-value.${value}`)}))}
            value={value}
            onChange={onChange}
        />
    );
};

export default ReductionTab;
