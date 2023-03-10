/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import {Form, Input, Radio, Select} from 'antd';
import {UploadOutlined} from '@ant-design/icons';
import type {UploadProps} from 'antd';
import Buttons from '~/components/Button';
import {fetcher} from '~/utils/fetch';
import {message, Upload, Button} from 'antd';
const {Option} = Select;
export default function xpaddleUploader(props: any) {
    const [form] = Form.useForm();
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
    const lite_model_type = ['protobuf', 'naive_buffer'];
    const submodel = async () => {
        const values = await form.validateFields();
        // debugger;
        const formData = new FormData();
        // // 将文件转二进制
        formData.append('convert_to_lite', values.convertToLite);
        formData.append('model', values.model.file);
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
                    const results: any = event?.target?.result;
                    const file = new File([results], values.model.file.name, {
                        type: values.model.file.type,
                        lastModified: values.model.file.lastModified
                    });
                    // console.log("New file created:", file);
                    const files2 = [new File([res.data], res.filename || 'unknown_model')];
                    // debugger;
                    props.setFiles([file]);
                    props.changeFiles2(files2);
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
                Onnx2Paddle模型转换配置
            </div>
            <Form
                // {...formItemLayout}
                layout={formLayout}
                form={form}
                initialValues={{layout: formLayout}}
                style={{maxWidth: 600}}
            >
                <Form.Item label="模型" name="model" rules={[{required: true, message: '该项为必填项目'}]}>
                    <Upload {...Uploadprops} maxCount={1}>
                        <Button icon={<UploadOutlined />}>请选择文件</Button>
                    </Upload>
                </Form.Item>
                <Form.Item
                    name="convertToLite"
                    label="转换Paddle-Lite支持格式"
                    rules={[{required: true, message: '该项为必填项目'}]}
                >
                    <Radio.Group>
                        <Radio value="a">是</Radio>
                        <Radio value="b">否</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item
                    label="Lite后端"
                    name="liteValidPlaces"
                    rules={[{required: true, message: '该项为必填项目'}]}
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
                <Form.Item label="Lite格式" name="liteModelType" rules={[{required: true, message: '该项为必填项目'}]}>
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
                转换
            </Buttons>
        </div>
    );
}
