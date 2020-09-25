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

import React, {FunctionComponent, useCallback, useEffect, useState} from 'react';
import {em, transitionProps} from '~/utils/style';

import Icon from '~/components/Icon';
import RangeSlider from '~/components/RangeSlider';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Label = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-light-color);
    font-size: ${em(12)};
    margin-bottom: ${em(5)};
    ${transitionProps('color')}

    > :not(:first-child) {
        flex-grow: 0;
    }

    .step-indicator {
        display: flex;
        align-items: center;

        .step-buttons {
            margin-left: ${em(10)};
            display: flex;
            flex-direction: column;
            font-size: ${em(10)};

            > a {
                display: inline-blcok;
                line-height: 1;
                height: ${em(14)};

                &:hover {
                    color: var(--text-lighter-color);
                }

                > i {
                    display: inline-block;
                    height: 100%;

                    > svg {
                        vertical-align: top;
                    }
                }
            }
        }
    }
`;

const FullWidthRangeSlider = styled(RangeSlider)`
    width: 100%;
`;

type StepSliderProps = {
    value: number;
    steps: number[];
    onChange?: (value: number) => unknown;
    onChangeComplete?: () => unknown;
};

const StepSlider: FunctionComponent<StepSliderProps> = ({onChange, onChangeComplete, value, steps, children}) => {
    const {t} = useTranslation('sample');
    const [step, setStep] = useState(value);

    useEffect(() => setStep(value), [value]);

    const changeStep = useCallback(
        (num: number) => {
            setStep(num);
            onChange?.(num);
        },
        [onChange]
    );

    const prevStep = useCallback(() => {
        if (value > 0) {
            changeStep(value - 1);
        }
    }, [value, changeStep]);

    const nextStep = useCallback(() => {
        if (value < steps.length - 1) {
            changeStep(value + 1);
        }
    }, [value, steps, changeStep]);

    return (
        <>
            <Label>
                <div className="step-indicator">
                    <div>{`${t('sample:step')}: ${steps[step] ?? '...'}`}</div>
                    <Tippy placement="right" theme="tooltip" content={t('sample:step-tip')}>
                        <div className="step-buttons">
                            <a href="javascript:void(0)" onClick={prevStep}>
                                <Icon type="chevron-up" />
                            </a>
                            <a href="javascript:void(0)" onClick={nextStep}>
                                <Icon type="chevron-down" />
                            </a>
                        </div>
                    </Tippy>
                </div>
                {children && <span>{children}</span>}
            </Label>
            <FullWidthRangeSlider
                min={0}
                max={steps.length ? steps.length - 1 : 0}
                step={1}
                value={step}
                onChange={changeStep}
                onChangeComplete={onChangeComplete}
            />
        </>
    );
};

export default StepSlider;
