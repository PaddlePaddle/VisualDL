import {Button, Modal, Table} from 'antd';
import React, {FunctionComponent, useCallback, useRef, useMemo, useState, useEffect, useImperativeHandle} from 'react';
import type {ColumnsType} from 'antd/lib/table';
import {fetcher} from '~/utils/fetch';
export type ModelRef = {
    showModal: () => unknown;
};
interface DataType {
    key: React.Key;
    name: string;
    age: number;
    street: string;
    building: string;
    number: number;
    companyAddress: string;
    companyName: string;
    gender: string;
}
interface ExpandedDataType {
    key: React.Key;
    date: string;
    name: string;
    upgradeNum: string;
}
const Model = React.forwardRef<ModelRef, any>(({runs, workers, spans}, ref) => {
    const [visible, setVisible] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [bounds, setBounds] = useState({left: 0, top: 0, bottom: 0, right: 0});
    const draggleRef = useRef<HTMLDivElement>(null);
    const [stack, setStack] = useState<string>();
    const [tableData, setTableData] = useState<any>();
    useEffect(() => {
        if (stack) {
            const time_unit = 1;
            fetcher(
                '/profiler/operator/stack_table' +
                    `?run=${runs}` +
                    `&worker=${workers}` +
                    `&span=${spans}` +
                    `&time_unit=${time_unit}` +
                    `&op_name=${stack}`
            ).then((res: any) => {
                setTableData(res.data);
            });
        }
    }, [stack]);
    const showModal = () => {
        setVisible(true);
    };
    const getStack = (value: string) => {
        setStack(value);
    };
    const handleOk = (e: React.MouseEvent<HTMLElement>) => {
        console.log(e);
        setVisible(false);
    };

    const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
        console.log(e);
        setVisible(false);
    };
    const expandedRowRender = useCallback(
        (e: any, a: any, b: any, c: any) => {
            console.log('e,a,b,c,', e, a, b, c);
            // debugger
            if (!tableData) {
                return;
            }
            const columns: ColumnsType<ExpandedDataType> = [{title: 'name', dataIndex: 'name', key: 'name'}];
            const numbers = Number(a);
            const data = tableData[numbers].expends;
            return <Table columns={columns} dataSource={data} pagination={false} showHeader={false} />;
        },
        [tableData]
    );
    useImperativeHandle(ref, () => ({
        showModal,
        getStack
    }));
    const columns: ColumnsType<DataType> = useMemo(() => {
        return [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                onFilter: (value: string | number | boolean, record) => record.name.indexOf(value as string) === 0
            },
            {
                title: 'GPU',
                children: [
                    {
                        title: '总耗时',
                        dataIndex: 'cpu_total_time',
                        key: 'cpu_total_time',
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: '平均耗时',
                        dataIndex: 'cpu_avg_time',
                        key: 'cpu_avg_time',
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: '最短耗时',
                        dataIndex: 'cpu_min_time',
                        key: 'cpu_min_time',
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: '百分比',
                        dataIndex: 'cpu_ratio',
                        key: 'cpu_ratio',
                        sorter: (a, b) => a.age - b.age
                    }
                ]
            },
            {
                title: 'GPU',
                children: [
                    {
                        title: '总耗时',
                        dataIndex: 'gpu_total_time',
                        key: 'gpu_total_time',
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: '平均耗时',
                        dataIndex: 'gpu_avg_time',
                        key: 'gpu_avg_time',
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: '最短耗时',
                        dataIndex: 'gpu_min_time',
                        key: 'gpu_min_time',
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: '百分比',
                        dataIndex: 'gpu_ratio',
                        key: 'gpu_ratio',
                        sorter: (a, b) => a.age - b.age
                    }
                ]
            }
        ];
    }, []);
    const getTable = useMemo(() => {
        if (columns && tableData) {
            return (
                <Table
                    columns={columns}
                    dataSource={tableData}
                    bordered
                    size="middle"
                    pagination={false}
                    scroll={{x: 'calc(700px + 50%)', y: 240}}
                    expandable={{
                        expandedRowRender
                    }}
                ></Table>
            );
        }
    }, [columns, tableData, expandedRowRender]);
    return (
        <>
            <Modal
                title={
                    <div
                        style={{
                            width: '100%',
                            cursor: 'move'
                        }}
                        onMouseOver={() => {
                            if (disabled) {
                                setDisabled(false);
                            }
                        }}
                        onMouseOut={() => {
                            setDisabled(true);
                        }}
                        onFocus={() => {}}
                        onBlur={() => {}}
                        // end
                    >
                        调用栈详情
                    </div>
                }
                width={800}
                visible={visible}
                okText="确认"
                cancelText="取消"
                onOk={handleOk}
                onCancel={handleCancel}
            >
                {getTable}
            </Modal>
        </>
    );
});

export default Model;
