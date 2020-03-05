/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {NextI18NextInternals} from '../types';

export const withInternals = (WrappedComponent: any, config: NextI18NextInternals) => {
    class WithInternals extends React.Component {
        static displayName = `withnextI18NextInternals(${WrappedComponent.displayName ||
            WrappedComponent.name ||
            'Component'})`;

        render() {
            return <WrappedComponent {...this.props} nextI18NextInternals={config} />;
        }
    }

    return WithInternals;
};
