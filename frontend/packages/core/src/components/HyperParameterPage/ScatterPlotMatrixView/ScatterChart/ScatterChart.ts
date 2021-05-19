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

// cspell:words quantile quantiles

import * as d3 from 'd3';

import EventEmitter from 'eventemitter3';
import type {IndicatorType} from '~/resource/hyper-parameter';
import {ScaleMethod} from '~/resource/hyper-parameter';
import intersection from 'lodash/intersection';

type Scale =
    | d3.ScalePoint<string | number>
    | d3.ScaleLinear<number, number>
    | d3.ScaleLogarithmic<number, number>
    | d3.ScaleQuantile<number>;

interface ScatterChartOptions {
    width: number;
    height: number;
    colors: string[];
    labelVisible: [boolean, boolean];
}

export type Point = [string | number, string | number];

export type Options = Partial<ScatterChartOptions>;

const DOT_RADIUS = 2;
const DOT_RADIUS_HOVER = 4;
const DOT_RADIUS_SELECT = 5;
const DEFAULT_COLOR = '#000';
const LOGARITHMIC_TICKS = 2;

interface EventTypes {
    hover: [number | null];
    select: [number | null];
    brush: [number[] | null];
}

export default class ScatterChart extends EventEmitter<EventTypes> {
    static MARGIN_WITHOUT_LABEL = 8;
    static MARGIN_LEFT_WITH_LABEL = 50;
    static MARGIN_BOTTOM_WITH_LABEL = 30;

    protected container: HTMLElement;
    protected width: number;
    protected height: number;
    protected labelVisible = [true, true];

    private scale: [Scale, Scale] = [d3.scaleLinear(), d3.scaleLinear()];
    private axis: [d3.Axis<string | number>, d3.Axis<string | number>] = [
        d3.axisTop(d3.scaleLinear() as d3.AxisScale<string | number>),
        d3.axisRight(d3.scaleLinear() as d3.AxisScale<string | number>)
    ];
    private grid: [d3.Axis<string | number>, d3.Axis<string | number>] = [
        d3.axisTop(d3.scaleLinear() as d3.AxisScale<string | number>),
        d3.axisRight(d3.scaleLinear() as d3.AxisScale<string | number>)
    ];
    private label: [d3.Axis<string | number>, d3.Axis<string | number>] = [
        d3.axisBottom(d3.scaleLinear() as d3.AxisScale<string | number>),
        d3.axisLeft(d3.scaleLinear() as d3.AxisScale<string | number>)
    ];

    private svg;
    private brush: d3.BrushBehavior<unknown> = d3.brush();
    private dots: d3.Selection<SVGCircleElement, unknown, null, undefined>[] = [];
    private hoverDots: d3.Selection<SVGCircleElement, unknown, null, undefined>[] = [];

    protected data: Point[] = [];
    protected type: [IndicatorType, IndicatorType] = ['continuous', 'continuous'];
    protected colors: string[] = [];
    protected scaleMethod: [ScaleMethod | null, ScaleMethod | null] = [null, null];

    private hoveredIndex: number | null = null;
    private selectedIndex: number | null = null;
    private brushedIndexes: number[] | null = null;
    private brushing = false;

    get margin() {
        const {MARGIN_WITHOUT_LABEL, MARGIN_LEFT_WITH_LABEL, MARGIN_BOTTOM_WITH_LABEL} = ScatterChart;
        return {
            top: MARGIN_WITHOUT_LABEL,
            right: MARGIN_WITHOUT_LABEL,
            left: this.labelVisible[1] ? MARGIN_LEFT_WITH_LABEL : MARGIN_WITHOUT_LABEL,
            bottom: this.labelVisible[0] ? MARGIN_BOTTOM_WITH_LABEL : MARGIN_WITHOUT_LABEL
        };
    }

    get ticks() {
        return [
            this.scaleMethod[0] === ScaleMethod.LOGARITHMIC ? LOGARITHMIC_TICKS : this.width / 30,
            this.scaleMethod[1] === ScaleMethod.LOGARITHMIC ? LOGARITHMIC_TICKS : this.height / 20
        ].map(Math.floor);
    }

