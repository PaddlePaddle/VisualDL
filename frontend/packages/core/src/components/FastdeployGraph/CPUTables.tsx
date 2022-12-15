import {Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React, {FunctionComponent, useEffect, useState} from 'react';

interface DataType {
    key: string;
    name: string;
    money: string;
    address: string;
}

const data: DataType[] = [
    {
        key: '1',
        name: 'John Brown',
        money: '￥300,000.00',
        address: 'New York No. 1 Lake Park'
    },
    {
        key: '2',
        name: 'Jim Green',
        money: '￥1,256,000.00',
        address: 'London No. 1 Lake Park'
    },
    {
        key: '3',
        name: 'Joe Black',
        money: '￥120,000.00',
        address: 'Sidney No. 1 Lake Park'
    }
];
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
                title: '利用率',
                dataIndex: 'nv_gpu_utilization',
                key: 'nv_gpu_utilization',
                width: 150
            },
            {
                title: '功率',
                dataIndex: 'nv_gpu_power_usage',
                key: 'nv_gpu_power_usage',
                width: 150
            },
            {
                title: '功率限制',
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
                title: '总量',
                dataIndex: 'nv_gpu_memory_total_bytes',
                key: 'nv_gpu_memory_total_bytes',
                width: 150
            },
            {
                title: '已使用',
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
