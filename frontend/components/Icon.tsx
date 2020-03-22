import React, {FunctionComponent} from 'react';

import {WithStyled} from '~/utils/style';

type IconProps = {
    type: string;
};

const Icon: FunctionComponent<IconProps & WithStyled> = ({type, className}) => {
    return <i className={`vdl-icon icon-${type} ${className}`} />;
};

export default Icon;
