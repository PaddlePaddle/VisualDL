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

// cspell:words quantile quantiles unhover

import * as d3 from 'd3';

import type {DataListItem, Indicator} from '~/resource/hyper-parameter';

import EventEmitter from 'eventemitter3';
import {ScaleMethod} from '~/resource/hyper-parameter';
import intersection from 'lodash/intersection';

const PUBLIC_PATH: string = import.meta.env.SNOWPACK_PUBLIC_PATH;

type YScale =
    | d3.ScalePoint<string | number>
    | d3.ScaleLogarithmic<number, number>
    | d3.ScaleLinear<number, number>
    | d3.ScaleQuantile<number>;

type GridIndicator = Indicator & {
    scale: ScaleMethod;
    x: number;
    yScale: YScale;
    grid: d3.Selection<SVGGElement, unknown, null, undefined> | null;
};

interface LineData {
    data: DataListItem;
    color: string;
    line: d3.Selection<SVGGElement, unknown, null, undefined> | null;
}

const INDICATORS_HEIGHT = 25;
const MIN_COLUMN_WIDTH = 60;
const GRID_PADDING = 5;

interface EventTypes {
    hover: [number | null];
    select: [number | null];
    dragging: [string, number, string[]];
    dragged: [string[]];
}

export default class ParallelCoordinatesGraph extends EventEmitter<EventTypes> {
    static GRAPH_HEIGHT = 300;
    static GRID_BRUSH_WIDTH = 20;

    private svg;

    private containerWidth;

    private colors: string[] = [];
    private data: DataListItem[] = [];
    private grids: GridIndicator[] = [];
    private lines: LineData[] = [];

    private hoveredLineIndex: number | null = null;
    private selectedLineIndex: number | null = null;
    private brushedLineIndexesArray: (number[] | null)[] = [];

    private dragStartX = 0;
    private draggingIndicator: GridIndicator | null = null;

    get svgWidth() {
        return this.columnWidth * this.grids.length + ParallelCoordinatesGraph.GRID_BRUSH_WIDTH / 2;
    }

    get columnWidth() {
        if (this.grids.length === 0) {
            return 0;
        }
        return Math.max(
            (this.containerWidth - ParallelCoordinatesGraph.GRID_BRUSH_WIDTH) / this.grids.length,
            MIN_COLUMN_WIDTH
        );
    }

    get brushedLineIndexes() {
        return this.brushedLineIndexesArray.every(i => i == null)
            ? null
            : intersection(...this.brushedLineIndexesArray.filter(i => i != null));
    }

    get sequenceGrids() {
        return [...this.grids].sort((a, b) => a.x - b.x);
    }

    constructor(container: HTMLElement) {
        super();
        this.containerWidth = container.getBoundingClientRect().width;
        const [width, height] = [this.containerWidth, ParallelCoordinatesGraph.GRAPH_HEIGHT + INDICATORS_HEIGHT];
        this.svg = d3
            .select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .on('click', () => {
                this.unselectLine();
            });
    }

    private getDataByIndicator(indicator: Indicator) {
        return this.data.map(row => row[indicator.group][indicator.name]);
    }

    private removeGrids() {
        this.brushedLineIndexesArray = [];
        this.grids.forEach(indicator => {
            indicator.grid?.remove();
            indicator.grid = null;
        });
    }

