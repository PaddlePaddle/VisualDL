import React, {FunctionComponent} from 'react';
import {rem, size} from '~/utils/style';

import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const LANGUAGE_FLAGS = [
    ['zh', '中'],
    ['en', 'En']
];

const Item = styled.span<{active: boolean}>`
    display: inline-block;
    color: currentColor;
    opacity: ${props => (props.active ? 1 : 0.29)};
`;

const Divider = styled.span`
    display: inline-block;
    margin: 0 ${rem(5)};
    ${size('1em', '1px')}
    background-color: currentColor;
`;

const Language: FunctionComponent = () => {
    const {i18n} = useTranslation();

    return (
        <>
            {LANGUAGE_FLAGS.map(([l, f], i) => (
                <React.Fragment key={f}>
                    {i !== 0 && <Divider />}
                    <Item active={l === i18n.language}>{f}</Item>
                </React.Fragment>
            ))}
        </>
    );
};

export default Language;
