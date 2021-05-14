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

import type {Indicator, ViewData} from '~/resource/hyper-parameter';
import React, {FunctionComponent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {SCALE_METHODS, ScaleMethod} from '~/resource/hyper-parameter';

import Graph from './ParallelCoordinatesGraph';
import type {Options as GraphOptions} from './ParallelCoordinatesGraph';
import Select from '~/components/HyperParameterPage/BorderLessSelect';
import type {WithStyled} from '~/utils/style';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

const Container = styled.div`
    width: 100%;

    .interpolates {
        display: flex;
        margin-left: ${Graph.GRID_BRUSH_WIDTH / 2}px;
        margin-top: 1em;
    }

    svg {
        .line {
            fill: none;
        }
        .hover-trigger {
            cursor: pointer;
        }
        .select-indicator {
            fill: var(--background-color);
            stroke-width: 2px;
        }
        .disabled {
            .line {
                stroke: var(--parallel-coordinates-graph-disabled-line-color);
            }

            .stroke-width {
                stroke: var(--parallel-coordinates-graph-disabled-line-color);
            }

            .hover-trigger {
                cursor: unset;
            }
        }
        .grid {
            .indicator {
                fill: var(--text-color);
                dominant-baseline: text-before-edge;

                &.metrics {
                    font-weight: bold;
                }

                .dragger {
                    opacity: 0;
                    cursor: grab;
                }

                &:hover .dragger {
                    opacity: 1;
                }
            }

            .axis {
                color: var(--parallel-coordinates-graph-grid-color);

                text {
                    color: var(--text-light-color);
                    pointer-events: none;
                }

                .grid-brush .selection {
                    fill: var(--parallel-coordinates-graph-brush-color);
                    fill-opacity: 0.4;
                }
            }

            &.dragging {
                .indicator {
                    fill: var(--primary-color);
                }

                .dragger {
                    opacity: 1;
                    cursor: grabbing;
                    filter: invert(16%) sepia(99%) saturate(5980%) hue-rotate(243deg) brightness(89%) contrast(98%);
                }
            }
        }
    }
`;

const ScaleMethodSelect = styled(Select)`
    position: relative;
    min-width: 7em;
`;

type ParallelCoordinatesProps = ViewData &
    GraphOptions & {
        onHover?: (index: number | null) => unknown;
        onSelect?: (index: number | null) => unknown;
    };

const ParallelCoordinates: FunctionComponent<ParallelCoordinatesProps & WithStyled> = ({
    indicators,
    data,
    colorBy,
    colorMap,
    onHover,
    onSelect,
    className
}) => {
    const {t} = useTranslation('hyper-parameter');
    const container = useRef<HTMLDivElement>(null);
    const graph = useRef<Graph>();
    const options = useRef<GraphOptions>({colorBy, colorMap});
    const [columnWidth, setColumnWidth] = useState(0);

    const selectedIndicators = useMemo(() => indicators.filter(i => i.selected), [indicators]);

    const [indicatorsOrder, setIndicatorsOrder] = useState(selectedIndicators.map(({name}) => name));
    useEffect(() => {
        setIndicatorsOrder(selectedIndicators.map(({name}) => name));
    }, [selectedIndicators]);

    const orderedIndicators = useMemo(
        () =>
            indicatorsOrder
                .filter(o => selectedIndicators.findIndex(i => i.name === o) >= 0)
                .map(name => selectedIndicators.find(i => i.name === name) as Indicator),
        [indicatorsOrder, selectedIndicators]
    );

    const [indicatorScaleMethod, setIndicatorScaleMethod] = useState(
        selectedIndicators.reduce<Record<string, ScaleMethod>>((result, indicator) => {
            if (indicator.type === 'continuous') {
                result[indicator.name] = ScaleMethod.LINEAR;
            }
            return result;
        }, {})
    );

    const [draggingIndicator, setDraggingIndicator] = useState<string | null>(null);
    const [draggingIndicatorOffset, setDraggingIndicatorOffset] = useState<number>(0);

    const changeIndicatorScaleMethod = useCallback((indicator: Indicator, scale: ScaleMethod) => {
        setIndicatorScaleMethod(r => ({
            ...r,
            [indicator.name]: scale
        }));
        graph.current?.setScaleMethod(indicator.name, scale);
    }, []);

    const scaleMethods = useMemo(
        () =>
            SCALE_METHODS.map(method => ({
                value: method,
                label: t(`hyper-parameter:scale-method.${method}`)
            })),
        [t]
    );

    useEffect(() => {
        if (!container.current) {
            return;
        }
        graph.current = new Graph(container.current, options.current);
        graph.current.on('dragging', (name, offset, order) => {
            setDraggingIndicator(name);
            setDraggingIndicatorOffset(offset);
            setIndicatorsOrder(order);
        });
        graph.current.on('dragged', order => {
            setDraggingIndicator(null);
            setDraggingIndicatorOffset(0);
            setIndicatorsOrder(order);
        });
        return () => graph.current?.dispose();
    }, []);

    useEffect(() => {
        const c = container.current;
        if (c) {
            const observer = new ResizeObserver(() => {
                const rect = c.getBoundingClientRect();
                graph.current?.resize(rect.width);
                setColumnWidth(graph.current?.columnWidth ?? 0);
            });
            observer.observe(c);
            return () => {
                observer.unobserve(c);
            };
        }
    }, []);

    useEffect(() => {
        if (onHover) {
            graph.current?.on('hover', onHover);
            return () => {
                graph.current?.off('hover', onHover);
            };
        }
    }, [onHover]);
    useEffect(() => {
        if (onSelect) {
            graph.current?.on('select', onSelect);
            return () => {
                graph.current?.off('select', onSelect);
            };
        }
    }, [onSelect]);

    useEffect(() => {
        graph.current?.setColorBy(colorBy ?? null);
    }, [colorBy]);

    useEffect(() => {
        graph.current?.render(selectedIndicators, data);
        setColumnWidth(graph.current?.columnWidth ?? 0);
    }, [selectedIndicators, data]);

    return (
        <Container className={className}>
            <div ref={container}></div>
            <div className="interpolates">
                {orderedIndicators.map(indicator => (
                    <div
                        key={indicator.name}
                        style={{
                            width: `${columnWidth}px`,
                            position: 'relative',
                            left: `${draggingIndicator === indicator.name ? draggingIndicatorOffset : 0}px`
                        }}
                    >
                        {indicatorScaleMethod[indicator.name] != null ? (
                            <ScaleMethodSelect
                                list={scaleMethods}
                                value={indicatorScaleMethod[indicator.name]}
                                onChange={(scale: string) =>
                                    changeIndicatorScaleMethod(indicator, scale as ScaleMethod)
                                }
                            />
                        ) : null}
                    </div>
                ))}
            </div>
        </Container>
    );
};

export default ParallelCoordinates;