    constructor(container: HTMLElement, options?: Options) {
        super();

        this.container = container;
        this.width = options?.width ?? 150;
        this.height = options?.height ?? 150;
        this.colors = options?.colors ?? [];
        this.labelVisible = options?.labelVisible ?? [true, true];

        const {left, right, top, bottom} = this.margin;
        const width = this.width + left + right;
        const height = this.height + top + bottom;
        this.svg = d3
            .select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .on('click', () => this.select(null));

        this.init();
    }

    private init() {
        this.svg
            .append('g')
            .classed('axises', true)
            // grids at bottom
            .call(g => g.append('g').classed('x-grid', true))
            .call(g => g.append('g').classed('y-grid', true))
            .call(g => g.append('g').classed('x-axis', true))
            .call(g => g.append('g').classed('y-axis', true))
            .call(g => g.append('g').classed('x-label', true))
            .call(g => g.append('g').classed('y-label', true));

        const {left, top} = this.margin;
        this.brush = d3
            .brush()
            .extent([
                [left - 0.5, top - 0.5],
                [this.width + left + 0.5, this.height + top + 0.5]
            ])
            .on('start', () => (this.brushing = true))
            .on('brush', ({selection}) => this.brushed(selection))
            .on('end', ({selection}) => {
                this.brushed(selection);
                this.brushing = false;
            });
        this.svg
            .call(g => g.append('g').classed('dots', true))
            .call(g => g.append('g').classed('brush', true).call(this.brush))
            .call(g => g.append('g').classed('select-dots', true))
            .call(g => g.append('g').classed('hover-dots', true));
    }

    private createScale(type: IndicatorType, scaleMethod: ScaleMethod | null) {
        if (type === 'continuous') {
            if (scaleMethod === ScaleMethod.QUANTILE) {
                return d3.scaleQuantile();
            }
            if (scaleMethod === ScaleMethod.LOGARITHMIC) {
                return d3.scaleLog();
            }
            return d3.scaleLinear();
        }
        return d3.scalePoint<string | number>().padding(0.5);
    }

    private scaleDots() {
        this.dots.forEach((dot, i) => {
            dot.attr('r', i === this.hoveredIndex || i === this.selectedIndex ? DOT_RADIUS_HOVER : DOT_RADIUS);
        });
    }

    private colorizeDots() {
        this.dots.forEach((dot, i) => {
            const disabled = this.brushedIndexes != null && !this.brushedIndexes.includes(i);
            dot.classed('disabled', disabled).attr('stroke', 'none');
            if (disabled) {
                dot.attr('fill', null);
            } else {
                dot.attr('fill', this.colors[i] ?? DEFAULT_COLOR);
            }
        });
        this.hoverDots.forEach((dot, i) =>
            dot.classed('disabled', this.brushedIndexes != null && !this.brushedIndexes.includes(i))
        );
        if (this.selectedIndex != null) {
            this.svg.selectAll('.select-dots circle').attr('stroke', this.colors[this.selectedIndex] ?? DEFAULT_COLOR);
        }
    }

    private drawSelectedDot() {
        const selectDots = this.svg.select<SVGGElement>('.select-dots');
        selectDots.selectAll('*').remove();
        this.dots.forEach((dot, i) => {
            if (i === this.selectedIndex) {
                const x = dot.attr('cx');
                const y = dot.attr('cy');
                const color = dot.attr('fill');
                selectDots
                    .append('circle')
                    .attr('cx', x)
                    .attr('cy', y)
                    .attr('r', DOT_RADIUS_SELECT)
                    .attr('fill', 'none')
                    .attr('stroke', color)
                    .attr('stroke-width', 1);
            }
        });
    }

