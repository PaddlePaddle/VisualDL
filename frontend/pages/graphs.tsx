import {Graph, NodeType, TypedNode, collectDagFacts} from '~/resource/graphs';
import {NextI18NextPage, useTranslation} from '~/utils/i18n';
import NodeInfo, {NodeInfoProps} from '~/components/GraphsPage/NodeInfo';
import React, {useEffect, useMemo, useState} from 'react';

import Content from '~/components/Content';
import Field from '~/components/Field';
import Preloader from '~/components/Preloader';
import RawButton from '~/components/Button';
import RawRangeSlider from '~/components/RangeSlider';
import Title from '~/components/Title';
import isEmpty from 'lodash/isEmpty';
import {rem} from '~/utils/style';
import {saveSvgAsPng} from 'save-svg-as-png';
import styled from 'styled-components';
import useRequest from '~/hooks/useRequest';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const dumbFn = () => {};

const SubSection = styled.div`
    margin-bottom: ${rem(30)};
`;
const Button = styled(RawButton)`
    width: 100%;
    text-transform: uppercase;

    & + & {
        margin-top: ${rem(20)};
    }
`;

const Empty = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: ${rem(20)};
    height: ${rem(150)};
`;

const RangeSlider = styled(RawRangeSlider)`
    width: 100%;
`;

const GraphSvg = styled('svg')`
    width: 100%;

    cursor: grab;
    &.grabbing {
        cursor: grabbing;
    }

    .node {
        cursor: pointer;

        .label-container {
            stroke-width: 3px;
            stroke: #e6e6e6;
            &.rect {
                rx: 10;
                ry: 10;
            }
        }

        &.operator {
            .label-container {
                fill: #cdd9da;
            }
        }

        &.output {
            .label-container {
                stroke-dasharray: 5, 5;
                stroke: #e6e6e6;
                fill: #cad2d0;
            }
        }

        &.input {
            .label-container {
                fill: #d5d3d8;
            }
        }

        &.active {
            .label-container {
                stroke: #25c9ff;
            }
        }
    }

    .edgePath path.path {
        stroke: #333;
        stroke-width: 1.5px;
    }
