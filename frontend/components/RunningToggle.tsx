import React, {FunctionComponent, useState, useCallback} from 'react';
import styled from 'styled-components';
import {rem} from '~/utils/style';
import {useTranslation} from 'react-i18next';
import Button from '~/components/Button';

const StyledButton = styled(Button)`
    margin-top: ${rem(40)};
    width: 100%;
    text-transform: uppercase;
`;

type RunningToggleProps = {
    running?: boolean;
    onToggle?: (running: boolean) => unknown;
};

const RunningToggle: FunctionComponent<RunningToggleProps> = ({running, onToggle}) => {
    const {t} = useTranslation('common');

    const [state, setState] = useState(!!running);
    const onClick = useCallback(() => {
        setState(s => !s);
        onToggle?.(state);
    }, [state, onToggle]);

    return <StyledButton onClick={onClick}>{t(state ? 'running' : 'stopped')}</StyledButton>;
};

export default RunningToggle;
