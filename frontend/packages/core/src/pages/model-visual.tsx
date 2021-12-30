/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {FunctionComponent, useState, useEffect, useRef, useMemo, useCallback} from 'react';
import GraphG6, {NodeModel, ToolsType, GraphG6Method} from '~/components/GraphG6';
import FromChartSidebar from '~/components/ModelVisualPage/ModelVisualSidebar';
import NodeTag, {NodeData} from '~/components/ModelVisualPage/NodeTag';
import GraphG6Controller from '~/components/ModelVisualPage/GraphG6Controller';
import ModelVisualChartPanel, {ChartType, CollapseOptions, TabLoading, ChartOptions} from '~/components/ModelVisualPage/ModelVisualChartPanel';
import {XAxisType} from '~/components/LineChart';
import type {EdgeConfig, GraphData, GraphOptions} from '@antv/g6';
import type {
    GraphRequestData,
    NodeBasicData,
    NodeDetailIndexData,
    NodeDetailNumData,
    NodeBasicRequestData,
    NodeDetailIndexRequestData,
    NodeDetailNumRequestData
} from '~/resource/model-visual/types';
import Title from '~/components/Title';
import Button from '~/components/Button';
import Error from '~/components/Error';
import Content from '~/components/Content';
import Checkbox from '~/components/Checkbox';
import Aside, {AsideSection} from '~/components/Aside';
import Drawer from '~/components/Drawer';
import styled from 'styled-components';
import useRequest from '~/hooks/useRequest';
import {useTranslation} from 'react-i18next';

const ModelVisualContainer = styled.div`
    width: 100%;
    height: calc(100% - 10px);
    position: relative;
    overflow: hidden;
`;

const RepaintAsideSection = styled(AsideSection)`
    display: flex;
    align-items: center;

    > .checkbox {
        width: 300px;
    }
`;

const FullWidthButton = styled(Button)`
    width: 100%;
`;

