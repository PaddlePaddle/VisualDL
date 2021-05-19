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

import Graph from './ParallelCoordinatesGraph';
import {ScaleMethod} from '~/resource/hyper-parameter';
import ScaleMethodSelect from '~/components/HyperParameterPage/ScaleMethodSelect';
import type {WithStyled} from '~/utils/style';
import styled from 'styled-components';

const Container = styled.div`
    width: 100%;
    overflow: auto;

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
                stroke: var(--hyper-parameter-graph-disabled-data-color);
            }

            .stroke-width {
                stroke: var(--hyper-parameter-graph-disabled-data-color);
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
                color: var(--hyper-parameter-graph-axis-color);

                text {
                    color: var(--text-light-color);
                    pointer-events: none;
                }

                .grid-brush .selection {
                    fill: var(--hyper-parameter-graph-brush-color);
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

const StyledScaleMethodSelect = styled(ScaleMethodSelect)`
    position: relative;
`;

type ParallelCoordinatesProps = ViewData & {
    colors: string[];
    onHover?: (index: number | null) => unknown;
    onSelect?: (index: number | null) => unknown;
};

const ParallelCoordinates: FunctionComponent<ParallelCoordinatesProps & WithStyled> = ({
    indicators,
    data,
    colors,
    onHover,
    onSelect,
    className
}) => {
    const container = useRef<HTMLDivElement>(null);
    const graph = useRef<Graph>();
    const [columnWidth, setColumnWidth] = useState(0);

    const [indicatorsOrder, setIndicatorsOrder] = useState(indicators.map(({name}) => name));
    useEffect(() => {
        setIndicatorsOrder(indicators.map(({name}) => name));
    }, [indicators]);

    const orderedIndicators = useMemo(
        () =>
            indicatorsOrder
                .filter(o => indicators.findIndex(i => i.name === o) >= 0)
                .map(name => indicators.find(i => i.name === name) as Indicator),
        [indicatorsOrder, indicators]
    );

    const [indicatorScaleMethod, setIndicatorScaleMethod] = useState(
        indicators.reduce<Record<string, ScaleMethod>>((result, indicator) => {
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

    useEffect(() => {
        if (!container.current) {
            return;
        }
        graph.current = new Graph(container.current);
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
        graph.current?.setColors(colors);
    }, [colors]);

    useEffect(() => {
        graph.current?.render(indicators, data);
        setColumnWidth(graph.current?.columnWidth ?? 0);
    }, [indicators, data]);

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
                            <StyledScaleMethodSelect
                                direction="top"
                                scaleMethod={indicatorScaleMethod[indicator.name]}
                                onChange={scale => changeIndicatorScaleMethod(indicator, scale)}
                            />
                        ) : null}
                    </div>
                ))}
            </div>
        </Container>
    );
};

export default ParallelCoordinates;
