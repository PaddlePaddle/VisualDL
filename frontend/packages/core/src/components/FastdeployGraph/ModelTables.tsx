import {Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {FunctionComponent, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
interface DataType {
    key: string;
    name: string;
    money: string;
    address: string;
}

const columns: ColumnsType<DataType> = [
    {
        title: '模型名称',
        dataIndex: 'name',
        key: 'name',
        width: 100,
        fixed: 'left'
    },
    {
        title: '执行统计',
        children: [
            {
                title: '请求处理成功数',
                dataIndex: 'nv_inference_request_success',
                key: 'nv_inference_request_success',
                width: 150
            },
            {
                title: '请求处理失败数',
                dataIndex: 'nv_inference_request_failure',
                key: 'nv_inference_request_failure',
                width: 150
            },
            {
                title: '推理batch数',
                dataIndex: 'nv_inference_count',
                key: 'nv_inference_count',
                width: 150
            },
            {
                title: '推理样本数',
                dataIndex: 'nv_inference_exec_count',
                key: 'nv_inference_exec_count',
                width: 150
            }
        ]
    },
    {
        title: '延迟统计',
        children: [
            {
                title: '请求处理时间(ms)',
                dataIndex: 'nv_inference_request_duration_us',
                key: 'nv_inference_request_duration_us',
                width: 150
            },
            {
                title: '任务队列等待时间(ms)',
                dataIndex: 'nv_inference_queue_duration_us',
                key: 'nv_inference_queue_duration_us',
                width: 150
            },
            {
                title: '输入处理时间(ms)',
                dataIndex: 'nv_inference_compute_input_duration_us',
                key: 'nv_inference_compute_input_duration_us',
                width: 150
            },
            {
                title: '模型推理时间(ms)',
                dataIndex: 'nv_inference_compute_infer_duration_us',
                key: 'nv_inference_compute_infer_duration_us',
                width: 150
            },
            {
                title: '输出处理时间(ms)',
                dataIndex: 'nv_inference_compute_output_duration_us',
                key: 'nv_inference_compute_output_duration_us',
                width: 150
            }
        ]
    }
];
type ArgumentProps = {
    Datas: any;
};
const App: FunctionComponent<ArgumentProps> = ({Datas}) => {
    const [tabelData, setTabelData] = useState<any>();
    const {t} = useTranslation(['Fastdeploy']);
    useEffect(() => {
        if (!Datas) {
            return;
        }
        const arrays = Object.keys(Datas);
        const data = arrays.map((name: string) => {
            const model = Datas[name];

            return {
                ...model,
                key: name,
                name: name
            };
        });
        setTabelData(data);
        // for (let i = 0; i < 100; i++) {
        //   data.push({
        //     key: i,
        //     name: 'John Brown',
        //     age: i + 1,
        //     street: 'Lake Park',
        //     building: 'C',
        //     number: 2035,
        //     companyAddress: 'Lake Street 42',
        //     companyName: 'SoftLake Co',
        //     gender: 'M',
        //   });
    }, [Datas]);
    return <Table columns={columns} dataSource={tabelData} bordered pagination={false} />;
};

export default App;
