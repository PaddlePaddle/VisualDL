import React, {useState, useEffect, useRef, useCallback} from 'react';
import ReactDOM from 'react-dom';
import {KeepAlive, AliveScope} from 'react-activation';
import {WithStyled, contentHeight, contentMargin, rem, headerHeight, position, transitionProps} from '~/utils/style';
import {fetcher} from '~/utils/fetch';
import GraphStatic from '~/pages/graphStatic';
import GraphStatic2 from '~/pages/graphStatic2';
import styled from 'styled-components';
const ButtonContent = styled.section`
    display: flex;
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
    background-color: #2932e1;
    color: white;
    font-size: 16px;
`;

const Aside = styled.aside`
    width: ${rem(260)};
    display: flex;
`;
function App() {
    const [show, setShow] = useState(true);
    const [show2, setShow2] = useState(false);
    const [showData, setshowData] = useState(false);
    // const [data, setData] = useState();
    const [names, setNames] = useState('');

    const [filesId, setFilesId] = useState(0);
    const file = useRef<HTMLInputElement>(null);
    const Graph = useRef(null);
    const Graph2 = useRef(null);
    // useEffect(() => {
    //     setShow2(false);
    // }, []);
    const base64ToFile = base64Str => {
        //将base64转换为blob
        const dataURLtoBlob = function (dataurl) {
            const arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                u8arr = new Uint8Array(n);
            let n = bstr.length;
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], {type: mime});
        };
        //将blob转换为file
        const blobToFile = function (theBlob, fileName) {
            theBlob.lastModifiedDate = new Date();
            theBlob.name = fileName;
            return new window.File([theBlob], theBlob.name, {type: theBlob.type});
        };
        //调用
        const blob = dataURLtoBlob(base64Str);
        const file = blobToFile(blob, Math.random().toString(36).substr(2));

        return file;
    };
    const fileUploader = (files: FileList, formats = 'prototxt') => {
        const formData = new FormData();
        // 将文件转二进制
        formData.append('file', files[0]);
        formData.append('filename', files[0].name);
        fetcher(`/deploy/convert?format=${formats}`, {
            method: 'POST',
            body: formData
        }).then(
            res => {
                // debugger
                // const newFilesId = filesId + 1;
                // setFilesId(newFilesId);
                // setshowData(res);
                // const file = base64ToFile(res.pdmodel);
                // Graph2?.current?.setModelFile(file);
            },
            res => {
                // debugger
                // const newFilesId = filesId + 1;
                // setFilesId(newFilesId);
            }
        );
    };
    const onClickFile = useCallback(() => {
        // 这里为.prototxt, 用户点击转换按钮，弹出提示框，
        // 『请将模型描述文件.prototxt和参数文件.caffemodel打包成.tar上传』。
        // 弹出文件选择框，让用户重新进行选择.tar文件上传。
        console.log('Graph.current.filess', Graph);
        const files: FileList | null = Graph?.current?.files as FileList;
        const name = files[0].name.split('.')[1];
        if (name === 'prototxt') {
            alert('该页面只能解析paddle的模型,如需解析请跳转网络结构静态图页面');
            if (file.current) {
                file.current.value = '';
                file.current.click();
            }
            return;
        }
        if (name === 'pb' || name === 'onnx') {
            // fileUploader(files, name);
            setshowData(true);
            setShow2(true);
            return;
        }
        alert('该页面暂只能转换pb,onnx,prototxt,模型，请见谅');
        // if (file.current) {
        //     file.current.value = '';
        //     file.current.click();
        // }
        // 用户上传的文件为.pb和.onnx格式，直接发动转换数据 //fileUploader
    }, []);

    // const setModelFile = useCallback((f: FileList | File[]) => {
    //     // storeDispatch(actions.graph.setModel(f));
    //     // setFiles(f);
    //     //setshowData
    //     console.log('得到数据', f);
    // }, []);
    const onChangeFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target;
        if (target && target.files && target.files.length) {
            // setModelFile(target.files);
            //『请将模型描述文件.prototxt和参数文件.caffemodel打包成.tar上传』。
            //fileUploader
            fileUploader(target.files);
        }
    }, []);
    useEffect(() => {
        if (showData) {
            console.log('Graph2', Graph2);
            debugger;
            Graph2?.current?.setModelFiles(Graph?.current?.files);
            // setTimeout(() => {
            //     setShow(false);
            // }, 1000);
        }
    }, [showData]);
    return (
        <>
            <div
                style={{
                    display: show ? 'block' : 'none'
                }}
            >
                <GraphStatic ref={Graph} changeName={setNames} />
            </div>
            {showData && (
                <div
                    style={{
                        display: show2 ? 'block' : 'none'
                    }}
                >
                    <GraphStatic2 ref={Graph2} />
                </div>
            )}
            <ButtonContent style={{marginTop: '20px'}}>
                <Article>
                    <Buttons
                        style={{marginRight: '3px'}}
                        onClick={() => {
                            setShow(show => !show);
                            setShow2(show2 => !show2);
                        }}
                    >
                        {names ? names : 'Toggle'}
                    </Buttons>
                    <Buttons
                        onClick={() => {
                            setShow(show => !show);
                            setShow2(show2 => !show2);
                        }}
                    >
                        Toggle2
                    </Buttons>
                </Article>
                <Aside>
                    <Buttons style={{marginRight: '3px'}} onClick={onClickFile}>
                        转换
                    </Buttons>
                    <Buttons>下载</Buttons>
                </Aside>
            </ButtonContent>
            <input
                ref={file}
                type="file"
                multiple={false}
                onChange={onChangeFile}
                style={{
                    display: 'none'
                }}
            />
        </>
    );
}
export default App;