    private draw() {
        this.scale = this.scale.map((_, i) => this.createScale(this.type[i], this.scaleMethod[i])) as [Scale, Scale];

        const {left, top} = this.margin;

        const domain = this.type.map((type, i) => {
            const values = this.data.map(r => r[i] as number);
            if (type !== 'continuous') {
                return [...new Set(values)];
            }
            return d3.extent(values);
        });

        const range = [
            [left, this.width + left],
            [this.height + top, top]
        ];
        this.scaleMethod.forEach((scaleMethod, i) => {
            if (scaleMethod === ScaleMethod.QUANTILE) {
                const ticks = this.ticks[i];
                const step = (range[i][1] - range[i][0]) / (ticks - 1);
                range[i] = d3.range(ticks).map(j => range[i][0] + step * j);
            }
        });

        this.scale.forEach((scale, i) => {
            (scale.domain(domain[i]) as Scale).range(range[i]);
        });

        [this.axis, this.grid, this.label].forEach(axises => {
            axises.forEach((axis, i) => {
                axis.scale(this.scale[i] as d3.AxisScale<number | string>);
                if (this.scaleMethod[i] === ScaleMethod.QUANTILE) {
                    (axis as d3.Axis<number>)
                        .tickValues((this.scale[i] as d3.ScaleQuantile<number>).quantiles())
                        .tickFormat(d3.format('-.2g'));
                } else {
                    axis.tickValues(null).tickFormat(null);
                    if (this.type[i] === 'continuous') {
                        axis.ticks(this.ticks[i]);
                    }
                }
            });
        });

        this.grid[0].tickSize(this.height);
        this.grid[1].tickSize(this.width);

        const axisGroup = [this.svg.select<SVGGElement>('.x-axis'), this.svg.select<SVGGElement>('.y-axis')];
        const gridGroup = [this.svg.select<SVGGElement>('.x-grid'), this.svg.select<SVGGElement>('.y-grid')];
        const labelGroup = [this.svg.select<SVGGElement>('.x-label'), this.svg.select<SVGGElement>('.y-label')];

        [axisGroup, gridGroup, labelGroup].forEach(group => {
            group[0].attr('transform', `translate(0, ${this.height + top})`).call(g => g.selectAll('*').remove());
            group[1].attr('transform', `translate(${left}, 0)`).call(g => g.selectAll('*').remove());
        });

        axisGroup.forEach((group, i) => group.call(this.axis[i]).selectAll('.tick text').remove());

        gridGroup.forEach((group, i) =>
            group
                .call(this.grid[i])
                .call(g => g.selectAll('.tick text').remove())
                .call(g => g.select('.domain').remove())
        );

        labelGroup.forEach((group, i) => {
            if (this.labelVisible[i]) {
                group
                    .call(this.label[i])
                    .call(g => g.selectAll('.tick line').remove())
                    .call(g => g.select('.domain').remove());
            }
        });

        const dots = this.svg.select<SVGGElement>('.dots');
        const hoverDots = this.svg.select<SVGGElement>('.hover-dots');
        const selectDots = this.svg.select<SVGGElement>('.select-dots');
        dots.selectAll('*').remove();
        hoverDots.selectAll('*').remove();
        selectDots.selectAll('*').remove();

        this.dots = [];
        this.hoverDots = [];
        this.data.forEach((item, i) => {
            const x = this.scale[0](item[0] as number) ?? 0;
            const y = this.scale[1](item[1] as number) ?? 0;
            const dot = dots
                .append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', DOT_RADIUS)
                .attr('fill', this.colors[i] ?? DEFAULT_COLOR);
            const hoverDot = hoverDots
                .append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', DOT_RADIUS_HOVER)
                .attr('fill', 'transparent')
                .on('mouseenter', () => {
                    if (dot.classed('disabled') || this.brushing) {
                        return;
                    }
                    this.hover(i);
                })
                .on('mouseleave', () => {
                    if (dot.classed('disabled') || this.brushing) {
                        return;
                    }
                    this.hover(null);
                })
                .on('click', (e: Event) => {
                    if (dot.classed('disabled') || this.brushing) {
                        return;
                    }
                    this.select(i);
                    e.stopPropagation();
                });
            this.dots.push(dot);
            this.hoverDots.push(hoverDot);
        });
    }