    private drawGrids() {
        this.brushedLineIndexesArray = Array(this.grids.length).fill(null);
        this.sequenceGrids.forEach((indicator, index) => {
            const x = indicator.x;
            const g = this.svg.append('g').classed('grid', true).attr('transform', `translate(${x}, 0)`);

            const indicatorG = g.append('g').classed('indicator', true).classed(indicator.group, true);
            const text = indicatorG.append('text').attr('x', 0).attr('y', 0).text(indicator.name);
            let textLength = text.node()?.getComputedTextLength() ?? 0;
            while (textLength > this.columnWidth - ParallelCoordinatesGraph.GRID_BRUSH_WIDTH / 2) {
                text.text(text.text().slice(0, -1) + '...');
                textLength = text.node()?.getComputedTextLength() ?? 0;
            }
            indicatorG
                .append('image')
                .classed('dragger', true)
                .attr('x', -15)
                .attr('y', -1)
                .attr('width', 16)
                .attr('height', 16)
                .attr('href', `${PUBLIC_PATH}/icons/dragger.svg`)
                .call(
                    d3
                        .drag()
                        // FIXME: complete types, `NEXT TIME MUST` :)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .container(this.svg as any)
                        .on('start', ({x}) => this.dragstart(indicator, x))
                        .on('drag', ({x}) => this.dragging(indicator, x))
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .on('end', () => this.dragend()) as any
                );

            const axisG = g.append('g').classed('axis', true).attr('transform', `translate(0, ${INDICATORS_HEIGHT})`);
            const scale = indicator.yScale;
            const axis = d3.axisRight(scale as d3.AxisScale<d3.AxisDomain>);
            if (indicator.scale === ScaleMethod.QUANTILE) {
                (axis as d3.Axis<number>)
                    .tickValues((scale as d3.ScaleQuantile<number>).quantiles())
                    .tickFormat(d3.format('-.6g'));
            }
            axisG.call(axis);

            const gridHeight = ParallelCoordinatesGraph.GRAPH_HEIGHT - 2 * GRID_PADDING;
            const brushWidth = ParallelCoordinatesGraph.GRID_BRUSH_WIDTH;
            const brushG = axisG
                .append('g')
                .classed('grid-brush', true)
                .attr('transform', `translate(${-brushWidth / 2}, 0)`);
            brushG.call(
                d3
                    .brushY()
                    .extent([
                        [0, GRID_PADDING - 0.5],
                        [brushWidth, gridHeight + GRID_PADDING + 0.5]
                    ])
                    .on('brush end', ({selection}) => this.brushed(index, selection))
            );
            brushG
                .select('.selection')
                .attr('fill', null)
                .attr('fill-opacity', null)
                .attr('stroke', null)
                .attr('stroke-width', null);
            indicator.grid = g;
        });
    }

    private removeLines() {
        this.lines.forEach(line => {
            line.line?.remove();
            line.line = null;
        });
    }

    private drawLines() {
        this.lines.forEach((row, rowIndex) => {
            const g = this.svg.append('g').attr('transform', `translate(0, ${INDICATORS_HEIGHT})`);
            g.append('path').classed('line', true).attr('fill', 'none').attr('stroke-width', 1);
            g.append('path')
                .classed('hover-trigger', true)
                .attr('stroke', 'transparent')
                .attr('fill', 'none')
                .attr('stroke-width', 7)
                .on('mouseenter', () => {
                    if (g.classed('disabled')) {
                        return;
                    }
                    this.hoverLine(rowIndex);
                })
                .on('mouseleave', () => {
                    if (g.classed('disabled')) {
                        return;
                    }
                    this.unhoverLine();
                })
                .on('click', (e: Event) => {
                    if (g.classed('disabled')) {
                        return;
                    }
                    this.selectLine(rowIndex);
                    e.stopPropagation();
                });
            row.line = g;
        });
        this.updateLines(false);
        this.updateLineColors();
        this.updateLineWidths();
    }

    private updateLineColors() {
        this.lines.forEach((row, i) => {
            const disabled = this.brushedLineIndexes != null && !this.brushedLineIndexes.includes(i);
            const group = row.line?.classed('disabled', disabled);
            const line = group?.select('.line');
            const circles = group?.selectAll('.select-indicator');
            if (disabled) {
                line?.attr('stroke', null);
                circles?.attr('stroke', null);
            } else {
                this.select(line, true)?.attr('stroke', row.color);
                this.select(circles, true)?.attr('stroke', row.color);
            }
        });
    }

    private updateLineWidths() {
        this.lines.forEach((g, i) => {
            let width = 1;
            if (i === this.hoveredLineIndex || i === this.selectedLineIndex) {
                width = 3;
            }
            this.select(g.line?.select('.line'), true)?.attr('stroke-width', width);
        });
    }

    private hoverLine(index: number) {
        this.emit('hover', index);
        this.hoveredLineIndex = index;
        this.updateLineWidths();
    }

    private unhoverLine() {
        if (this.hoveredLineIndex != null) {
            this.hoveredLineIndex = null;
            this.emit('hover', null);
        }
        this.updateLineWidths();
    }

    private selectLine(index: number) {
        this.emit('select', index);
        this.selectedLineIndex = index;
        const line = this.lines[index];
        this.lines.forEach(line => line.line?.selectAll('.select-indicator').remove());
        this.sequenceGrids.forEach(g => {
            line.line
                ?.append('circle')
                .classed('select-indicator', true)
                .attr('cx', g.x)
                .attr('cy', g.yScale(line.data[g.group][g.name] as number) ?? 0)
                .attr('r', 4)
                .attr('stroke', line.color);
        });
        this.updateLineWidths();
    }

