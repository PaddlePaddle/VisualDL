import React, {FunctionComponent, Suspense, useMemo} from 'react';

import type {WithStyled} from '~/utils/style';
import styled from 'styled-components';

const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;

const Wrapper = styled.i`
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
`;

export type Icons = string;

type IconProps = {
    type: Icons;
    onClick?: () => unknown;
};

const Icon: FunctionComponent<IconProps & WithStyled> = ({type, onClick, className}) => {
    const Svg = useMemo(() => React.lazy(() => import(`${PUBLIC_PATH}/icons/${type}.js`)), [type]);

    return (
        <Wrapper className={`vdl-icon icon-${type} ${className ?? ''}`} onClick={() => onClick?.()}>
            <Suspense fallback="">
                <Svg />
            </Suspense>
        </Wrapper>
    );
};

export default Icon;
