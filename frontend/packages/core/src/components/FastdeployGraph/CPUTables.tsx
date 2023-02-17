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
    const {t} = useTranslation(['Fastdeploy']);
    const columns: ColumnsType<DataType> = [
        {
            title: t('Fastdeploy:Device-name'),
            dataIndex: 'name',
            key: 'name',
            width: 100,
            fixed: 'left'
        },
        {
            title: t('Fastdeploy:Performance-metric'),
            children: [
                {
                    title: `${t('Fastdeploy:utilization')}(%)`,
                    dataIndex: 'nv_gpu_utilization',
                    key: 'nv_gpu_utilization',
                    width: 150
                },
                {
                    title: `${t('Fastdeploy:power-usage')}(W)`,
                    dataIndex: 'nv_gpu_power_usage',
                    key: 'nv_gpu_power_usage',
                    width: 150
                },
                {
                    title: `${t('Fastdeploy:power-limit')}(W)`,
                    dataIndex: 'nv_gpu_power_limit',
                    key: 'nv_gpu_power_limit',
                    width: 150
                },
                {
                    title: `${t('Fastdeploy:energy-consumption')}(W)`,
                    dataIndex: 'nv_energy_consumption',
                    key: 'nv_energy_consumption',
                    width: 150
                }
            ]
        },
        {
            title: t('Fastdeploy:Memory'),
            children: [
                {
                    title: `${t('Fastdeploy:total')}(GB)`,
                    dataIndex: 'nv_gpu_memory_total_bytes',
                    key: 'nv_gpu_memory_total_bytes',
                    width: 150
                },
                {
                    title: `${t('Fastdeploy:used')}(GB)`,
                    dataIndex: 'nv_gpu_memory_used_bytes',
                    key: 'nv_gpu_memory_used_bytes',
                    width: 150
                }
            ]
        }
    ];
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
