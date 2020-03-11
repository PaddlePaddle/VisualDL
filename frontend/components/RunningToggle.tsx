import React, {FunctionComponent, useState, useEffect} from 'react';
import styled from 'styled-components';
import {rem} from '~/utils/style';
import {useTranslation} from '~/utils/i18n';
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

    useEffect(() => {
        onToggle?.(state);
    }, [onToggle, state]);

    return <StyledButton onClick={() => setState(s => !s)}>{t(state ? 'running' : 'stopped')}</StyledButton>;
};

export default RunningToggle;
