import React, {FunctionComponent} from 'react';
import {em, sameBorder} from '~/utils/style';

import styled from 'styled-components';
import {useTranslation} from '~/utils/i18n';

const Row = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    > .property-name {
        flex: 0 0 auto;
        text-align: right;
        width: ${em(80)};
    }

    > .property-value {
        flex: 1 1 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: ${em(8)} ${em(10)};
        margin-left: ${em(10)};
        ${sameBorder({radius: true})}

        > .property-value-text {
            flex: 1 1 auto;
        }

        > .property-operation {
            flex: 0 0 auto;
        }
    }

    & + & {
        margin-top: ${em(10)};
    }
`;

type PropertyProps = {
    name: string;
    value: string;
};

const Property: FunctionComponent<PropertyProps> = ({name, value}) => {
    const {t} = useTranslation('graphs');

    return (
        <Row>
            <span className="property-name">{t(`graphs:properties.${name}`)}</span>
            <span className="property-value">
                <span className="property-value-text">{value}</span>
            </span>
        </Row>
    );
};

export default Property;
