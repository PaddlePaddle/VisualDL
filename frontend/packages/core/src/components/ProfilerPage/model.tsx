import {Button, Modal, Table} from 'antd';
import React, {FunctionComponent, useCallback, useRef, useMemo, useState, useEffect, useImperativeHandle} from 'react';
import type {ColumnsType} from 'antd/lib/table';
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
const Model = React.forwardRef<ModelRef, any>(({}, ref) => {
    const [visible, setVisible] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [bounds, setBounds] = useState({left: 0, top: 0, bottom: 0, right: 0});
    const draggleRef = useRef<HTMLDivElement>(null);

    const showModal = () => {
        setVisible(true);
    };
    const handleOk = (e: React.MouseEvent<HTMLElement>) => {
        console.log(e);
        setVisible(false);
    };

    const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
        console.log(e);
        setVisible(false);
    };
    const expandedRowRender = useCallback((e: any, a: any, b: any, c: any) => {
      const columns: ColumnsType<ExpandedDataType> = [{title: 'Date', dataIndex: 'date', key: 'date'}];
      const data = [];
      data.push(
          {
              key: 'aten:convolut',
              date: 'aten:convolut',
              name: 'This is production name',
              upgradeNum: 'Upgraded: 56'
          },
          {
              key: 'ion_backward',
              date: 'ion_backward',
              name: 'This is production name',
              upgradeNum: 'Upgraded: 56'
          }
      );
      return <Table columns={columns} dataSource={data} pagination={false} showHeader={false} />;
  }, []);
    useImperativeHandle(ref, () => ({
        showModal
    }));
    const columns: ColumnsType<DataType> = useMemo(() => {
        return [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                width: 100,
                // fixed: 'left',
                onFilter: (value: string | number | boolean, record) => record.name.indexOf(value as string) === 0
            },
            {
                title: 'Other',
                children: [
                    {
                        title: 'Age',
                        dataIndex: 'age',
                        key: 'age',
                        width: 150,
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: 'Age2',
                        dataIndex: 'age2',
                        key: 'age2',
                        width: 150,
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: 'Age3',
                        dataIndex: 'age3',
                        key: 'age',
                        width: 150,
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: 'Age4',
                        dataIndex: 'age4',
                        key: 'age4',
                        width: 150,
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: 'Age5',
                        dataIndex: 'age5',
                        key: 'age5',
                        width: 150,
                        sorter: (a, b) => a.age - b.age
                    },
                    {
                        title: 'Age6',
                        dataIndex: 'age6',
                        key: 'age6',
                        width: 150,
                        sorter: (a, b) => a.age - b.age
                    }
                ]
            },
            {
                title: 'Gender',
                dataIndex: 'gender',
                key: 'gender',
                width: 100
            }
        ];
    }, []);
    const data: any = useMemo(() => {
        let data: any = [];
        for (let i = 0; i < 3; i++) {
            data.push({
                key: i,
                name: 'John Brown',
                age: i + 1,
                age2: 'Lake Park',
                age3: 'C',
                age4: 2035,
                age5: 'Lake Street 42',
                age6: 'SoftLake Co',
                gender: 'M'
            });
        }
        return data;
    }, []);
    const getTable = useMemo(() => {
        return (
            <Table
                columns={columns}
                dataSource={data}
                bordered
                size="middle"
                pagination={false}
                scroll={{x: 'calc(700px + 50%)', y: 240}}
                expandable={{
                  expandedRowRender
                }}
            ></Table>
        );
    }, [columns, data]);
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
                        Draggable Modal
                    </div>
                }
                width={800}
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
              {getTable}
            </Modal>
        </>
    );
});

export default Model;
