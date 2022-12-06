/* eslint-disable prettier/prettier */
import styled from 'styled-components';
import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {rem, primaryColor, size} from '~/utils/style';
import {Graph, Shape} from '@antv/x6';
import {register, Portal} from '@antv/x6-react-shape';
import {Stencil} from '@antv/x6-plugin-stencil';
import {Transform} from '@antv/x6-plugin-transform';
import {Selection} from '@antv/x6-plugin-selection';
import {Snapline} from '@antv/x6-plugin-snapline';
import {Keyboard} from '@antv/x6-plugin-keyboard';
import {Clipboard} from '@antv/x6-plugin-clipboard';
import {History} from '@antv/x6-plugin-history';
import {use} from 'chai';
import {model} from '../../store/graph/selectors';
const Content = styled.div`
    height: 100%;
    #container {
        height: 100%;
        display: flex;
        border: 1px solid #dfe3e8;
    }
    #stencil_content {
        width: 180px;
        height: 100%;
        position: relative;
        border-right: 1px solid #dfe3e8;
        #stencil {
            height: 90%;
        }
        #buttonContent {
            display: flex;
            position: absolute;
            bottom: 1%;
        }
    }
    #graph-container {
        width: calc(100% - 180px);
        height: 100%;
    }
    .x6-widget-stencil {
        background-color: #fff;
    }
    .x6-widget-stencil-title {
        background-color: #fff;
    }
    .x6-widget-stencil-group-title {
        background-color: #fff !important;
    }
    .x6-widget-transform {
        margin: -1px 0 0 -1px;
        padding: 0px;
        border: 1px solid #239edd;
    }
    .x6-widget-transform > div {
        border: 1px solid #239edd;
    }
    .x6-widget-transform > div:hover {
        background-color: #3dafe4;
    }
    .x6-widget-transform-active-handle {
        background-color: #3dafe4;
    }
    .x6-widget-transform-resize {
        border-radius: 0;
    }
    .x6-widget-selection-inner {
        border: 1px solid #239edd;
    }
    .x6-widget-selection-box {
        opacity: 0;
    }
`;
const Buttons = styled.div`
    height: 2.5714285714285716rem;
    line-height: 2.5714285714285716rem;
    text-align: center;
    font-size: 16px;
    margin-left: 2px;
    width: 86px;
    color: white;
    background-color: var(--navbar-background-color);
`;
const NodeComponent: any = () => {
    const isCLick = () => {
        alert('test');
    };
    return (
        <div className="react-node" onClick={isCLick}>
            test
        </div>
    );
};
const index = ({modelData}) => {
    // #region 初始化图形
    const [flag, setFlag] = useState<boolean>();
    const [flag2, setFlag2] = useState<boolean>();

    const [graphs, setGraphs] = useState<any>();
    const [stencils, setStencils] = useState<any>();
    const ports = {
        groups: {
            top: {
                position: 'top',
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#5F95FF',
                        strokeWidth: 1,
                        fill: '#fff',
                        style: {
                            visibility: 'hidden'
                        }
                    }
                }
            },
            right: {
                position: 'right',
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#5F95FF',
                        strokeWidth: 1,
                        fill: '#fff',
                        style: {
                            visibility: 'hidden'
                        }
                    }
                }
            },
            bottom: {
                position: 'bottom',
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#5F95FF',
                        strokeWidth: 1,
                        fill: '#fff',
                        style: {
                            visibility: 'hidden'
                        }
                    }
                }
            },
            left: {
                position: 'left',
                attrs: {
                    circle: {
                        r: 4,
                        magnet: true,
                        stroke: '#5F95FF',
                        strokeWidth: 1,
                        fill: '#fff',
                        style: {
                            visibility: 'hidden'
                        }
                    }
                }
            }
        },
        items: [
            {
                group: 'top'
            },
            {
                group: 'right'
            },
            {
                group: 'bottom'
            },
            {
                group: 'left'
            }
        ]
    };
    useEffect(() => {
        const graph = new Graph({
            container: document.getElementById('graph-container')!,
            grid: true,
            mousewheel: {
                enabled: true,
                zoomAtMousePosition: true,
                modifiers: 'ctrl',
                minScale: 0.5,
                maxScale: 3
            },
            connecting: {
                router: {
                    name: 'manhattan',
                    args: {
                        padding: 1
                    }
                },
                connector: {
                    name: 'rounded',
                    args: {
                        radius: 8
                    }
                },
                anchor: 'center',
                connectionPoint: 'anchor',
                allowBlank: false,
                snap: {
                    radius: 20
                },
                createEdge() {
                    return new Shape.Edge({
                        attrs: {
                            line: {
                                stroke: '#A2B1C3',
                                strokeWidth: 2,
                                targetMarker: {
                                    name: 'block',
                                    width: 12,
                                    height: 8
                                }
                            }
                        },
                        zIndex: 0
                    });
                },
                validateConnection({targetMagnet}) {
                    return !!targetMagnet;
                }
            },
            highlighting: {
                magnetAdsorbed: {
                    name: 'stroke',
                    args: {
                        attrs: {
                            fill: '#5F95FF',
                            stroke: '#5F95FF'
                        }
                    }
                }
            }
        });
        const stencil = new Stencil({
            title: '流程图',
            // title: '基础流程图',
            target: graph,
            stencilGraphWidth: 200,
            stencilGraphHeight: 180,
            collapsable: true,
            groups: [
                {
                    title: '基础流程图',
                    name: 'group1'
                }
            ],
            layoutOptions: {
                columns: 2,
                columnWidth: 80,
                rowHeight: 55
            }
        });
        document.getElementById('stencil')!.appendChild(stencil.container);
        setGraphs(graph);
        setStencils(stencil);
        setFlag(true);
    }, []);
    useEffect(() => {
        if (!flag || !graphs) {
            return;
        }
        graphPlug(graphs);
    }, [flag]);
    useEffect(() => {
        if (flag2 && graphs) {
            graphRegion(graphs);
        }
    }, [flag2]);
    useEffect(() => {
        if (!flag || !modelData || !graphs) {
            return;
        }
        stencilCreateNode(graphs, stencils, modelData);
    }, [modelData, flag]);
    const graphPlug = (graph: any) => {
        graph.use(
            new Transform({
                resizing: true,
                rotating: true
            })
        );
        graph.use(
            new Selection({
                enabled: true,
                rubberband: true,
                showNodeSelectionBox: true
            })
        );
        graph.use(
            new Snapline({
                enabled: true
            })
        );
        graph.use(
            new Keyboard({
                enabled: true
            })
        );
        graph.use(
            new Clipboard({
                enabled: true
            })
        );
        graph.use(
            new History({
                enabled: true
            })
        );
        setFlag2(true);
    };
    const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
        for (let i = 0, len = ports.length; i < len; i = i + 1) {
            ports[i].style.visibility = show ? 'visible' : 'hidden';
        }
    };
    const graphRegion = (graph: any) => {
        graph.bindKey(['meta+c', 'ctrl+c'], () => {
            const cells = graph.getSelectedCells();
            if (cells.length) {
                graph.copy(cells);
            }
            return false;
        });
        graph.bindKey(['meta+x', 'ctrl+x'], () => {
            const cells = graph.getSelectedCells();
            if (cells.length) {
                graph.cut(cells);
            }
            return false;
        });
        graph.bindKey(['meta+v', 'ctrl+v'], () => {
            if (!graph.isClipboardEmpty()) {
                const cells = graph.paste({offset: 32});
                graph.cleanSelection();
                graph.select(cells);
            }
            return false;
        });

        //undo redo
        graph.bindKey(['meta+z', 'ctrl+z'], () => {
            if (graph.canUndo()) {
                graph.undo();
            }
            return false;
        });
        graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
            if (graph.canRedo()) {
                graph.redo();
            }
            return false;
        });

        // select all
        graph.bindKey(['meta+a', 'ctrl+a'], () => {
            const nodes = graph.getNodes();
            if (nodes) {
                graph.select(nodes);
            }
        });

        //delete
        graph.bindKey('backspace', () => {
            const cells = graph.getSelectedCells();
            if (cells.length) {
                graph.removeCells(cells);
            }
        });

        // zoom
        graph.bindKey(['ctrl+1', 'meta+1'], () => {
            const zoom = graph.zoom();
            if (zoom < 1.5) {
                graph.zoom(0.1);
            }
        });
        graph.bindKey(['ctrl+2', 'meta+2'], () => {
            const zoom = graph.zoom();
            if (zoom > 0.5) {
                graph.zoom(-0.1);
            }
        });
        graph.on('node:mouseenter', () => {
            const container = document.getElementById('graph-container')!;
            const ports = container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>;
            showPorts(ports, true);
        });
        graph.on('node:mouseleave', () => {
            const container = document.getElementById('graph-container')!;
            const ports = container.querySelectorAll('.x6-port-body') as NodeListOf<SVGElement>;
            showPorts(ports, false);
        });
    };
    console.log('modelDatas', modelData);

    const stencilCreateNode = (graph: any, stencil: any, modelData: any) => {
        console.log('modelData', modelData);
        const nodes: any[] = [];
        for (let index = 0; index < modelData.models.length; index++) {
            const model: any = modelData.models[index];
            Graph.registerNode(
                model.name,
                {
                    inherit: 'rect',
                    width: 66,
                    height: 36,
                    attrs: {
                        body: {
                            strokeWidth: 1,
                            stroke: '#5F95FF',
                            fill: '#EFF4FF'
                        },
                        text: {
                            fontSize: 12,
                            fill: '#262626'
                        },
                        image: {
                            xlinkHref: 'trash.png',
                            width: 20,
                            height: 20
                        }
                    },
                    ports: {...ports}
                },
                true
            );
            const r1 = graph.createNode({
                shape: model.name,
                attrs: {
                    label: {
                        text: model.name
                    }
                },
                tools: ['button-remove']
            });
            nodes.push(r1);
        }
        stencil.load([...nodes], 'group1');
    };

    return (
        <Content>
            <div id="container">
                <div id="graph-container"></div>
                <div id="stencil_content">
                    <div id="stencil"></div>
                    <div id="buttonContent">
                        <Buttons>新增</Buttons>
                        <Buttons>启动</Buttons>
                    </div>
                </div>
            </div>
        </Content>
    );
};
export default index;
