import {Argument as ArgumentType, NameValues, Property as PropertyType} from '~/resource/graph/types';
import React, {FunctionComponent} from 'react';
import {ellipsis, em, sameBorder} from '~/utils/style';

import Argument from '~/components/GraphPage/Argument';
import styled from 'styled-components';

const Wrapper = styled.div`
    display: flex;
    align-items: top;
    justify-content: space-between;
    width: 100%;

    > .property-name {
        flex: none;
        text-align: right;
        width: ${em(80)};
        padding: ${em(8)} 0;
        ${sameBorder({color: 'transparent'})}
        ${ellipsis()}
    }

    > .property-values {
        flex: auto;
        width: calc(100% - ${em(90)});
        margin-left: ${em(10)};
    }

    & + & {
        margin-top: ${em(10)};
    }
`;

type PropertyProps = NameValues<ArgumentType | PropertyType> & {
    expand?: boolean;
    showNodeDodumentation?: () => unknown;
};

const Property: FunctionComponent<PropertyProps> = ({name, values, expand, showNodeDodumentation}) => {
    return (
        <Wrapper>
            <label className="property-name" title={name}>
                {name}
            </label>
            <div className="property-values">
                {values.map((value, index) => (
                    <Argument key={index} value={value} expand={expand} showNodeDodumentation={showNodeDodumentation} />
                ))}
            </div>
        </Wrapper>
    );
};

export default Property;