    private dataInSelection(axisIndex: number, [a, b]: [number, number]) {
        const axis = axisIndex === 1 ? 'y' : 'x';
        const scaleMethod = this.scaleMethod[axisIndex];
        const scale = this.scale[axisIndex];
        const type = this.type[axisIndex];
        const [f, t] = a < b ? [a, b] : [b, a];
        if (type === 'continuous') {
            let start: number;
            let end: number;
            if (scaleMethod === ScaleMethod.QUANTILE) {
                const quantileScale = scale as d3.ScaleQuantile<number>;
                const range = quantileScale.range();
                const domains = range
                    .filter(v => f <= v && v <= t)
                    .map(v => {
                        const domain = quantileScale.invertExtent(v);
                        return v === range[range.length - 1] ? [domain[0], domain[1] + 1] : domain;
                    });
                [start, end] = d3.extent(d3.merge<number>(domains)) as [number, number];
            } else {
                const invertScale = (scale as d3.ScaleLogarithmic<number, number> | d3.ScaleLinear<number, number>)
                    .invert;
                start = invertScale(f);
                end = invertScale(t);
            }
            if (axis === 'y') {
                [start, end] = [end, start];
            }
            return this.data.reduce<number[]>((result, item, index) => {
                if (item[axisIndex] >= start && item[axisIndex] <= end) {
                    result.push(index);
                }
                return result;
            }, []);
        } else {
            const pointScale = scale as d3.ScalePoint<string | number>;
            const domain = pointScale.domain();
            const step = pointScale.step();
            const padding = pointScale.padding() * step;
            const margin = axis === 'x' ? this.margin.left : this.margin.top;
            let s = (f - margin - padding) / step;
            let e = (t - margin - padding) / step;
            if (axis === 'y') {
                [s, e] = [e, s];
            }
            let start: number;
            let end: number;
            if (axis === 'x') {
                start = Math.max(Math.floor(s) + 1, 0);
                end = Math.min(Math.ceil(e) - 1, domain.length - 1);
            } else {
                start = domain.length - Math.min(Math.floor(s), domain.length - 1) - 1;
                end = domain.length - Math.max(Math.ceil(e), 0) - 1;
            }
            return this.data.reduce<number[]>((result, item, index) => {
                const vi = domain.indexOf(item[axisIndex]);
                if (vi >= start && vi <= end) {
                    result.push(index);
                }
                return result;
            }, []);
        }
    }

    private brushed(selection: [[number, number], [number, number]] | null) {
        this.select(null);
        let indexes: number[] | null = null;
        if (selection) {
            indexes = intersection(
                ...selection.map((_, i) => this.dataInSelection(i, [selection[0][i], selection[1][i]]))
            );
        }
        this.clearableBrush(indexes);
        this.emit('brush', indexes);
    }

    private clearableBrush(indexes: number[] | null, clearBrush = false) {
        if (clearBrush) {
            this.brush.clear(this.svg.select('.brush'));
        }
        this.brushedIndexes = indexes;
        this.colorizeDots();
    }

    focus(indexes: number[] | null) {
        this.clearableBrush(indexes, true);
    }

    hover(index: number | null) {
        if (index === this.hoveredIndex) {
            return;
        }
        this.hoveredIndex = index;
        this.scaleDots();
        this.emit('hover', index);
    }

    select(index: number | null) {
        this.selectedIndex = index;
        this.scaleDots();
        this.drawSelectedDot();
        this.emit('select', index);
    }

    setColors(colors: string[]) {
        this.colors = colors;
        this.colorizeDots();
        this.drawSelectedDot();
    }

    setScaleMethod(scaleMethod: [ScaleMethod | null, ScaleMethod | null]) {
        this.scaleMethod = scaleMethod;
        this.brushedIndexes = null;
        this.brush.clear(this.svg.select('.brush'));
        this.draw();
        this.colorizeDots();
        this.scaleDots();
    }

    render(data: Point[], type: [IndicatorType, IndicatorType]) {
        this.hoveredIndex = null;
        this.selectedIndex = null;

        this.data = data;
        this.type = type;
        this.colors = [];

        this.draw();
    }

    dispose() {
        this.svg.remove();
    }
}