    private unselectLine() {
        if (this.selectedLineIndex != null) {
            this.lines[this.selectedLineIndex].line?.selectAll('.select-indicator').remove();
            this.selectedLineIndex = null;
            this.emit('select', null);
        }
        this.updateLineWidths();
    }

    private calculateLineColors() {
        this.lines.forEach((line, i) => {
            line.color = this.colors[i] ?? '#000';
        });
    }

    private calculateXScale() {
        const d = ParallelCoordinatesGraph.GRID_BRUSH_WIDTH / 2;
        const scale = d3
            .scalePoint()
            .domain(this.sequenceGrids.map(i => i.name))
            .range([d, d + this.columnWidth * (this.sequenceGrids.length - 1)]);
        this.sequenceGrids.forEach(grid => {
            grid.x = scale(grid.name) ?? 0;
        });
    }

    private calculateYScales() {
        const yScales = this.grids.map(grid => {
            const gridHeight = ParallelCoordinatesGraph.GRAPH_HEIGHT - 2 * GRID_PADDING;
            let range = [gridHeight + GRID_PADDING, GRID_PADDING];
            if (grid.type === 'continuous') {
                let scale;
                const values = this.getDataByIndicator(grid).map(v => +v);
                const extent = d3.extent(values) as [number, number];
                if (grid.scale === ScaleMethod.LOGARITHMIC) {
                    scale = d3.scaleLog();
                } else if (grid.scale === ScaleMethod.QUANTILE) {
                    const kNumQuantiles = 20;
                    scale = d3.scaleQuantile();
                    range = d3.range(kNumQuantiles).map(i => range[0] - (i * gridHeight) / (kNumQuantiles - 1));
                } else {
                    scale = d3.scaleLinear();
                }
                return (scale.domain(extent) as d3.ScaleLinear<number, number>).range(range) as YScale;
            }
            return d3
                .scalePoint()
                .domain((grid.selectedValues as string[]) ?? [])
                .range(range)
                .padding(0.1) as YScale;
        });
        this.grids.forEach((grid, i) => {
            grid.yScale = yScales[i];
        });
    }

    private getDiscreteLineBySelection(index: number, [y1, y2]: [number, number]) {
        const indicator = this.grids[index];
        const scale = indicator.yScale as d3.ScalePoint<string | number>;
        const domain = scale.domain();
        const step = scale.step();
        const padding = scale.padding() * step;
        const start = domain.length - Math.min(Math.floor((y2 - GRID_PADDING - padding) / step), domain.length - 1) - 1;
        const end = domain.length - Math.max(Math.ceil((y1 - GRID_PADDING - padding) / step), 0) - 1;
        return this.data.reduce<number[]>((result, row, i) => {
            const vi = domain.indexOf(row[indicator.group][indicator.name]);
            if (vi >= start && vi <= end) {
                result.push(i);
            }
            return result;
        }, []);
    }

    private getContinuousLineBySelection(index: number, [y1, y2]: [number, number]) {
        const indicator = this.grids[index];
        const scale = indicator.yScale;
        let start: number;
        let end: number;
        if (indicator.scale === ScaleMethod.QUANTILE) {
            const quantileScale = scale as d3.ScaleQuantile<number>;
            const range = quantileScale.range();
            const domains = range
                .filter(y => y1 <= y && y <= y2)
                .map(y => {
                    const domain = quantileScale.invertExtent(y);
                    return y === range[range.length - 1] ? [domain[0], domain[1] + 1] : domain;
                });
            [start, end] = d3.extent(d3.merge<number>(domains)) as [number, number];
        } else {
            const invertScale = (scale as d3.ScaleLogarithmic<number, number> | d3.ScaleLinear<number, number>).invert;
            start = invertScale(y1);
            end = invertScale(y2);
        }
        if (start > end) {
            [start, end] = [end, start];
        }
        return this.data.reduce<number[]>((result, row, i) => {
            const v = row[indicator.group][indicator.name] as number;
            if (v >= start && v <= end) {
                result.push(i);
            }
            return result;
        }, []);
    }

    private brushed(index: number, selection: [number, number] | null) {
        const indicator = this.sequenceGrids[index];
        if (selection == null) {
            this.brushedLineIndexesArray[index] = null;
        } else {
            if (indicator.type !== 'continuous') {
                this.brushedLineIndexesArray[index] = this.getDiscreteLineBySelection(index, selection);
            } else {
                this.brushedLineIndexesArray[index] = this.getContinuousLineBySelection(index, selection);
            }
        }
        this.updateLineColors();
    }

