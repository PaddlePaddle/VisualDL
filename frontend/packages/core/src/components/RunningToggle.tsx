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

import React, {FunctionComponent, useEffect, useState} from 'react';
import {WithStyled, rem} from '~/utils/style';

import Button from '~/components/Button';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

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
