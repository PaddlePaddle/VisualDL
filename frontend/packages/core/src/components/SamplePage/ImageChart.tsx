import Image, {ImageRef} from '~/components/Image';
import React, {FunctionComponent, useCallback} from 'react';
import SampleChart, {SampleChartBaseProps} from '~/components/SamplePage/SampleChart';
import {size, transitionProps} from '~/utils/style';

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
        (ref: React.RefObject<ImageRef>, src: string) => (
            <StyledImage src={src} cache={cache} ref={ref} brightness={brightness} contrast={contrast} fit={fit} />
        ),
        [brightness, contrast, fit]
    );
    return <SampleChart type="image" cache={cache} content={content} {...props} />;
};

export default ImageChart;
