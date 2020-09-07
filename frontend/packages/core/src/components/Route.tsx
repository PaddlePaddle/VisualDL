import {Route as DomRouter, RouteProps} from 'react-router-dom';
import React, {FunctionComponent, useEffect} from 'react';

import NProgress from 'nprogress';

const Route: FunctionComponent<RouteProps> = props => {
    useEffect(() => {
        NProgress.start();
        return () => {
            NProgress.done();
        };
    }, []);
    return <DomRouter {...props} />;
};

export default Route;
