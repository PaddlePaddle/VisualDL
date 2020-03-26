import React, {FunctionComponent, useEffect, useState} from 'react';

import Button from '~/components/Button';
import {rem} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from '~/utils/i18n';

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

    return (
        <StyledButton onClick={() => setState(s => !s)} type={state ? 'primary' : 'danger'}>
            {t(state ? 'running' : 'stopped')}
        </StyledButton>
    );
};

export default RunningToggle;