const ModelVisual: FunctionComponent = () => {
    const {t} = useTranslation(['model-visual', 'common']);

    const graphG6Ref = useRef<GraphG6Method>({
        repaintGraphG6: () => {}
    });

    const [pageLoading, setPageLoading] = useState<boolean>(true);
    const [autoRepaint, setAutoRepaint] = useState<boolean>(true);
    const [requestStage, setRequestStage] = useState<string>('join');
    const [requestNodeId, setRequestNodeId] = useState<string | null>(null);
    const [graphData, setGraphData] = useState<GraphData | null>(null);
    const [nodeData, setNodeData] = useState<NodeData | null>(null);
    const [graphOptions, setGraphOptions] = useState<GraphOptions>({
        container: 'GraphG6',
        modes: {
            default: ['click-select']
        },
        defaultNode: {
            type: 'rect',
            style: {
                fill: '#1527c2',
                stroke: null
            },
            labelCfg: {
                style: {
                    fill: '#fff',
                    fontSize: 13
                }
            }
        },
        nodeStateStyles: {
            selected: {
                fill: '#4169e1',
                stroke: null,
                shadowColor: '',
                'text-shape': {
                    fill: '#fff'
                }
            },
            active: {
                fill: '#1527c2',
                stroke: null,
                shadowColor: ''
            },
            inactive: {
                fill: '',
                stroke: null,
                shadowColor: '',
                'text-shape': {
                    fill: null
                }
            }
        },
        defaultEdge: {
            type: 'cubic-horizontal',
            size: 2,
            style: {
                endArrow: true,
                radius: 40,
                stroke: '#4169e1',
                fill: null
            }
        },
        edgeStateStyles: {
            selected: {
                stroke: '#4169e1',
                lineWidth: 2
            },
            active: {
                stroke: '#4169e1',
                lineWidth: 2
            },
            inactive: {
                stroke: '',
                lineWidth: 2
            }
        },
        layout: {
            type: 'dagre',
            rankdir: 'BT',
            controlPoints: true,
            nodesepFunc: (d: {label: string | any[];}) => {
                return d.label.length * 3.2;
            },
            ranksepFunc: () => 1,
        },
        fitCenter: true
    });
    const [minimapDisplay, setMinimapDisplay] = useState<boolean>(true);
    const [toolsMap, setToolsMap] = useState<{[index in ToolsType]: boolean;}>({
        "drag-canvas": false,
        "zoom-canvas": false,
        "drag-node": false,
        "activate-relations": false
    });
    const [nodeModel, setNodeModel] = useState<NodeModel | null>(null);
    const [showDrawer, setShowDrawer] = useState<boolean>(false);
    const [chartGroup, setChartGroup] = useState<CollapseOptions>({});
    const [tabLoading, setTabLoading] = useState<TabLoading>({
        'basic': true,
        'index': true,
        'indexGrad': true,
        'num': true,
        'numGrad': true
    });
    const [searchList, setSearchList] = useState<string[]>([]);
    const [locationNodeId, setLocationNodeId] = useState<string | null>(null);

    const {data: graphRequestData} = useRequest<GraphRequestData[]>(
        `/model/network?stage=${requestStage}`
    );
    const {data: nodebasicRequestData} = useRequest<NodeBasicRequestData>(
        requestNodeId ? `/model/nodebasic?stage=${requestStage}&node=${requestNodeId}` : null
    );
    const {data: nodedetailIndexGradRequestData} = useRequest<NodeDetailIndexRequestData>(
        requestNodeId ? `/model/nodedetail?stage=${requestStage}&node=${requestNodeId}@GRAD&type=1` : null
    );
    const {data: nodedetailNumGradRequestData} = useRequest<NodeDetailNumRequestData>(
        requestNodeId ? `/model/nodedetail?stage=${requestStage}&node=${requestNodeId}@GRAD&type=2` : null
    );
    const {data: nodedetailIndexRequestData} = useRequest<NodeDetailIndexRequestData>(
        requestNodeId ? `/model/nodedetail?stage=${requestStage}&node=${requestNodeId}&type=1` : null
    );
    const {data: nodedetailNumRequestData} = useRequest<NodeDetailNumRequestData>(
        requestNodeId ? `/model/nodedetail?stage=${requestStage}&node=${requestNodeId}&type=2` : null
    );


    useEffect(
        () => {
            setPageLoading(true);
            Object.keys(tabLoading).forEach(key => tabLoading[key] = true);
            setTabLoading({...tabLoading});
        },
        [requestStage]
    );

    useEffect(
        () => {
            window.removeEventListener('resize', repaintGraph);
            autoRepaint && window.addEventListener('resize', repaintGraph);
            return () => {
                window.removeEventListener('resize', repaintGraph);
            };
        },
        [autoRepaint]
    );

    useEffect(
        () => {
            Object.keys(tabLoading).forEach(key => tabLoading[key] = true);
            setTabLoading({...tabLoading});
        },
        [requestNodeId]
    );

    useEffect(
        () => {
            Array.isArray(graphRequestData) && graphRequestData.length && setNodeGraphData(graphRequestData);
            setPageLoading(false);
        },
        [graphRequestData]
    );

    useEffect(
        () => {
            const id = nodeModel?.id || null;
            setNodeData({
                id: id ?? undefined,
                x: nodeModel?.x ? Math.floor(nodeModel?.x) : undefined,
                y: nodeModel?.y ? Math.floor(nodeModel?.y) : undefined
            });
            setRequestNodeId(id);
        },
        [nodeModel, t]
    );

    useEffect(
        () => {
            nodebasicRequestData && setNodeBasicData();
        },
        [nodebasicRequestData, t]
    );

    useEffect(
        () => {
            nodedetailIndexRequestData && setNodeDetailIndexData(false);
        },
        [nodedetailIndexRequestData, t]
    );

    useEffect(
        () => {
            nodedetailNumRequestData && setNodeDetailNumData(false);
        },
        [nodedetailNumRequestData, t]
    );

    useEffect(
        () => {
            nodedetailIndexGradRequestData && setNodeDetailIndexData(true);
        },
        [nodedetailIndexGradRequestData, t]
    );

    useEffect(
        () => {
            nodedetailNumGradRequestData && setNodeDetailNumData(true);
        },
        [nodedetailNumGradRequestData, t]
    );

    const setNodeGraphData = useCallback(
        (originalData: GraphRequestData[] | undefined) => {
            const data = originalData || [];
            const nodeGroup: string[] = [];
            const edges: EdgeConfig[] = [];
            for (const item of data) {
                const {head, tail} = item;
                !nodeGroup.includes(tail) && nodeGroup.push(tail);
                head.forEach(item => {
                    !nodeGroup.includes(item) && nodeGroup.push(item);
                    edges.push({
                        source: item,
                        target: tail
                    });
                });

            }
            setGraphData({
                nodes: nodeGroup.map(nodeName => ({
                    id: nodeName,
                    label: nodeName,
                    size: [nodeName.length * 8, 30]
                })),
                edges
            });
            setSearchList(nodeGroup);
        },
        [graphRequestData, t]
    );

    const setNodeBasicData = useCallback(
        () => {
            if (requestNodeId && nodebasicRequestData) {
                const basicDataKeyGroup = nodebasicRequestData
                    ? Object.keys(nodebasicRequestData).filter(item => item.includes(requestNodeId))
                    : [];
                const basicData: ChartOptions[] = [];
                const getLineSeries = (data: NodeBasicData[]) => {
                    const record: {[index: string]: number[]} = {};
                    enum NodeBasicDataEnum {
                        delta_num = 'delta_num',
                        avg = 'avg',
                        ab_avg = 'ab_avg',
                        var = 'var',
                        zero = 'zero'
                    }
                    data.forEach((item: NodeBasicData) => {
                        Object.keys(item).forEach(key => {
                            if (key !== 'delta_num') {
                                record[key] = record[key] ?? [];
                                record[key].push(Number(item[(key as NodeBasicDataEnum)]));
                            }

                        });
                    });
                    return Object.keys(record).map(key => ({
                        name: t(`model-visual:${key}`),
                        data: record[key]
                    }));
                };
                const getXAxisData = (data: NodeBasicData[]) => ({
                    data: data.map(item => item.delta_num)
                });
                const getLegendData = (data: NodeBasicData[]) => {
                    const result: string[] = [];
                    Object.keys(data[0]).forEach(key => {
                        if (key !== 'delta_num') {
                            result.push(t(`model-visual:${key}`));
                        }
                    });
                    return result;
                };
                const handlerData = (ori: NodeBasicData[], title: string): ChartOptions => ({
                    type: ChartType['line'],
                    config: {
                        title,
                        loading: false,
                        xConfig: getXAxisData(ori),
                        xAxisType: XAxisType.category,
                        data: getLineSeries(ori),
                        legendData: getLegendData(ori)
                    }
                });
                basicDataKeyGroup.forEach(key => {
                    nodebasicRequestData[key].length && basicData.push(handlerData(nodebasicRequestData[key], key))
                });
                chartGroup.basic = basicData;
                setChartGroup(chartGroup);
                tabLoading.basic = false;
                setTimeout(() => {
                    setTabLoading({...tabLoading});
                }, 200)
            }
        },
        [nodebasicRequestData, t]
    );

    const setNodeDetailIndexData = useCallback(
        (grad: boolean) => {
            const type = grad ? 'indexGrad' : 'index';
            const requestData = grad ? nodedetailIndexGradRequestData : nodedetailIndexRequestData;
            if (requestNodeId && requestData) {
                const oriData = requestData.data || [];
                const getBarSeries = (data: NodeDetailIndexData) => (
                    [{data: JSON.parse(data.neuron_values), type: 'bar'}]
                );
                const getXAxisData = (data: NodeDetailIndexData) => {
                    const value: number[] = [];
                    for(let i = 0; i < Number(data.neuron_num); i++) {
                        value.push(i+1);
                    }
                    return {
                        data: value
                    };
                };
                const indexData: ChartOptions[] = oriData.map(item => ({
                    type: ChartType.bar,
                    config: {
                        title: `delta_num: ${item.delta_num}`,
                        loading: false,
                        data: getBarSeries(item),
                        xConfig: getXAxisData(item)
                    }
                }));
                chartGroup[type] = indexData;
                setChartGroup(chartGroup);
                tabLoading[type] = false;
                setTimeout(() => {
                    setTabLoading({...tabLoading});
                }, 200)
            }
        },
        [nodedetailIndexRequestData, nodedetailIndexGradRequestData, t]
    );

    const setNodeDetailNumData = useCallback(
        (grad: boolean) => {
            const type = grad ? 'numGrad' : 'num';
            const requestData = grad ? nodedetailNumGradRequestData : nodedetailNumRequestData;
            if (requestNodeId && requestData) {
                const oriData = requestData.data || [];
                const getBarSeries = (data: NodeDetailNumData) => {
                    const value: number[][] = [];
                    JSON.parse(
                        data.bucket_xy.
                            replaceAll('(', '[').
                            replaceAll(')', ']').
                            replaceAll('\'', '\"')).
                            forEach((item: {x: number[], y: number}) => {value.push([...item.x, item.y])}
                    )
                    return [{
                        type: 'custom',
                        data: value,
                        renderItem: (params: any, api: any) => {
                            var yValue = api.value(2);
                            var start = api.coord([api.value(0), yValue]);
                            var size = api.size([api.value(1) - api.value(0), yValue]);
                            var style = api.style();
                            return {
                                type: 'rect',
                                shape: {
                                    x: start[0],
                                    y: start[1],
                                    width: size[0],
                                    height: size[1]
                                },
                                style: style
                            };
                        },
                        dimensions: ['from', 'to', 'profit'],
                        encode: {
                            x: [0, 1],
                            y: 2,
                            tooltip: [0, 1, 2]
                        },
                    }]
                };
                const numData: ChartOptions[] = oriData.map(item => ({
                    type: ChartType.bar,
                    config: {
                        title: `delta_num: ${item.delta_num}`,
                        loading: false,
                        data: getBarSeries(item),
                        tooltip: {
                            formatter: (params: {value: number[]}[]) => {
                                return `
                                        ${t('model-visual:from')}: ${params?.[0]?.value?.[0]}<br />
                                        ${t('model-visual:to')}: ${params?.[0]?.value?.[1] }<br />
                                        ${t('model-visual:neuron')}: ${params?.[0]?.value?.[2]}
                                    `;
                            }
                        }
                    }
                }));
                chartGroup[type] = numData;
                setChartGroup(chartGroup);
                tabLoading[type] = false;
                setTimeout(() => {
                    setTabLoading({...tabLoading});
                }, 200)
            }
        },
        [nodedetailNumRequestData, nodedetailNumGradRequestData, t]
    );

    const nodeSelected = useCallback(
        (isSelected) => {
            setShowDrawer(isSelected);
            !isSelected && setNodeModel(null);
        },
        []
    );

    const switchStep = useCallback(
        value => {
            nodeSelected(false);
            setTimeout(() => {
                setRequestStage(value);
            }, 0);
        },
        []
    );

    const setTools = useCallback(
        (type: ToolsType, value) => {
            toolsMap[type] = value;
            setToolsMap({...toolsMap});
        },
        []
    );

    const repaintGraph = useCallback(
        () => {
            graphG6Ref?.current?.repaintGraphG6();
        },
        [graphG6Ref]
    );

    const aside = useMemo(
        () => (
            <Aside
                bottom={
                    <>
                        <RepaintAsideSection>
                            <div className="checkbox">
                                <Checkbox checked={autoRepaint} onChange={setAutoRepaint}>
                                    {t('model-visual:auto-repaint')}
                                </Checkbox>
                            </div>
                            <FullWidthButton type="primary" rounded onClick={repaintGraph}>
                                {t('model-visual:repaint')}
                            </FullWidthButton>
                        </RepaintAsideSection>
                    </>
                }
            >
                <FromChartSidebar
                    title={t('common:model-visual')}
                >
                    <NodeTag data={nodeData} switchStep={switchStep} />
                    <GraphG6Controller
                        searchList={searchList}
                        onSelect={setLocationNodeId}
                        setMinimapDisplay={setMinimapDisplay}
                        setTools={setTools}
                    />
                </FromChartSidebar>
            </Aside>
        ),
        [nodeData, searchList, t]
    );

    return (
        <>
            <Title>{t('common:model-visual')}</Title>
            <Content aside={aside} loading={pageLoading}>
                {
                    !pageLoading && !graphData ? (
                        <Error />
                    ) : (
                        <ModelVisualContainer>
                            <Drawer
                                drawerWidth="500px"
                                show={showDrawer}
                                title={nodeData?.id + ''}
                            >
                                <ModelVisualChartPanel chartGroup={chartGroup} tabLoading={tabLoading} />
                            </Drawer>
                            <GraphG6
                                graphG6Ref={graphG6Ref}
                                graphData={graphData}
                                graphOptions={graphOptions}
                                minimapDisplay={minimapDisplay}
                                toolsMap={toolsMap}
                                locationId={locationNodeId}
                                getSelectStatus={nodeSelected}
                                getNodeModel={setNodeModel}
                                updateNodeData={nodeModel => {
                                    setNodeData({
                                        id: nodeModel?.id ?? undefined,
                                        x: nodeModel?.x ? Math.floor(nodeModel?.x) : undefined,
                                        y: nodeModel?.y ? Math.floor(nodeModel?.y) : undefined
                                    })
                                }}
                            />
                        </ModelVisualContainer>
                    )
                }
            </Content>
        </>
    );
};

export default ModelVisual;
