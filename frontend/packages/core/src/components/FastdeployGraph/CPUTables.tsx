import {Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {FunctionComponent, useEffect, useState} from 'react';

interface DataType {
    key: string;
    name: string;
    money: string;
    address: string;
}

const columns: ColumnsType<DataType> = [
    {
        title: 'GPU',
        dataIndex: 'name',
        key: 'name',
        width: 100,
        fixed: 'left'
    },
    {
        title: '性能指标',
        children: [
            {
                title: '利用率(%)',
                dataIndex: 'nv_gpu_utilization',
                key: 'nv_gpu_utilization',
                width: 150
            },
            {
                title: '功率(W)',
                dataIndex: 'nv_gpu_power_usage',
                key: 'nv_gpu_power_usage',
                width: 150
            },
            {
                title: '功率限制(W)',
                dataIndex: 'nv_gpu_power_limit',
                key: 'nv_gpu_power_limit',
                width: 150
            }
        ]
    },
    {
        title: '显存',
        children: [
            {
                title: '总量(GB)',
                dataIndex: 'nv_gpu_memory_total_bytes',
                key: 'nv_gpu_memory_total_bytes',
                width: 150
            },
            {
                title: '已使用(GB)',
                dataIndex: 'nv_gpu_memory_used_bytes',
                key: 'nv_gpu_memory_used_bytes',
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
    }, [Datas]);
    return <Table columns={columns} dataSource={tabelData} bordered pagination={false} />;
};

export default App;