    private dragstart(indicator: GridIndicator, x: number) {
        this.draggingIndicator = {...indicator};
        this.dragStartX = x;
        indicator.grid?.classed('dragging', true);
    }

    private dragging(indicator: GridIndicator, x: number) {
        if (this.draggingIndicator) {
            const dx = x - this.dragStartX;
            const newX = Math.min(
                this.svgWidth - this.columnWidth + ParallelCoordinatesGraph.GRID_BRUSH_WIDTH / 2,
                Math.max(0, this.draggingIndicator.x + dx)
            );
            indicator.x = newX;
            this.calculateXScale();
            this.sequenceGrids.forEach(({grid, name, x}) =>
                grid?.attr('transform', `translate(${name === indicator.name ? newX : x}, 0)`)
            );
            this.updateLines(false, {indicator: indicator.name, x: newX});
            this.emit(
                'dragging',
                indicator.name,
                newX - indicator.x,
                this.sequenceGrids.map(({name}) => name)
            );
        }
    }

    private dragend() {
        this.draggingIndicator?.grid?.classed('dragging', false);
        this.draggingIndicator = null;
        this.updateGrids();
        this.updateLines();
        this.emit(
            'dragged',
            this.sequenceGrids.map(({name}) => name)
        );
    }

    private updateGrids(animation = true) {
        this.sequenceGrids.forEach(({grid, x}) =>
            this.select(grid, animation)?.attr('transform', `translate(${x}, 0)`)
        );
    }

    private updateLines(animation = true, extra?: {indicator: string; x: number}) {
        this.lines.forEach(g => {
            const circles = g.line?.selectAll('.select-indicator').nodes() ?? [];
            const line = d3.line()(
                this.sequenceGrids.map(({group, name, x: gx, yScale}, i) => {
                    let x = gx;
                    const y = yScale(g.data[group][name] as number) ?? 0;
                    if (extra && extra.indicator === name) {
                        x = extra.x;
                    }
                    if (circles[i]) {
                        this.select(d3.select(circles[i]), animation)?.attr('cx', x).attr('cy', y);
                    }
                    return [x, y];
                })
            );
            this.select(g.line?.selectAll('path'), animation)?.attr('d', line ?? '');
        });
    }

    private select<T extends d3.BaseType, G extends d3.BaseType>(
        selection: d3.Selection<T, unknown, G, unknown> | null | undefined,
        animation = false
    ) {
        if (animation) {
            return selection?.transition().duration(75);
        }
        return selection;
    }

    private setSvgSize() {
        const width = this.svgWidth;
        const height = ParallelCoordinatesGraph.GRAPH_HEIGHT + INDICATORS_HEIGHT;
        this.svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);
    }

    resize(containerWidth: number) {
        this.containerWidth = containerWidth;
        this.setSvgSize();
        this.calculateXScale();
        this.updateGrids(false);
        this.updateLines(false);
    }

    setColors(colors: string[]) {
        this.colors = colors;
        this.calculateLineColors();
        this.updateLineColors();
    }

    setScaleMethod(name: string, scaleMethod: ScaleMethod) {
        const indicator = this.grids.find(grid => grid.name === name);
        if (indicator) {
            indicator.scale = scaleMethod;
            this.removeGrids();
            this.calculateYScales();
            this.drawGrids();
            this.updateLines();
        }
    }

    render(indicators: Indicator[], data: DataListItem[]) {
        if (indicators.length !== this.grids.length) {
            this.unselectLine();
        } else {
            for (const newIdi of indicators) {
                const oldIdi = this.grids.find(g => g.name === newIdi.name);
                if (!oldIdi || oldIdi.group !== newIdi.group || oldIdi.type !== newIdi.type) {
                    this.unselectLine();
                    break;
                }
            }
        }
        this.unhoverLine();
        this.removeLines();
        this.removeGrids();

        this.grids = indicators.map(indicator => ({
            ...indicator,
            scale: ScaleMethod.LINEAR,
            x: 0,
            yScale: d3.scaleLinear(),
            grid: null
        }));
        this.data = data;
        this.setSvgSize();
        this.calculateXScale();
        this.calculateYScales();

        this.lines = data.map(row => {
            return {
                data: row,
                color: '',
                line: null
            };
        });
        this.calculateLineColors();
        this.drawLines();
        this.drawGrids();
    }

    dispose() {
        this.removeLines();
        this.removeGrids();
        this.svg.remove();
    }
}
