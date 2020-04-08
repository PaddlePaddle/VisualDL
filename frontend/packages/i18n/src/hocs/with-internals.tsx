/* eslint-disable @typescript-eslint/no-explicit-any */

import {NextI18NextInternals} from '../../types';
import React from 'react';

export const withInternals = (WrappedComponent: any, config: NextI18NextInternals) => {
    class WithInternals extends React.Component {
        static displayName = `withNextI18NextInternals(${
            WrappedComponent.displayName || WrappedComponent.name || 'Component'
        })`;

        render() {
            return <WrappedComponent {...this.props} nextI18NextInternals={config} />;
        }
    }

    return WithInternals;
};
