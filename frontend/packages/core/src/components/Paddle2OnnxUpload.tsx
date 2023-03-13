/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import {Form, Input, Radio, Select} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import type {UploadProps} from 'antd';
import Buttons from '~/components/Button';
import {message, Upload, Button} from 'antd';
import {fetcher} from '~/utils/fetch';
import {useTranslation} from 'react-i18next';
import {Name} from './ProfilerPage/MemoryView/type';
const {Option} = Select;
export default function xpaddleUploader(props: any) {
    const [form] = Form.useForm();
    const formLayout: any = {labelCol: {span: 4}, wrapperCol: {span: 14}};
    const {t} = useTranslation(['togglegraph', 'common']);
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
    const createFileFromData = (fileData: any): any => {
        const {name, type, lastModified} = fileData;
        const reader = new FileReader();
        reader.readAsArrayBuffer(fileData.originFileObj);
        return new Promise<any>(resolve => {
            reader.onload = () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                const blob = new Blob([arrayBuffer], {type});
                const file = new File([blob], name, {type, lastModified});
                resolve(file);
            };
        });
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
    const submodel = async () => {
        props.changeLoading(true);
        const values = await form.validateFields();
        // debugger;
        const formData = new FormData();
        // // 将文件转二进制
        const files1 = await createFileFromData(values.model.file);
        const files2 = await createFileFromData(values.param.file);

        formData.append('opset_version', values.opset_version);
        formData.append('model', files1);
        formData.append('param', files2);
        formData.append('deploy_backend:', values['deployBackend']);
        // debugger;
        fetcher(`/inference/paddle2onnx/convert`, {
            method: 'POST',
            body: formData
        }).then(
            (res: any) => {
                // debugger;
                // console.log(res);

                const reader = new FileReader();
                reader.readAsArrayBuffer(values.model.file.originFileObj);
                reader.onload = event => {
                    const results: any = event?.target?.result;
                    const file = new File([results], values.model.file.name, {
                        type: values.model.file.type,
                        lastModified: values.model.file.lastModified
                    });
                    // console.log("New file created:", file);
                    // debugger;
                    // const files2 = [new File([res.data], res.filename || 'unknown_model')];
                    // const Name =
                    const files2 = base64UrlToFile(res.model, 'name.onnx');
                    // debugger;
                    props.setFiles([files2]);
                    props.changeFiles2([file]);
                    // props.downloadEvent(res['request_id'], res.filename);
                    props.downloadEvent(res['request_id'], 'name.onnx');
                };
            },
            res => {
                // debugger;
                props.changeLoading(false);
                console.log(res);
            }
        );
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
                    <Upload {...Uploadprops} maxCount={1}>
                        <Button icon={<UploadOutlined />}>{t('togglegraph:Please')}</Button>
                    </Upload>
                </Form.Item>
                <Form.Item
                    label={t('togglegraph:pdiparams')}
                    name="param"
                    rules={[{required: true, message: t('isRequire')}]}
                >
                    <Upload {...Uploadprops} maxCount={1}>
                        <Button icon={<UploadOutlined />}>{t('togglegraph:Please')}</Button>
                    </Upload>
                </Form.Item>

                <Form.Item
                    label={t('togglegraph:opset_version')}
                    name="opset_version"
                    rules={[{required: true, message: t('isRequire')}]}
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
                    rules={[{required: true, message: t('isRequire')}]}
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
                {/* <Form.Item>
                            <Button type="primary">Submit</Button>
                        </Form.Item> */}
            </Form>
            <Buttons
                onClick={() => {
                    submodel();
                }}
            >
                {t('togglegraph:Conversion')}
            </Buttons>
        </div>
    );
}
