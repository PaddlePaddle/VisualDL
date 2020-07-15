import React, {FunctionComponent, useEffect, useState} from 'react';
import {WithStyled, rem} from '~/utils/style';

import Button from '~/components/Button';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import {useTranslation} from '~/utils/i18n';

const Wrapper = styled.div`
    display: flex;
    align-items: center;

    > span {
        width: ${rem(55)};
    }

    > div {
        flex-grow: 1;
        margin-left: ${rem(20)};
    }
`;

const StyledButton = styled(Button)`
    text-transform: uppercase;
    width: 100%;
`;

type RunningToggleProps = {
    running?: boolean;
    onToggle?: (running: boolean) => unknown;
};

const RunningToggle: FunctionComponent<RunningToggleProps & WithStyled> = ({running, onToggle, className}) => {
    const {t} = useTranslation('common');

    const [state, setState] = useState(!!running);

    useEffect(() => {
        onToggle?.(state);
    }, [onToggle, state]);

    return (
        <Wrapper className={className}>
            <span>{t(state ? 'running' : 'stopped')}</span>
            <Tippy
                theme="tooltip"
                content={t(state ? 'stop-realtime-refresh' : 'start-realtime-refresh') + ''}
                hideOnClick={false}
            >
                <div>
                    <StyledButton onClick={() => setState(s => !s)} type={state ? 'danger' : 'primary'} rounded>
                        {t(state ? 'stop' : 'run')}
                    </StyledButton>
                </div>
            </Tippy>
        </Wrapper>
    );
};

export default RunningToggle;
