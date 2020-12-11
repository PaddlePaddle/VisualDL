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

import React, {FunctionComponent, useMemo} from 'react';

import type {Dimension} from '~/resource/high-dimensional';
import Field from '~/components/Field';
import {format} from 'd3-format';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const formatRatio = format('.2%');

const Wrapper = styled(Field)`
    line-height: 2.4;
`;

export type PCADetailProps = {
    dimension: Dimension;
    variance: number[];
};

const PCADetail: FunctionComponent<PCADetailProps> = ({dimension, variance}) => {
    const {t} = useTranslation(['high-dimensional', 'common']);

    const dim = useMemo(() => (dimension === '3d' ? 3 : 2), [dimension]);
    const totalVariance = useMemo(() => variance.reduce((s, c) => s + c, 0), [variance]);

    return (
        <Wrapper>
            {new Array(dim).fill(0).map((_, index) => (
                <div key={index}>
                    {t('high-dimensional:component', {index: index + 1})}
                    {t('common:colon')}
                    {variance[index] == null ? '--' : formatRatio(variance[index])}
                </div>
            ))}
            <div className="secondary">
                {t('high-dimensional:total-variance-described')}
                {t('common:colon')}
                {formatRatio(totalVariance)}
            </div>
        </Wrapper>
    );
};

export default PCADetail;
