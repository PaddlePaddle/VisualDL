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
import type {SampleChartBaseProps, SampleData} from './SampleChart';
import {borderRadius, ellipsis, em, rem, sameBorder, size, transitionProps} from '~/utils/style';
import useRequest, {useRunningRequest} from '~/hooks/useRequest';

import ContentLoader from '~/components/Loader/ContentLoader';
import Icon from '~/components/Icon';
import {TextChart as TextChartLoader} from '~/components/Loader/ChartPage';
import {getEntityUrl} from './SampleChart';
import queryString from 'query-string';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Wrapper = styled.div`
    width: 100%;
`;

const Title = styled.h4<{color: string; opened?: boolean}>`
    cursor: pointer;
    background-color: var(--text-chart-title-background-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: ${rem(40)};
    margin: 0;
    padding: 0 ${rem(20)} 0 ${rem(12)};
    border-radius: ${borderRadius};
    font-weight: 400;
    font-size: ${em(14)};
    ${transitionProps('background-color')}

    .tag {
        flex: auto;
        font-weight: 700;

        &::before {
            content: '';
            display: inline-block;
            ${size(rem(10), rem(3))}
            margin-right: ${rem(8)};
            border-radius: ${rem(1.5)};
            vertical-align: middle;
            background-color: var(--text-chart-title-indicator-color);
            ${transitionProps('background-color')}
        }
    }

    .run {
        flex: none;
        color: var(--text-lighter-color);
        ${transitionProps('color')}
        ${ellipsis()}
         max-width: 50%;

        &::before {
            content: '';
            display: inline-block;
            ${size(rem(9), rem(9))}
            margin-right: ${rem(8)};
            border-radius: ${rem(4.5)};
            vertical-align: middle;
            background-color: ${props => props.color};
        }
    }

    .steps {
        flex: none;
        color: var(--text-lighter-color);
        margin-left: ${rem(12)};
    }

    .icon {
        margin-left: ${rem(20)};
        font-size: ${rem(10)};
        color: var(--text-lighter-color);
        transform: rotate(${props => (props.opened ? '180' : '0')}deg);
        ${transitionProps(['transform', 'color'])};
    }
`;

const TextWrapper = styled.div`
    height: ${rem(40)};
    margin-top: ${rem(12)};
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0;
    ${sameBorder(true)}
    ${transitionProps('border-color')}
`;
// display: grid;
// grid-template-columns: fit-content(25%) auto;
// grid-row-gap: ${rem(12)};
// justify-items: stretch;
// align-items: stretch;
// ${transitionProps('border-color')}
const TextGrid = styled.div`
     margin-top: ${rem(12)};
     >div {
         ${sameBorder()}
         border-radius: ${borderRadius};
         margin-bottom: ${rem(20)};
         > span {
             display:block;
             height: ${rem(40)};
             line-height: 1.857142857;
             padding: ${rem(7)} 0;
         }
     
         .step {
             padding-left: ${rem(8)};
             padding-right: ${rem(14)};
     
             > span {
                 display: inline-block;
                 width: atuo;
                 clear:both
                 color: var(--text-light-color);
                 background-color: var(--text-chart-tag-background-color);
                 padding: 0 ${rem(8)};
                 border-radius: ${borderRadius};
                 ${transitionProps(['background-color', 'color'])}
             }
         }
     
         .text {
             padding-left: 1rem;
             padding-right: ${rem(20)};
             display: block;
             overflow: hidden;
             white-space: normal;
             word-wrap: normal;
             height:auto;
     
             > * {
                 vertical-align: middle;
             }
         }
     }
 `;

type TextProps = {
    index: number;
    run: string;
    tag: string;
} & SampleData;

const Text: FunctionComponent<TextProps> = ({run, tag, step, wallTime, index}) => {
    const {t} = useTranslation('sample');

    const {
        data: text,
        error,
        loading
    } = useRequest<string>(getEntityUrl('text', index, run, tag, wallTime), {
        dedupingInterval: 5 * 60 * 1000
    });

    return (
        <div>
            <span className="step">
                <span>
                    {t('common:time-mode.step')} {step}
                </span>
            </span>
            <span className="text" title={text ?? ''}>
                {loading ? (
                    <ContentLoader viewBox="0 0 640 16" height="16">
                        <rect x="0" y="0" rx="3" ry="3" width={((index + 1) * 250) % 640} height="16" />
                    </ContentLoader>
                ) : (
                    error ?? text
                )}
            </span>
        </div>
    );
};

type TextChartProps = {
    opened?: boolean;
} & SampleChartBaseProps;

const TextChart: FunctionComponent<TextChartProps> = ({run, tag, opened, running}) => {
    const [isOpened, setIsOpened] = useState(opened ?? false);
    useEffect(() => setIsOpened(opened ?? false), [opened]);
    const toggleOpened = useCallback(() => setIsOpened(m => !m), []);

    const {data, error, loading} = useRunningRequest<SampleData[]>(
        `/text/list?${queryString.stringify({run: run.label, tag})}`,
        !!running
    );

    return (
        <Wrapper>
            <Title color={run.colors[0]} opened={isOpened} onClick={toggleOpened}>
                <span className="tag">{tag}</span>
                <span className="run">{run.label}</span>
                <span className="steps">{data?.length ?? 0}</span>
                <Icon className="icon" type="chevron-down" />
            </Title>
            {isOpened ? (
                loading ? (
                    <>
                        <TextWrapper>
                            <TextChartLoader width={270} />
                        </TextWrapper>
                        <TextWrapper>
                            <TextChartLoader width={640} />
                        </TextWrapper>
                    </>
                ) : error ? (
                    <TextWrapper>{error}</TextWrapper>
                ) : (
                    <TextGrid>
                        {data?.map((item, index) => (
                            <Text key={index} {...item} run={run.label} tag={tag} index={index} />
                        ))}
                    </TextGrid>
                )
            ) : null}
        </Wrapper>
    );
};

export default TextChart;

export const Loader: FunctionComponent = () => (
    <>
        <Wrapper>
            <Title color=""></Title>
            <TextWrapper>
                <TextChartLoader width={270} />
            </TextWrapper>
            <TextWrapper>
                <TextChartLoader width={640} />
            </TextWrapper>
        </Wrapper>
        <Wrapper>
            <Title color=""></Title>
        </Wrapper>
    </>
);
