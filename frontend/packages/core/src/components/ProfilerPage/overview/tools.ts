import type {ColumnsType} from 'antd/lib/table';
import {useTranslation} from 'react-i18next';
export interface DataType {
    name: string;
    calls: number;
    total_time: number;
    max_time: number;
    min_time: number;
    avg_time: number;
    ratio: number;
    GPUtotal_time: number;
    GPUmax_time: number;
    GPUmin_time: number;
    GPUavg_time: number;
    GPUratio: number;
}
export interface DataType2 {
    name: string;
    calls: number;
    cpu_total_time: number;
    cpu_avg_time: number;
    cpu_max_time: number;
    cpu_min_time: number;
    cpu_ratio: number;
    gpu_total_time: number;
    gpu_avg_time: number;
    gpu_max_time: number;
    gpu_min_time: number;
    gpu_ratio: number;
}
export const ConsumingColumns = (units: string, hasGpu: boolean) => {
    const {t} = useTranslation(['profiler', 'common']);
    const columns: ColumnsType<DataType> = [
        {
            title: t('stage'),
            dataIndex: 'name',
            key: 'name',
            width: 100
            // fixed: 'left',
        },
        {
            title: t('number-calls'),
            dataIndex: 'calls',
            key: 'calls',
            width: 100,
            sorter: (a, b) => a.calls - b.calls
        },
        {
            title: 'CPU',
            children: [
                {
                    title: t('total-time') + `(${units})`,
                    dataIndex: 'total_time',
                    key: 'total_time',
                    width: 150,
                    sorter: (a, b) => a.total_time - b.total_time
                },
                {
                    title: t('average-time') + `(${units})`,
                    dataIndex: 'avg_time',
                    key: 'avg_time',
                    width: 150,
                    sorter: (a, b) => a.avg_time - b.avg_time
                },
                {
                    title: t('longest-time') + `(${units})`,
                    dataIndex: 'max_time',
                    key: 'max_time',
                    width: 150,
                    sorter: (a, b) => a.max_time - b.max_time
                },
                {
                    title: t('shortest-time') + `(${units})`,
                    dataIndex: 'min_time',
                    key: 'min_time',
                    width: 150,
                    sorter: (a, b) => a.min_time - b.min_time
                },
                {
                    title: t('percentage') + `%`,
                    dataIndex: 'ratio',
                    key: 'ratio',
                    width: 150,
                    sorter: (a, b) => a.ratio - b.ratio
                }
            ]
        }
    ];
    if (hasGpu) {
        columns.push({
            title: 'GPU',
            children: [
                {
                    title: t('total-time') + `(${units})`,
                    dataIndex: `GPUtotal_time`,
                    key: 'GPUtotal_time',
                    width: 150,
                    sorter: (a, b) => a.GPUtotal_time - b.GPUtotal_time
                },
                {
                    title: t('average-time') + `(${units})`,
                    dataIndex: 'GPUavg_time',
                    key: 'GPUavg_time',
                    width: 150,
                    sorter: (a, b) => a.GPUavg_time - b.GPUavg_time
                },
                {
                    title: t('longest-time') + `(${units})`,
                    dataIndex: 'GPUmax_time',
                    key: 'GPUmax_time',
                    width: 150,
                    sorter: (a, b) => a.GPUmax_time - b.GPUmax_time
                },
                {
                    title: t('shortest-time') + `(${units})`,
                    dataIndex: 'GPUmin_time',
                    key: 'GPUmin_time',
                    width: 150,
                    sorter: (a, b) => a.GPUmin_time - b.GPUmin_time
                },
                {
                    title: t('percentage') + `%`,
                    dataIndex: 'GPUratio',
                    key: 'GPUratio',
                    width: 150,
                    sorter: (a, b) => a.GPUratio - b.GPUratio
                }
            ]
        });
    }
    return columns;
};
export const customizeColumns = (units: string, hasGpu: boolean) => {
    const columns2: ColumnsType<DataType2> = [
        {
            title: '阶段',
            dataIndex: 'name',
            key: 'name',
            width: 100
        },
        {
            title: '调用次数',
            dataIndex: 'calls',
            key: 'calls',
            width: 100,
            sorter: (a, b) => a.calls - b.calls
        },
        {
            title: 'CPU',
            children: [
                {
                    title: `总耗时(${units})`,
                    dataIndex: 'cpu_total_time',
                    key: 'cpu_total_time',
                    width: 150,
                    sorter: (a, b) => a.cpu_total_time - b.cpu_total_time
                },
                {
                    title: `平均耗时(${units})`,
                    dataIndex: 'cpu_avg_time',
                    key: 'cpu_avg_time',
                    width: 150,
                    sorter: (a, b) => a.cpu_avg_time - b.cpu_avg_time
                },
                {
                    title: `最长耗时(${units})`,
                    dataIndex: 'cpu_max_time',
                    key: 'cpu_max_time',
                    width: 150,
                    sorter: (a, b) => a.cpu_max_time - b.cpu_max_time
                },
                {
                    title: `最短耗时(${units})`,
                    dataIndex: 'cpu_min_time',
                    key: 'cpu_min_time',
                    width: 150,
                    sorter: (a, b) => a.cpu_min_time - b.cpu_min_time
                },
                {
                    title: '百分比%',
                    dataIndex: 'cpu_ratio',
                    key: 'cpu_ratio',
                    width: 150,
                    sorter: (a, b) => a.cpu_ratio - b.cpu_ratio
                }
            ]
        }
    ];
    if (hasGpu) {
        columns2.push({
            title: 'GPU',
            children: [
                {
                    title: `总耗时(${units})`,
                    dataIndex: 'gpu_total_time',
                    key: 'gpu_total_time',
                    width: 150,
                    sorter: (a, b) => a.gpu_total_time - b.gpu_total_time
                },
                {
                    title: `平均耗时(${units})`,
                    dataIndex: 'gpu_avg_time',
                    key: 'gpu_avg_time',
                    width: 150,
                    sorter: (a, b) => a.gpu_avg_time - b.gpu_avg_time
                },
                {
                    title: `最长耗时(${units})`,
                    dataIndex: 'gpu_max_time',
                    key: 'gpu_max_time',
                    width: 150,
                    sorter: (a, b) => a.gpu_max_time - b.gpu_max_time
                },
                {
                    title: `最短耗时(${units})`,
                    dataIndex: 'gpu_min_time',
                    key: 'gpu_min_time',
                    width: 150,
                    sorter: (a, b) => a.gpu_min_time - b.gpu_min_time
                },
                {
                    title: '百分比%',
                    dataIndex: 'gpu_ratio',
                    key: 'gpu_ratio',
                    width: 150,
                    sorter: (a, b) => a.gpu_ratio - b.gpu_ratio
                }
            ]
        });
    }
    return columns2;
};
