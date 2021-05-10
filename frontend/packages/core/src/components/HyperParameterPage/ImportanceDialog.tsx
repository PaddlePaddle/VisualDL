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

import * as d3 from 'd3';

import React, {FunctionComponent, useEffect, useMemo} from 'react';
import {WithStyled, borderRadius, rem, tint, transitionProps} from '~/utils/style';

import BarChart from '~/components/BarChart';
import Icon from '~/components/Icon';
import type {ImportanceData} from '~/resource/hyper-parameter';
import {colors} from '~/utils/theme';
import styled from 'styled-components';
import useRequest from '~/hooks/useRequest';
import {useTranslation} from 'react-i18next';

const COLOR_RANGE = [tint(0.6, colors.primary.default), colors.primary.default];

const Dialog = styled.div<{visible: boolean}>`
    width: ${rem(450)};
    height: ${rem(370)};
    background-color: var(--background-color);
    border-radius: ${borderRadius};
    box-shadow: 0 ${rem(4)} ${rem(12)} 0 rgba(0, 0, 0, 0.16);
    display: ${props => (props.visible ? 'inline-block' : 'none')};
    position: relative;
    padding: ${rem(20)};

    > .close {
        position: absolute;
        top: ${rem(20)};
        right: ${rem(20)};
        font-size: ${rem(12)};
        cursor: pointer;
        color: var(--text-lighter-color);
        ${transitionProps('color')}

        &:hover {
            color: var(--text-light-color);
        }

        &:active {
            color: var(--text-color);
        }
    }
`;

const ImportanceBarChart = styled(BarChart)`
    width: 100%;
    height: 100%;
`;

interface ImportanceDialogProps {
    visible?: boolean;
    onClickClose?: () => unknown;
}

const ImportanceDialog: FunctionComponent<ImportanceDialogProps & WithStyled> = ({
    visible,
    onClickClose,
    className
}) => {
    const {t} = useTranslation(['hyper-parameter', 'common']);

    const {data, mutate, isValidating} = useRequest<ImportanceData[]>('/hparams/importance', {
        revalidateOnMount: false
    });

    useEffect(() => {
        if (visible) {
            mutate();
        }
    }, [mutate, visible]);

    const reversedData = useMemo(() => {
        if (!data) {
            return [];
        }
        const arr = [...data];
        arr.reverse();
        return arr;
    }, [data]);

    const options = useMemo(
        () => ({
            animation: false,
            tooltip: {
                show: false
            }
        }),
        []
    );
    const categories = useMemo(() => reversedData.map(item => item.name) ?? [], [reversedData]);
    const series = useMemo(() => {
        const ranger = d3.scaleLinear<string, string>().domain([0, reversedData.length]).range(COLOR_RANGE);

        return [
            {
                barMaxWidth: 14,
                data:
                    reversedData.map((item, index) => ({
                        value: item.value,
                        itemStyle: {
                            color: ranger(index)
                        }
                    })) ?? [],
                type: 'bar' as const
            }
        ];
    }, [reversedData]);

    return (
        <Dialog visible={!!visible} className={className}>
            <ImportanceBarChart
                title={t('hyper-parameter:parameter-importance')}
                direction="horizontal"
                options={options}
                categories={categories}
                data={series}
                loading={isValidating}
            />
            <a className="close" onClick={() => onClickClose?.()}>
                <Icon type="close" />
            </a>
        </Dialog>
    );
};

export default ImportanceDialog;
