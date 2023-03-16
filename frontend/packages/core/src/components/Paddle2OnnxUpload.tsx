/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {Form, Input, Radio, Select} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import type {UploadProps} from 'antd';
import Buttons from '~/components/Button';
import {message, Upload, Button} from 'antd';
import {fetcher, axios_fetcher} from '~/utils/fetch';
import {useTranslation} from 'react-i18next';
import {Progress, Space} from 'antd';

const {Option} = Select;
export default function xpaddleUploader(props: any) {
    const [form] = Form.useForm();
    const formLayout: any = {labelCol: {span: 4}, wrapperCol: {span: 14}};
    const {t} = useTranslation(['togglegraph', 'common']);
    const [convertProcess, setConvertProgress] = useState(0);
    const [convertProcessFlag, setconvertProcessFlag] = useState(false);
    const Uploadprops: UploadProps = {
        name: 'file',
        action: '',
        headers: {
            authorization: 'authorization-text'
        },
        onChange(info) {
            // debugger;
            if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        }
    };
    const LiteBackend = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const lite_model_type = ['onnxruntime', 'tensorrt', 'others'];

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
    const submodel = async () => {
        props.changeLoading(true);
        const values = await form.validateFields();
        // debugger;
        const formData = new FormData();

        const model_file_component = document.getElementById('upload_pd_model_file') as HTMLInputElement;
        const model_file = model_file_component!.files![0];
        const param_file_component = document.getElementById('upload_pd_param_file') as HTMLInputElement;
        const param_file = param_file_component!.files![0];

        formData.append('model', model_file);
        formData.append('param', param_file);
        formData.append('opset_version', values['opset_version']);
        formData.append('deploy_backend:', values['deployBackend']);

        axios_fetcher(
            `/inference/paddle2onnx/convert`,
            {
                method: 'POST',
                body: formData
            },
            {
                onDownloadProgress: function (axiosProgressEvent: any) {
                    setConvertProgress(Math.round(axiosProgressEvent.progress! * 100));
                    setconvertProcessFlag(true);
                }
            }
        )
            .then(
                (res: any) => {
                    const files2 = base64UrlToFile(res.model, 'model.onnx');
                    props.setFiles([model_file]);
                    props.changeFiles2([files2]);
                    const current_date = new Date();
                    const filename = `${current_date.getFullYear()}_${current_date.getMonth()}_${current_date.getDay()}_${current_date.getHours()}_${current_date.getMinutes()}_${current_date.getSeconds()}_onnxmodel.onnx`;
                    props.downloadEvent(res['request_id'], filename);
                },
                res => {
                    // debugger;
                    props.changeLoading(false);
                    console.log(res);
                }
            )
            .finally(() => {
                setconvertProcessFlag(false);
            });
    };
    return (
        <div>
            <div
                style={{
                    textAlign: 'center',
                    margin: '40px',
                    fontSize: '26px'
                }}
            >
                {t('togglegraph:Paddle2OnnxTitle')}
            </div>
            <Form
                // {...formItemLayout}
                layout={formLayout}
                form={form}
                initialValues={{layout: formLayout}}
                style={{maxWidth: 600}}
            >
                <Form.Item
                    label={t('togglegraph:pdmodels')}
                    name="model"
                    rules={[{required: true, message: t('isRequire')}]}
                >
                    <Input type="file" id="upload_pd_model_file" accept=".pdmodel" />
                </Form.Item>
                <Form.Item
                    label={t('togglegraph:pdiparams')}
                    name="param"
                    rules={[{required: true, message: t('isRequire')}]}
                >
                    <Input type="file" id="upload_pd_param_file" accept=".pdiparams" />
                </Form.Item>

                <Form.Item
                    label={t('togglegraph:opset_version')}
                    name="opset_version"
                    rules={[{required: false}]}
                    initialValue="11"
                >
                    <Select placeholder="Please select a version">
                        {LiteBackend.map((item: number) => {
                            return (
                                <Option value={item} key={item}>
                                    {item}
                                </Option>
                            );
                        })}
                    </Select>
                </Form.Item>
                <Form.Item
                    label={t('togglegraph:deploy_backend')}
                    name="deployBackend"
                    rules={[{required: false}]}
                    initialValue="onnxruntime"
                >
                    <Select placeholder="Please select a version">
                        {lite_model_type.map((item: string) => {
                            return (
                                <Option value={item} key={item}>
                                    {item}
                                </Option>
                            );
                        })}
                    </Select>
                </Form.Item>
            </Form>
            <div
                style={{
                    textAlign: 'center'
                }}
            >
                <Buttons
                    onClick={() => {
                        setConvertProgress(0);
                        setconvertProcessFlag(true);
                        submodel();
                    }}
                >
                    {t('togglegraph:Conversion')}
                </Buttons>
                {convertProcessFlag ? (
                    <Progress type="circle" className="processCircle" percent={convertProcess} />
                ) : null}
                {convertProcessFlag ? <h1> {t('togglegraph:converting')} </h1> : null}
            </div>
        </div>
    );
}
