import React, {useState, useEffect, useMemo} from 'react';
import useSWR from 'swr';
import styled from 'styled-components';
import RawButton from '~/components/Button';
import RawRangeSlider from '~/components/RangeSlider';
import Content from '~/components/Content';
import Title from '~/components/Title';
import Field from '~/components/Field';
import {useTranslation, NextI18NextPage} from '~/utils/i18n';
import {rem} from '~/utils/style';
import {fetcher} from '~/utils/fetch';
import NodeInfo, {NodeInfoProps} from '~/components/GraphPage/NodeInfo';
import {Graph, collectDagFacts} from '~/resource/graph';
import {saveSvgAsPng} from 'save-svg-as-png';

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
        detail: true,
        input: true,
        output: true
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

const useDagreD3 = (graph: Graph | undefined) => {
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

            const g = new dagre.graphlib.Graph();
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
                .on('zoom', function() {
                    setScaleValue(d3.event.transform.k / scaleFactor);
                    inner.attr('transform', d3.event.transform);
                })
                .on('start', () => svg.classed('grabbing', true))
                .on('end', () => svg.classed('grabbing', false));
            svg.call(zoom);

            // install event listeners
            svg.selectAll('g.node').on('click', v => {
                const uid = v as string;
                const {type} = g.node(uid);
                const dagNode = dagInfo.findNode(type, uid);
                if (!dagNode) {
                    setCurrentNode({type: 'unknown', guessType: type, msg: uid});
                    return;
                }

                setCurrentNode({...dagNode, type});
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GraphsProps {}
const Graphs: NextI18NextPage<GraphsProps> = () => {
    const {t} = useTranslation(['graphs', 'common']);
    const {data: graph} = useSWR<{data: Graph}>('/graphs/graph', fetcher);
    const {currentNode, downloadImage, fitScreen, scale, setScale} = useDagreD3(graph ? graph.data : undefined);

    const aside = (
        <section>
            <SubSection>
                <Button icon="download" onClick={downloadImage}>
                    {t('common:download-image')}
                </Button>
                <Button icon="revert" onClick={fitScreen}>
                    {t('common:restore-image')}
                </Button>
            </SubSection>

            <SubSection>
                <Field label={`${t('common:scale')}:`}>
                    <RangeSlider min={MIN_SCALE} max={MAX_SCALE} step={0.1} value={scale} onChange={setScale} />
                </Field>
            </SubSection>

            <SubSection>
                <Field label={`${t('common:node-info')}:`}></Field>
                <NodeInfo node={currentNode}></NodeInfo>
            </SubSection>
        </section>
    );

    return (
        <>
            <Title>{t('common:graphs')}</Title>

            <Content aside={aside}>
                <GraphSvg>
                    <g></g>
                </GraphSvg>
            </Content>
        </>
    );
};

Graphs.getInitialProps = () => {
    return {
        namespacesRequired: ['graphs', 'common']
    };
};

export default Graphs;
