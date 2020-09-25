/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {Argument as ArgumentType, NameValues, Property as PropertyType} from '~/resource/graph/types';
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
