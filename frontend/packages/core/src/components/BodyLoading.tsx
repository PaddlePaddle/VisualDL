import React, {FunctionComponent} from 'react';
import {position, primaryColor, size} from '~/utils/style';

import HashLoader from 'react-spinners/HashLoader';
import styled from 'styled-components';

const Wrapper = styled.div`
    ${size('100vh', '100vw')}
    ${position('fixed', 0, 0, 0, 0)}
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    overscroll-behavior: none;
    cursor: progress;
`;

const BodyLoading: FunctionComponent = () => {
    return (
        <Wrapper>
            <HashLoader size="60px" color={primaryColor} />
        </Wrapper>
    );
};

export default BodyLoading;