`;

const loadDagLibs = [import('d3'), import('dagre-d3')] as const;
const MIN_SCALE = 0.1;
const MAX_SCALE = 4;

const useDag = (graph?: Graph) => {
    const [displaySwitch, setDisplaySwitch] = useState({
        detail: false,
        input: false,
        output: false
    });
    const facts = useMemo(() => collectDagFacts(graph), [graph]);

    const dagInfo = useMemo(() => {
        const {inputLayer, outputLayer, briefLayer, detailLayer, findNode} = facts;

        const availableLayers = displaySwitch.detail ? [detailLayer] : [briefLayer];
        if (displaySwitch.input) {
            availableLayers.push(inputLayer);
        }
        if (displaySwitch.output) {
            availableLayers.push(outputLayer);
        }

        return {
            ...availableLayers.reduce(
                (memo, {nodes, edges}) => ({
                    nodes: memo.nodes.concat(nodes),
                    edges: memo.edges.concat(edges)
                }),
                {
                    nodes: [],
                    edges: []
                }
            ),
            findNode
        };
    }, [facts, displaySwitch]);

    return {
        dagInfo,
        displaySwitch,
        setDisplaySwitch
    };
};

const useDagreD3 = (graph?: Graph) => {
    const [currentNode, setCurrentNode] = useState<NodeInfoProps['node']>(undefined);
    const {dagInfo, displaySwitch, setDisplaySwitch} = useDag(graph);
    const [downloadImage, setDownloadImageFn] = useState<() => void>(() => dumbFn);
    const [fitScreen, setFitScreenFn] = useState<() => void>(() => dumbFn);
    const [scale, setScaleValue] = useState(1);
    const [setScale, setScaleFn] = useState<(n: number) => void>(() => dumbFn);

    useEffect(() => {
        Promise.all(loadDagLibs).then(([d3, {default: dagre}]) => {
            if (!dagInfo.nodes.length || !dagInfo.edges.length) {
                return;
            }

            const g = new dagre.graphlib.Graph<{type: NodeType; elem: HTMLElement}>();
            g.setGraph({}).setDefaultEdgeLabel(() => ({}));

            dagInfo.nodes.forEach(n => g.setNode(n.key, n));
            dagInfo.edges.forEach(e => g.setEdge(e[0], e[1]));

            const render = new dagre.render();
            const svg = d3.select<HTMLElement, any>('svg'); // eslint-disable-line @typescript-eslint/no-explicit-any
            const inner = svg.select('svg g');
            render(inner, g);

            const {width, height} = g.graph();
            const scaleFactor = 1;
            svg.attr('height', Math.max(640, window.innerHeight + 40));

            const zoom = d3
                .zoom<HTMLElement, any>() // eslint-disable-line @typescript-eslint/no-explicit-any
                .scaleExtent([MIN_SCALE, MAX_SCALE])
                .on('zoom', function () {
                    setScaleValue(d3.event.transform.k / scaleFactor);
                    inner.attr('transform', d3.event.transform);
                })
                .on('start', () => svg.classed('grabbing', true))
                .on('end', () => svg.classed('grabbing', false));
            svg.call(zoom);

            let prevDom: HTMLElement | undefined;
            // install event listeners
            svg.selectAll('g.node').on('click', v => {
                const uid = v as string;
                const {type, elem: dom} = g.node(uid);
                if (prevDom) {
                    prevDom.classList.remove('active');
                }
                dom.classList.add('active');
                prevDom = dom;
                const node = dagInfo.findNode(type, uid);
                if (!node) {
                    setCurrentNode({type: 'unknown', guessType: type, msg: uid});
                    return;
                }

                setCurrentNode({...node, type} as TypedNode);
            });

            const fitScreen = () => {
                if (!svg) {
                    return;
                }

                const parent = svg.node()?.parentElement;
                if (!parent) {
                    return;
                }

                const {width: parentWidth} = parent.getBoundingClientRect();
                svg.call(
                    zoom.transform,
                    d3.zoomIdentity.translate((parentWidth - (width ?? 0) * scaleFactor) / 2, 20).scale(scaleFactor)
                );
            };
            fitScreen();

            setFitScreenFn(() => fitScreen);

            setDownloadImageFn(() => {
                let processing = false;
                return async () => {
                    if (processing) {
                        return;
                    }

                    processing = true;
                    fitScreen();
                    const svgNode = svg.node();
                    if (!svgNode) {
                        return;
                    }
                    const originalHeight = +svg.attr('height');
                    svg.attr('height', (height ?? 0) + 40);
                    await saveSvgAsPng(svgNode, 'graph.png');
                    svg.attr('height', originalHeight);
                    processing = false;
                };
            });

            setScaleFn(() => (n: number) => {
                zoom.scaleTo(svg, scaleFactor * n);
                setScaleValue(n);
            });
        });
    }, [dagInfo]);

    return {currentNode, displaySwitch, setDisplaySwitch, downloadImage, fitScreen, scale, setScale};
};

const Graphs: NextI18NextPage = () => {
    const {t} = useTranslation(['graphs', 'common']);
    const {data, error, loading} = useRequest<{data: Graph}>('/graphs/graph');
    const graph = useMemo(() => (loading || isEmpty(data?.data) ? undefined : data?.data), [loading, data]);
    const {currentNode, downloadImage, fitScreen, scale, setScale} = useDagreD3(graph);

    const aside = (
        <section>
            <SubSection>
                <Button icon="download" onClick={downloadImage}>
                    {t('download-image')}
                </Button>
                <Button icon="revert" onClick={fitScreen}>
                    {t('restore-image')}
                </Button>
            </SubSection>

            <SubSection>
                <Field label={`${t('scale')}:`}>
                    <RangeSlider min={MIN_SCALE} max={MAX_SCALE} step={0.1} value={scale} onChange={setScale} />
                </Field>
            </SubSection>

            <SubSection>
                <Field label={`${t('node-info')}:`} />
                <NodeInfo node={currentNode} />
            </SubSection>
        </section>
    );

    const ContentInner = useMemo(() => {
        if (loading) {
            return null;
        }
        if (error) {
            return <Empty>{t('common:error')}</Empty>;
        }
        if (!graph) {
            return <Empty>{t('common:empty')}</Empty>;
        }
        return (
            <GraphSvg>
                <g></g>
            </GraphSvg>
        );
    }, [loading, error, graph, t]);

    return (
        <>
            <Preloader url="/graphs/graph" />
            <Title>{t('common:graphs')}</Title>

            <Content aside={aside} loading={loading}>
                {ContentInner}
            </Content>
        </>
    );
};

Graphs.getInitialProps = () => ({
    namespacesRequired: ['graphs', 'common']
});

export default Graphs;
