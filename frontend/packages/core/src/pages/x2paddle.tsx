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
import {Model} from '../store/graph/types';

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
    const [showRadio, setShowRadio] = useState(0); // 0 for paddle, 1 for onnx
    const [modelValue, setModelValue] = useState(1);
    const [showData, setshowData] = useState<any>(null);
    const [baseId, setBaseId] = useState<any>(false);
    const [file_names, setfile_names] = useState<any>(false);
    const [files2, setfiles2] = useState<any>();
    const [loadFiles2, setLoadFiles2] = useState<any>(false);
    const [names, setNames] = useState('');
    const [open, setOpen] = useState(false);
    const [configPage, setConfigPage] = useState(true);
    const [flags, setflags] = useState(false);
    const file = useRef<HTMLInputElement>(null);
    const Graph = useRef(null);
    const Graph2 = useRef(null);

    const downloadFileByBase64 = (baseId: any, fileName: string) => {
        if (baseId === undefined || !fileName) return;
        const url = modelValue === 1 ? '/inference/paddle2onnx/download' : '/inference/onnx2paddle/download';
        const elem = document.createElement('a');
        elem.href = API_URL + `${url}?request_id=${baseId}`;
        elem.setAttribute('download', fileName);
        elem.target = 'hiddenIframe';
        elem.click();
    };
    useEffect(() => {
        // const Graphs: any = Graph;
        const Graphs2: any = Graph2;
        if (showData) {
            Graphs2?.current?.setModelFiles(showData);
        }
    }, [loadFiles2]);
    const Graphs2 = useMemo(() => {
        if (((modelValue == 1 && showRadio == 1) || (modelValue == 2 && showRadio == 0)) && !configPage) {
            setLoadFiles2(true);
        }
        return (
            <div
                style={{
                    height:
                        ((modelValue == 1 && showRadio == 1) || (modelValue == 2 && showRadio == 0)) && !configPage
                            ? 'auto'
                            : '0px',
                    overflowY: 'hidden'
                }}
            >
                <GraphStatic2
                    ref={Graph2}
                    changeRendered={() => {
                        // do nothing.
                    }}
                    show={((modelValue == 1 && showRadio == 1) || (modelValue == 2 && showRadio == 0)) && !configPage}
                />
            </div>
        );
    }, [showData, showRadio]);
    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };
    const viewTranslated = () => {
        if (!showData && files2) {
            setshowData(files2);
        }
    };

    const viewUserInput = () => {
        // do nothing.
    };

    const changeView = (e: RadioChangeEvent) => {
        setShowRadio(e.target.value);
        const current_showRadio = e.target.value;
        if (modelValue == 1) {
            // paddle2onnx
            if (current_showRadio == 1) {
                // onnx view
                viewTranslated();
            } else {
                viewUserInput();
            }
        } else if (modelValue == 2) {
            // onnx2paddle
            if (current_showRadio == 0) {
                // paddle view
                viewTranslated();
            } else {
                viewUserInput();
            }
        }
    };
    const resetModel = () => {
        const Graphs: any = Graph?.current;
        Graphs.setnewfiles();
        setshowData(null);
        setConfigPage(true);
        setShowRadio(0);
        setflags(false);
        setLoadFiles2(false);
    };

    const onChange = (e: RadioChangeEvent) => {
        setModelValue(e.target.value);
        resetModel();
    };
    const downloadEvent = (baseId: number, fileName: string) => {
        setBaseId(baseId);
        setfile_names(fileName);
    };

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
                        height:
                            (modelValue == 1 && showRadio == 0) || (modelValue == 2 && showRadio == 1) || configPage
                                ? 'auto'
                                : '0px',
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
                        show={(modelValue == 1 && showRadio == 0) || (modelValue == 2 && showRadio == 1) || configPage}
                        changeFlags={setflags}
                        changeFiles2={(file: any) => {
                            setConfigPage(false);
                            setfiles2(file);
                            if (!showData && file) {
                                setshowData(file);
                            }
                        }}
                        changeLoading={(flag: any) => {
                            // do nothing.
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
                            <Radio.Group defaultValue={showRadio} onChange={changeView}>
                                <Radio.Button value={0}>Paddle</Radio.Button>
                                <Radio.Button value={1}>Onnx</Radio.Button>
                            </Radio.Group>
                        ) : (
                            <Radio.Group defaultValue={showRadio} onChange={changeView}>
                                <Radio.Button value={0}>Paddle</Radio.Button>
                                <Radio.Button value={1}>Onnx</Radio.Button>
                            </Radio.Group>
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
