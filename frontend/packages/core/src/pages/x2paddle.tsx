import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {rem, primaryColor, size} from '~/utils/style';
import Content from '~/components/Content';
// import type {DrawerProps} from 'antd';
import RadioButton from '~/components/RadioButton';
import RadioGroup from '~/components/RadioGroup';
import {AsideSection} from '~/components/Aside';
import type {BlobResponse} from '~/utils/fetch';
import type {RadioChangeEvent} from 'antd';
import {Radio, Space} from 'antd';
import {Button, Drawer} from 'antd';
import {toast} from 'react-toastify';
import {fetcher, axios_fetcher, API_URL} from '~/utils/fetch';
import GraphStatic from '~/pages/graphStatic3';
import GraphStatic2 from '~/pages/graphStatic2';
import HashLoader from 'react-spinners/HashLoader';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import useRequest from '~/hooks/useRequest';
import Field from '~/components/Field';
import { Model } from '../store/graph/types';


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
const ExportButtonWrapper = styled.div`
    display: flex;
    justify-content: space-between;

    > * {
        flex: 1 1 auto;

        &:not(:last-child) {
            margin-right: ${rem(20)};
        }
    }
`;
const Article = styled.article`
    flex: auto;
    display: flex;
    min-width: 0;
    margin: ${10};
    min-height: ${10};
`;
const Buttons = styled.div`
    width: 49%;
    height: ${rem(40)};
    line-height: ${rem(40)};
    text-align: center;
    font-size: 16px;
`;
const Contents = styled.div`
    height: 100%;
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
    background-color: transparent;
`;
const Aside = styled.aside`
    width: ${rem(260)};
    display: flex;
`;
function App() {
    const {t} = useTranslation(['togglegraph']);
    const [show, setShow] = useState({
        show: true,
        show2: false
    });
    const [modelValue, setModelValue] = useState(1);
    const [showData, setshowData] = useState<any>(null);
    const [baseId, setBaseId] = useState<any>(false);
    const [file_names, setfile_names] = useState<any>(false);
    const [files2, setfiles2] = useState<any>();
    const [names, setNames] = useState('');
    const [open, setOpen] = useState(false);
    const [flags, setflags] = useState(false);
    const file = useRef<HTMLInputElement>(null);
    const Graph = useRef(null);
    const Graph2 = useRef(null);
   
    const downloadFileByBase64 = (baseId: any, fileName: string) => {
        console.log('baseId', baseId, fileName);
        if (baseId === undefined || !fileName) return;
        const url = modelValue === 1 ? '/inference/paddle2onnx/download' : '/inference/onnx2paddle/download';
        var elem = document.createElement('a');
        elem.href = API_URL + `${url}?request_id=${baseId}`;
        elem.setAttribute('download', fileName)
        elem.target = 'hiddenIframe';
        elem.click();
    };
    useEffect(() => {
        // const Graphs: any = Graph;
        const Graphs2: any = Graph2;
        if (showData) {
            // console.log('Graph2', showData);
            Graphs2?.current?.setModelFiles(showData);
        }
    }, [showData]);
    const Graphs2 = useMemo(() => {
        return (
            <div
                style={{
                    height: show.show2 ? 'auto' : '0px',
                    overflowY: 'hidden'
                }}
            >
                <GraphStatic2
                    ref={Graph2}
                    changeRendered={() => {
                        setShow({
                            show: false,
                            show2: true
                        });
                    }}
                    show={show.show2}
                />
            </div>
        );
    }, [show.show2]);
    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };
    const view2 = () => {
        if (!showData && files2) {
            // // toast.warning('请先进行转换,再查看');
            // toast.warning(t('warin-info3'));
            // return;
            // 改动
            // if (data?.data?.size) {
            //     // debugger;
            //     setshowData([new File([data.data], data.filename || 'unknown_model')]);
            // }
            // debugger;
            setshowData(files2);
        }
        // 改动
        setShow({
            show: false,
            show2: true
        });
        // setShow({
        //     show: true,
        //     show2: true
        // });
    };
    const view1 = () => {
        // 改动
        setShow({
            show: true,
            show2: false
        });
        // setShow({
        //     show: true,
        //     show2: true
        // });
    };
    const changeView = () => {
        if (show.show) {
            view2();
        } else {
            view1();
        }
    };
    const resetModel = () => {
        const Graphs: any = Graph?.current;
        Graphs.setnewfiles();
        // debugger;
        setshowData(null);
        setShow({
            show: true,
            show2: false
        });
        setflags(false);
    };

    const onChange = (e: RadioChangeEvent) => {
        setModelValue(e.target.value);
        resetModel();
    };
    const downloadEvent = (baseId: number, fileName: string) => {
        setBaseId(baseId);
        setfile_names(fileName);
    };
    // console.log('show', show);
    // console.log('Graph?.current?.files', Graph?.current);
    return (
        <Content>
            <Button
                style={{
                    position: 'absolute',
                    top: '4.428571428571429rem',
                    left: '0rem'
                }}
                type="primary"
                onClick={showDrawer}
            >
                O
            </Button>
            <Contents
                style={{
                    height: 'auto',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                <div
                    style={{
                        height: show.show ? 'auto' : '0px',
                        // opacity: show2 ? 1 : 0
                        overflowY: 'hidden'
                    }}
                >
                    {/* <Dropdown menu={{items}} placement="bottomRight">
                        <Button>bottomRight</Button>
                    </Dropdown> */}
                    <GraphStatic
                        ref={Graph}
                        changeName={setNames}
                        downloadEvent={downloadEvent}
                        show={show.show}
                        changeFlags={setflags}
                        changeFiles2={(file: any) => {
                            setfiles2(file);
                        }}
                        changeLoading={(flag: any) => {
                        }}
                        ModelValue={modelValue}
                        changeshowdata={() => {
                            // 更换模型
                            setshowData(null);
                        }}
                        Xpaddlae={true}
                    />
                </div>
                {Graphs2}
            </Contents>
            <div
                style={{
                    display: flags ? 'flex' : 'none',
                    position: 'absolute',
                    bottom: '-24px',
                    right: '20px',
                    width: '260px',
                    background: 'white',
                    height: '200px'
                }}
            >
                <AsideSection
                    style={{
                        width: '100%'
                    }}
                >
                    <Field label={t('togglegraph:View')}>
                        {modelValue === 2 ? (
                            <RadioGroup value={show.show ? show.show : show.show2} onChange={changeView}>
                                <RadioButton value={true}>Onnx</RadioButton>
                                <RadioButton value={false}>Paddle</RadioButton>
                            </RadioGroup>
                        ) : (
                            <RadioGroup value={show.show ? show.show : show.show2} onChange={changeView}>
                                <RadioButton value={false}>Paddle</RadioButton>
                                <RadioButton value={true}>Onnx</RadioButton>
                            </RadioGroup>
                        )}
                    </Field>
                    <Field>
                        <ExportButtonWrapper>
                            <Button
                                onClick={() => {
                                    downloadFileByBase64(baseId, file_names);
                                }}
                            >
                                {t('togglegraph:Download')}
                            </Button>
                            <Button onClick={resetModel}>{t('togglegraph:Reload')}</Button>
                        </ExportButtonWrapper>
                    </Field>
                </AsideSection>
            </div>
            <Drawer title="Basic Drawer" placement={'left'} closable={false} onClose={onClose} open={open} key={'left'}>
                <Radio.Group onChange={onChange} value={modelValue}>
                    <Space direction="vertical">
                        <Radio value={1}>Paddle2Onnx</Radio>
                        <Radio value={2}>Onnx2Paddle</Radio>
                    </Space>
                </Radio.Group>
            </Drawer>
        </Content>
    );
}
export default App;
