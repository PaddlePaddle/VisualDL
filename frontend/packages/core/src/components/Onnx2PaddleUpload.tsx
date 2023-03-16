/* eslint-disable react-hooks/rules-of-hooks */

import React, {useState} from 'react';
import {Form, Input, Radio, Select} from 'antd';
import type {UploadProps} from 'antd';
import Buttons from '~/components/Button';
import {axios_fetcher} from '~/utils/fetch';
import {message} from 'antd';
import {useTranslation} from 'react-i18next';
import {Progress} from 'antd';

const {Option} = Select;
export default function xpaddleUploader(props: any) {
    const [form] = Form.useForm();
    const {t} = useTranslation(['togglegraph', 'common']);
    const formLayout: any = {labelCol: {span: 4}, wrapperCol: {span: 14}};
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
        'mediatek_apu',
        'huawei_kirin_npu',
        'amlogic_npu'
    ];

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
        props.changeLoading(true);
        const values = await form.validateFields();
        const formData = new FormData();
        const onnx_file_component = document.getElementById('upload_onnx_model_file') as HTMLInputElement;
        const onnx_file = onnx_file_component!.files![0];
        formData.append('convert_to_lite', values.convertToLite);
        formData.append('model', onnx_file);
        formData.append('lite_valid_places', values.liteValidPlaces);
        formData.append('lite_model_type:', values.liteModelType);

        axios_fetcher(
            `/inference/onnx2paddle/convert`,
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
                    const files2 = base64UrlToFile(res.model, 'model.pdmodel');
                    props.setFiles([onnx_file]);
                    props.changeFiles2([files2]);

                    const current_date = new Date();
                    const filename = `${current_date.getFullYear()}_${current_date.getMonth()}_${current_date.getDay()}_${current_date.getHours()}_${current_date.getMinutes()}_${current_date.getSeconds()}_paddlemodel.tar`;
                    props.downloadEvent(res['request_id'], filename);
                },
                res => {
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
                {t('togglegraph:Onnx2PaddleTitle')}
            </div>
            <Form layout={formLayout} form={form} initialValues={{layout: formLayout}} style={{maxWidth: 600}}>
                <Form.Item
                    label={t('togglegraph:model')}
                    name="model"
                    rules={[{required: true, message: t('isRequire')}]}
                >
                    <Input type="file" id="upload_onnx_model_file" accept=".onnx" />
                </Form.Item>
                <Form.Item
                    name="convertToLite"
                    label={t('togglegraph:convert_to_lite')}
                    rules={[{required: true, message: t('isRequire')}]}
                    initialValue="no"
                >
                    <Radio.Group>
                        <Radio value="yes">{t('togglegraph:isYes')}</Radio>
                        <Radio value="no">{t('togglegraph:isNo')}</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item
                    label={t('togglegraph:lite_valid_places')}
                    name="liteValidPlaces"
                    rules={[{required: false}]}
                    initialValue="arm"
                >
                    <Select placeholder="Please select a lite place">
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
                    rules={[{required: false}]}
                    initialValue="naive_buffer"
                >
                    <Select placeholder="Please select a lite model type">
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
                    {t('Conversion')}
                </Buttons>
                {convertProcessFlag ? <Progress type="circle" percent={convertProcess} /> : null}
                {convertProcessFlag ? <h1> {t('togglegraph:converting')} </h1> : null}
            </div>
        </div>
    );
}
