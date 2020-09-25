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

import React, {FunctionComponent, useCallback} from 'react';
import SampleChart, {
    SampleChartBaseProps,
    SampleEntityProps,
    SamplePreviewerProps
} from '~/components/SamplePage/SampleChart';
import {size, transitionProps} from '~/utils/style';

import Image from '~/components/Image';
import ImagePreviewer from '~/components/SamplePage/ImagePreviewer';
import styled from 'styled-components';

const StyledImage = styled(Image)<{brightness?: number; contrast?: number; fit?: boolean}>`
    ${size('100%')}
    filter: brightness(${props => props.brightness ?? 1}) contrast(${props => props.contrast ?? 1});
    ${transitionProps('filter')}
    object-fit: ${props => (props.fit ? 'contain' : 'scale-down')};
    flex-shrink: 1;
`;

const cache = 5 * 60 * 1000;

type ImageChartProps = {
    brightness?: number;
    contrast?: number;
    fit?: boolean;
} & SampleChartBaseProps;

const ImageChart: FunctionComponent<ImageChartProps> = ({brightness, contrast, fit, ...props}) => {
    const content = useCallback(
        (props: SampleEntityProps) => <StyledImage {...props} brightness={brightness} contrast={contrast} fit={fit} />,
        [brightness, contrast, fit]
    );

    const previewer = useCallback((props: SamplePreviewerProps) => <ImagePreviewer {...props} />, []);

    return <SampleChart type="image" cache={cache} content={content} previewer={previewer} {...props} />;
};

export default ImageChart;
