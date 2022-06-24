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
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from 'react';
import { Tabs } from 'antd';
import {asideWidth, rem} from '~/utils/style';
import type {TabProps} from '~/components/Tab';
import Field from '~/components/Field';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import type {SelectListItem, SelectProps} from '~/components/Select';
import Select from '~/components/Select';
const onChange = (key: string) => {
  console.log(key);
};
const TitleContent = styled.div`
    padding:${rem(20)};
    border-bottom: 1px solid #DDDDDD;
`;
const FullWidthSelect = styled<React.FunctionComponent<SelectProps<any>>>(Select)`
    width: 100%;
`;
const Title = styled.div`
    font-family: PingFangSC-Regular;
    font-size: ${rem(14)};
    color: #000000;
    letter-spacing: 0;
    line-height: ${rem(14)};
    font-weight: 400;
    margin-bottom:${rem(20)};
`;
const ButtonsLeft = styled.div`
    border: 1px solid #DDDDDD;
    border-right:none;
    width:${rem(110)};
    height:${rem(36)};
    font-family: PingFangSC-Regular;
    font-size: ${rem(12)};
    text-align: center;
    line-height: ${rem(36)};
    font-weight: 400;
    border-radius: 4px 0 0 4px;
`
const ButtonsRight = styled.div`
    border: 1px solid #DDDDDD;
    border-radius: 0 4px 4px 0;
    width:${rem(110)};
    height:${rem(36)};
    font-family: PingFangSC-Regular;
    font-size: ${rem(12)};
    text-align: center;
    line-height: ${rem(36)};
    font-weight: 400;
`
const RadioButtons = styled.div`
    display: flex;
    align-items: center;
    border-radius: 4px;
`;
const Selectlist = styled.div`
    height: ${rem(36)};
    width: 100%;
    padding: 20px;
    border-radius: 4px;
`;
const AsideSection = styled.div`
    margin-bottom:${rem(20)};
`;
const IndicatorFilter: FunctionComponent<any> = () => {
    const {t} = useTranslation(['hyper-parameter', 'common']);
    const [labelByIndex, setLabelByIndex] = useState<number>(0);
    const [labelList, setLabelList] = useState<any[]>([]);
    const labelByList = useMemo<SelectListItem<number>[]>(
        () => labelList.map(({label}, index) => ({label, value: index})),
        [labelList]
    );
    return (
        <>
            <TitleContent>
                <Title>
                    性能分析
                </Title>
                <RadioButtons>
                    <ButtonsLeft>
                        正常模式
                    </ButtonsLeft>
                    <ButtonsRight>
                        对比模式
                    </ButtonsRight>
                </RadioButtons>
            </TitleContent>
            <Selectlist>
                <AsideSection>
                    <Field label={'数据流'}>
                        <FullWidthSelect list={labelByList} value={labelByIndex} onChange={setLabelByIndex} />
                    </Field>
                </AsideSection>
                <AsideSection >
                    <Field label={'视图'}>
                        <FullWidthSelect list={labelByList} value={labelByIndex} onChange={setLabelByIndex} />
                    </Field>
                </AsideSection>
                <AsideSection >
                    <Field label={'进程'}>
                        <FullWidthSelect list={labelByList} value={labelByIndex} onChange={setLabelByIndex} />
                    </Field>
                </AsideSection>
                <AsideSection >
                    <Field label={'进程跨度'}>
                        <FullWidthSelect list={labelByList} value={labelByIndex} onChange={setLabelByIndex} />
                    </Field>
                </AsideSection>

            </Selectlist>

        </>
    );
};

export default IndicatorFilter;
