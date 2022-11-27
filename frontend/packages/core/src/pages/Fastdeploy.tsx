import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {rem, primaryColor, size} from '~/utils/style';
import {Tabs} from 'antd';
import Input from '~/components/Input';
import Content from '~/components/Content';
import FastdeployGraph from '~/components/FastdeployGraph';
import {toast} from 'react-toastify';
import {fetcher} from '~/utils/fetch';
import HashLoader from 'react-spinners/HashLoader';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
const ButtonContent = styled.section`
    display: flex;
    .active {
        background-color: #2932e1;
        color: white;
    }
    .un_active {
        background-color: white;
        color: #2932e1;
    }
    .disabled {
        background: #ccc;
        color: white;
        cursor: not-allowed;
    }
`;

interface IAnyObj {
    [index: string]: unknown;
}

type TabPosition = 'left' | 'right' | 'top' | 'bottom';
const InputContent = styled.div`
    display: flex;
    height: ${rem(50)};
    justify-content: center;
    align-items: center;
    padding: 10px;
    .inputWrapper {
        width: 500px;
        border-radius: 0px;
        flex: 1;
    }
`;
const Contents = styled.div`
    height: 100%;
    background: white;
    display: flex;
    flex-direction: column;
`;
const Buttons = styled.div`
    height: ${rem(36)};
    line-height: ${rem(36)};
    text-align: center;
    font-size: 16px;
    margin-left: 20px;
    width: 100px;
    color: white;
    background-color: var(--navbar-background-color);
`;

const Titles = styled.div`
    font-size: 20px;
    padding-top: 150px;
    padding-bottom: 20px;
    text-align: center;
`;
const Loading = styled.div`
    ${size('100%', '100%')}
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overscroll-behavior: none;
    cursor: progress;
    font-size: ${rem(16)};
    line-height: ${rem(60)};
`;
const TabsContent = styled.div`
    padding: 20px 10px 0px 10px;
    flex: 1;
    .ant-tabs-content-left {
        height: 100%;
    }
`;
function App() {
    const {t} = useTranslation(['togglegraph']);
    const [show, setShow] = useState({
        show: true,
        show2: false
    });
    const [mode, setMode] = useState<TabPosition>('left');
    const [inputValue, setInputValue] = useState('');
    const [dir, setDir] = useState('');
    const [loading, setLoading] = useState(false);
    const [modelData, setModelData] = useState<any>();

    useEffect(() => {
        // const Graphs: any = Graph;
        getModelData();
    }, []);
    const getModelData = () => {
        fetcher(`/fastdeploy/get_config?dir=${dir}`, {
            method: 'GET'
        }).then(
            (res: any) => {
                console.log('blobres', res);
                // downloadEvt(res.data, fileName);
                setModelData(res);
                setLoading(false);
            },
            res => {
                setLoading(false);
            }
        );
    };
    return (
        <Content>
            {/* {loading && (
                <Loading>
                    <HashLoader size="60px" color={primaryColor} />
                </Loading>
            )} */}
            <Contents>
                <InputContent>
                    <Input
                        // placeholder={t('common:search-tags')}
                        className="inputWrapper"
                        rounded
                        value={inputValue}
                        onChange={(value: string) => setInputValue(value)}
                    />
                    <Buttons>更换模型库</Buttons>
                </InputContent>
                <TabsContent>
                    <Tabs defaultActiveKey="1" tabPosition={mode} style={{height: '100%'}}>
                        {modelData && (
                            <Tabs.TabPane tab="项目 1" key="item-1">
                                <FastdeployGraph modelData={modelData}></FastdeployGraph>
                            </Tabs.TabPane>
                        )}
                    </Tabs>
                </TabsContent>
            </Contents>
            {/* {React.lazy(() => import('~/components/Fastdeploy'))} */}
        </Content>
    );
}
export default App;
