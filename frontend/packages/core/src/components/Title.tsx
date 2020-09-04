import React, {FunctionComponent} from 'react';

import {Helmet} from 'react-helmet';

const Title: FunctionComponent = ({children}) => (
    <Helmet>
        <title>{children}</title>
    </Helmet>
);

export default Title;
