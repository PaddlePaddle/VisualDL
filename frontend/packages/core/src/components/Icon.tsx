import React, {FunctionComponent, Suspense, useMemo} from 'react';

import type {WithStyled} from '~/utils/style';

const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH ?? '';

export type Icons = string;

type IconProps = {
    type: Icons;
    onClick?: () => unknown;
};

const Icon: FunctionComponent<IconProps & WithStyled> = ({type, onClick, className}) => {
    const Svg = useMemo(() => React.lazy(() => import(`${PUBLIC_PATH}/icons/${type}.js`)), [type]);

    return (
        <i className={`vdl-icon icon-${type} ${className ?? ''}`} onClick={() => onClick?.()}>
            <Suspense fallback="">
                <Svg />
            </Suspense>
        </i>
    );
};

export default Icon;
