import React, {FunctionComponent} from 'react';

import {WithStyled} from '~/utils/style';

type IconProps = {
    type: string;
    onClick?: () => unknown;
};

const Icon: FunctionComponent<IconProps & WithStyled> = ({type, onClick, className}) => {
    return <i className={`vdl-icon icon-${type} ${className ?? ''}`} onClick={() => onClick?.()}></i>;
};

export default Icon;
