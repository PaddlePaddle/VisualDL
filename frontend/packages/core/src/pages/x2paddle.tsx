import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {rem, primaryColor, size} from '~/utils/style';
import Content from '~/components/Content';
import {toast} from 'react-toastify';
import {fetcher} from '~/utils/fetch';
import GraphStatic from '~/pages/graphStatic';
import GraphStatic2 from '~/pages/graphStatic2';
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
type Fn = (data: FcResponse<any>) => unknown;

interface IAnyObj {
    [index: string]: unknown;
}

interface FcResponse<T> {
    errno: string;
    errmsg: string;
    data: T;
}
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
    const [showData, setshowData] = useState<any>(null);
    const [baseId, setBaseId] = useState<any>(false);
    const [loading, setLoading] = useState<any>(false);
    const [file_names, setfile_names] = useState<any>(false);
    const [names, setNames] = useState('');

    const file = useRef<HTMLInputElement>(null);
    const Graph = useRef(null);
    const Graph2 = useRef(null);
    // 创建 axios 实例
    const blobToFile = function (theBlob: any, fileName: any, type: any) {
        theBlob.lastModifiedDate = new Date();
        theBlob.name = fileName;
        return new window.File([theBlob], theBlob.name, {type: type});
    };
    const base64UrlToFile = (base64Url: any, filename: any) => {
        // const arr = base64Url.split(',');
        // const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(base64Url);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename);
    };
    const downloadEvt = (url: any, fileName = '未知文件') => {
        const el = document.createElement('a');
        el.style.display = 'none';
        el.setAttribute('target', '_blank');
        /**
         * download的属性是HTML5新增的属性
         * href属性的地址必须是非跨域的地址，如果引用的是第三方的网站或者说是前后端分离的项目(调用后台的接口)，这时download就会不起作用。
         * 此时，如果是下载浏览器无法解析的文件，例如.exe,.xlsx..那么浏览器会自动下载，但是如果使用浏览器可以解析的文件，比如.txt,.png,.pdf....浏览器就会采取预览模式
         * 所以，对于.txt,.png,.pdf等的预览功能我们就可以直接不设置download属性(前提是后端响应头的Content-Type: application/octet-stream，如果为application/pdf浏览器则会判断文件为 pdf ，自动执行预览的策略)
         */
        fileName && el.setAttribute('download', fileName);
        const href = URL.createObjectURL(url);
        el.href = href;
        console.log(el, href);
        document.body.appendChild(el);
        el.click();
        document.body.removeChild(el);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fileUploader = (files: FileList, formats = 'caffe') => {
        if (!files) {
            toast.warning('请上传模型文件模型文件');
            return;
        }
        setLoading(true);
        const formData = new FormData();
        // // 将文件转二进制
        formData.append('file', files[0]);
        formData.append('filename', files[0].name);
        formData.append('format', formats);
        fetcher(`/inference/convert?format=${formats}`, {
            method: 'POST',
            body: formData
        }).then(
            (res: any) => {
                // debugger
                const name2: string = files[0].name.substring(files[0].name.lastIndexOf('.') + 1) + '.paddle';
                console.log('res', res, name2);
                const file = base64UrlToFile(res.pdmodel, name2);
                console.log('file', file);
                setshowData(file);
                setBaseId(res.request_id);
                const name3 = files[0].name.substring(0, files[0].name.lastIndexOf('.'));
                setfile_names(name3 + '.tar');
                setLoading(false);
            },
            res => {
                // debugger
                setLoading(false);
                // const newFilesId = filesId + 1;
                // setFilesId(newFilesId);
            }
        );
        // fetcher('/graph/graph').then((res: any) => {
        //     console.log('res', res);
        //     setTimeout(() => {
        //         // const file = blobToFile(res.data, res.filename, res.type);
        //         const file = blobToFile(res.data, res.filename, res.type);
        //         console.log('bolbfile', file);
        //         downloadEvt(res.data, res.filename);
        //         setshowData(file);
        //         setLoading(false);
        //     }, 5000);
        //     // setShow2(true);
        // });
    };
    const onClickFile = useCallback(() => {
        // 这里为.prototxt, 用户点击转换按钮，弹出提示框，
        // 『请将模型描述文件.prototxt和参数文件.caffemodel打包成.tar上传』。
        // 弹出文件选择框，让用户重新进行选择.tar文件上传。
        if (showData) {
            // toast.warning('模型文件已转换，请勿再次点击');
            toast.warning(t('warin-info6'));
            return;
        }
        console.log('Graph.current.filess', Graph);
        const Graphs: any = Graph;
        const files: FileList | null = Graphs?.current?.files as FileList;
        const name = files[0].name.substring(files[0].name.lastIndexOf('.') + 1);
        if (name === 'prototxt') {
            toast.warning(t('togglegraph:warin-info'));
            if (file.current) {
                file.current.value = '';
                file.current.click();
            }
            return;
        }
        if (name === 'pb' || name === 'onnx') {
            fileUploader(files, name);
            return;
        }
        // toast.warning('该模型文件暂不支持X2Paddle转换');
        toast.warning(t('togglegraph:warin-info2'));
        // 用户上传的文件为.pb和.onnx格式，直接发动转换数据 //fileUploader
    }, [fileUploader, showData, t]);
    const onChangeFile = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const target = e.target;
            if (target && target.files && target.files.length) {
                fileUploader(target.files);
            }
        },
        [fileUploader]
    );
    //将base64转换为blob
    const dataURLtoBlob = (base64Url: any) => {
        const bstr = atob(base64Url);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr]);
    };
    // * desc: 下载方法
    // * @param url  ：返回数据的blob对象或链接
    // * @param fileName  ：下载后文件名标记
    // const downloadFile = (url: any, name = "What's the fuvk") => {
    //     const a = document.createElement('a');
    //     a.setAttribute('href', url);
    //     a.setAttribute('download', name);
    //     a.click();
    // };
    const downloadFileByBase64 = (baseId: any, fileName: string) => {
        console.log('baseId', baseId, fileName);

        if (baseId === undefined || !fileName) return;
        setLoading(true);
        fetcher(`/inference/download?request_id=${baseId}`, {
            method: 'GET'
        }).then(
            (res: any) => {
                console.log('blobres', res, res.data);
                downloadEvt(res.data, fileName);
                setLoading(false);
            },
            res => {
                setLoading(false);
            }
        );
    };
    useEffect(() => {
        // const Graphs: any = Graph;
        const Graphs2: any = Graph2;
        if (showData) {
            console.log('Graph2', showData);
            const files = [showData];
            Graphs2?.current?.setModelFiles(files);
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
    return (
        <Content>
            {loading && (
                <Loading>
                    <HashLoader size="60px" color={primaryColor} />
                </Loading>
            )}
            <Contents
                style={{
                    height: !loading ? 'auto' : '0px',
                    overflow: 'hidden'
                }}
            >
                <div
                    style={{
                        height: show.show ? 'auto' : '0px',
                        // opacity: show2 ? 1 : 0
                        overflowY: 'hidden'
                    }}
                >
                    <GraphStatic
                        ref={Graph}
                        changeName={setNames}
                        show={show.show}
                        changeshowdata={() => {
                            setshowData(null);
                        }}
                        Xpaddlae={true}
                    />
                </div>
                {Graphs2}
            </Contents>

            {names && !loading && (
                <ButtonContent style={{marginTop: '20px'}}>
                    <Article>
                        <Buttons
                            style={{marginRight: '3px'}}
                            className={show.show ? 'active' : 'un_active'}
                            onClick={() => {
                                setShow({
                                    show: true,
                                    show2: false
                                });
                            }}
                        >
                            {names ? names : 'Toggle'}
                        </Buttons>
                        <Buttons
                            className={!showData ? 'disabled' : show.show2 ? 'active' : 'un_active'}
                            onClick={() => {
                                if (!showData) {
                                    // toast.warning('请先进行转换,再查看');
                                    toast.warning(t('warin-info3'));
                                    return;
                                }
                                setShow({
                                    show: false,
                                    show2: true
                                });
                            }}
                        >
                            paddle
                        </Buttons>
                    </Article>
                    <Aside>
                        <Buttons
                            style={{marginRight: '3px'}}
                            className={!showData && names ? 'active' : 'disabled'}
                            onClick={() => {
                                if (showData) {
                                    toast.warning(t('warin-info4'));
                                    // toast.warning('模型已转换,请勿再次点击');
                                    return;
                                } else {
                                    if (!names) {
                                        toast.warning(t('warin-info7'));
                                    } else {
                                        onClickFile();
                                    }
                                }
                            }}
                        >
                            {t('togglegraph:transformation')}
                        </Buttons>
                        <Buttons
                            className={showData ? 'active' : 'disabled'}
                            onClick={() => {
                                console.log('showData', showData);
                                if (!showData) {
                                    // toast.warning('请上传模型文件并转换');
                                    toast.warning(t('warin-info5'));
                                    return;
                                }
                                downloadFileByBase64(baseId, file_names);
                            }}
                        >
                            {t('togglegraph:download')}
                        </Buttons>
                    </Aside>
                </ButtonContent>
            )}
            <input
                ref={file}
                type="file"
                multiple={false}
                onChange={onChangeFile}
                style={{
                    display: 'none'
                }}
            />
        </Content>
    );
}
export default App;
