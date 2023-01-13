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

type ArgumentProps = {
    Datas: any;
};
const App: FunctionComponent<ArgumentProps> = ({Datas}) => {
    const [tabelData, setTabelData] = useState<any>();
    const {t} = useTranslation(['Fastdeploy']);
    const columns: ColumnsType<DataType> = [
        {
            title: t('Fastdeploy:Model-name'),
            dataIndex: 'name',
            key: 'name',
            width: 100,
            fixed: 'left'
        },
        {
            title: t('Fastdeploy:Execution-metric'),
            children: [
                {
                    title: t('Fastdeploy:inference-request-success'),
                    dataIndex: 'nv_inference_request_success',
                    key: 'nv_inference_request_success',
                    width: 150
                },
                {
                    title: t('Fastdeploy:inference-request-failure'),
                    dataIndex: 'nv_inference_request_failure',
                    key: 'nv_inference_request_failure',
                    width: 150
                },
                {
                    title: t('Fastdeploy:inference-count'),
                    dataIndex: 'nv_inference_count',
                    key: 'nv_inference_count',
                    width: 150
                },
                {
                    title: t('Fastdeploy:inference-exec-count'),
                    dataIndex: 'nv_inference_exec_count',
                    key: 'nv_inference_exec_count',
                    width: 150
                }
            ]
        },
        {
            title: t('Fastdeploy:Delay-metric'),
            children: [
                {
                    title: `${t('Fastdeploy:inference-request-duration')}(ms)`,
                    dataIndex: 'nv_inference_request_duration_us',
                    key: 'nv_inference_request_duration_us',
                    width: 150
                },
                {
                    title: `${t('Fastdeploy:inference-queue-duration')}(ms)`,
                    dataIndex: 'nv_inference_queue_duration_us',
                    key: 'nv_inference_queue_duration_us',
                    width: 150
                },
                {
                    title: `${t('Fastdeploy:inference-comput-input-duration')}(ms)`,
                    dataIndex: 'nv_inference_compute_input_duration_us',
                    key: 'nv_inference_compute_input_duration_us',
                    width: 150
                },
                {
                    title: `${t('Fastdeploy:inference-compute-infer-duration')}(ms)`,
                    dataIndex: 'nv_inference_compute_infer_duration_us',
                    key: 'nv_inference_compute_infer_duration_us',
                    width: 150
                },
                {
                    title: `${t('Fastdeploy:inference-compute-output-duration')}(ms)`,
                    dataIndex: 'nv_inference_compute_output_duration_us',
                    key: 'nv_inference_compute_output_duration_us',
                    width: 150
                }
            ]
        }
    ];
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
