/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import {Form, Input, Radio, Select} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import type {UploadProps} from 'antd';
import Buttons from '~/components/Button';
import {fetcher} from '~/utils/fetch';
import {message, Upload, Button} from 'antd';
import {useTranslation} from 'react-i18next';
const {Option} = Select;
export default function xpaddleUploader(props: any) {
    const [form] = Form.useForm();
    const {t} = useTranslation(['togglegraph', 'common']);
    const formLayout: any = {labelCol: {span: 4}, wrapperCol: {span: 14}};
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
    const LiteBackend = [
        'arm',
        'opencl',
        'x86',
        'metal',
        'xpu',
        'bm',
        'mlu',
        'intel_fpga',
        'huawei_ascend_npu',
        'imagination_nna',
        'rockchip_npu',
        ' mediatek_apu',
        'huawei_kirin_npu',
        'amlogic_npu'
    ];
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

    const lite_model_type = ['protobuf', 'naive_buffer'];
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
        const values = await form.validateFields();
        const formData = new FormData();
        // // 将文件转二进制
        const files1 = await createFileFromData(values.model.file);
        // debugger;
        formData.append('convert_to_lite', values.convertToLite);
        formData.append('model', files1);
        formData.append('lite_valid_places', values.liteValidPlaces);
        formData.append('lite_model_type:', values.liteModelType);
        fetcher(`/inference/onnx2paddle/convert`, {
            method: 'POST',
            body: formData
        }).then(
            (res: any) => {
                const reader = new FileReader();
                reader.readAsArrayBuffer(values.model.file.originFileObj);
                reader.onload = event => {
                    debugger;
                    const results: any = event?.target?.result;
                    const file = new File([results], values.model.file.name, {
                        type: values.model.file.type,
                        lastModified: values.model.file.lastModified
                    });
                    // console.log("New file created:", file);
                    // const files2 = [new File([res.data], res.filename || 'unknown_model')];
                    const files2 = base64UrlToFile(res.pdmodel, 'name');
                    debugger;
                    props.setFiles([file]);
                    props.changeFiles2(files2);
                    // props.setFiles([file]);
                    // props.changeFiles2(files2);
                    props.downloadEvent(res['request_id'], res.filename);
                };
            },
            res => {
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
                {t('togglegraph:Onnx2PaddleTitle')}
            </div>
            <Form
                // {...formItemLayout}
                layout={formLayout}
                form={form}
                initialValues={{layout: formLayout}}
                style={{maxWidth: 600}}
            >
                <Form.Item label="模型" name="model" rules={[{required: true, message: t('isRequire')}]}>
                    <Upload {...Uploadprops} maxCount={1}>
                        <Button icon={<UploadOutlined />}>{t('togglegraph:Please')}</Button>
                    </Upload>
                </Form.Item>
                <Form.Item
                    name="convertToLite"
                    label={t('togglegraph:convert_to_lite')}
                    rules={[{required: true, message: t('isRequire')}]}
                >
                    <Radio.Group>
                        <Radio value="a">{t('togglegraph:isYes')}</Radio>
                        <Radio value="b">{t('togglegraph:isNo')}</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item
                    label={t('togglegraph:deploy_backend')}
                    name="liteValidPlaces"
                    rules={[{required: true, message: t('isRequire')}]}
                >
                    <Select placeholder="Please select a country">
                        {LiteBackend.map((item: string) => {
                            return (
                                <Option value={item} key={item}>
                                    {item}
                                </Option>
                            );
                        })}
                    </Select>
                </Form.Item>
                <Form.Item
                    label={t('togglegraph:lite_model_type')}
                    name="liteModelType"
                    rules={[{required: true, message: t('isRequire')}]}
                >
                    <Select placeholder="Please select a country">
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
                {t('Conversion')}
            </Buttons>
        </div>
    );
}
