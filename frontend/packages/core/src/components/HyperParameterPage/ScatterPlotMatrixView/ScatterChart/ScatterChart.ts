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

// cspell:words quantile

import * as d3 from 'd3';

import EventEmitter from 'eventemitter3';
import type {IndicatorType} from '~/resource/hyper-parameter';
import {ScaleMethod} from '~/resource/hyper-parameter';

type Scale =
    | d3.ScalePoint<string | number>
    | d3.ScaleLinear<number, number>
    | d3.ScaleLogarithmic<number, number>
    | d3.ScaleQuantile<number>;

interface ScatterChartOptions {
    width: number;
    height: number;
    xScale: ScaleMethod;
    yScale: ScaleMethod;
    xLabelVisible: boolean;
    yLabelVisible: boolean;
}

export interface Point {
    data: [string | number, string | number];
    color: string;
}

export type Options = Partial<ScatterChartOptions>;

const DOT_RADIUS = 2;
const DOT_RADIUS_HOVER = 4;
const DOT_RADIUS_SELECT = 5;

interface EventTypes {
    hover: [number | null];
    select: [number | null];
}

export default class ScatterChart extends EventEmitter<EventTypes> {
    static MARGIN_WITHOUT_LABEL = 6;
    static MARGIN_LEFT_WITH_LABEL = 50;
    static MARGIN_BOTTOM_WITH_LABEL = 30;

    protected container: HTMLElement;
    protected width: number;
    protected height: number;

    private xScaleMethod: ScaleMethod | null = null;
    private yScaleMethod: ScaleMethod | null = null;
    private xScale: Scale = d3.scaleLinear();
    private yScale: Scale = d3.scaleLinear();
    private xAxis: d3.Axis<string | number> = d3.axisRight(d3.scaleLinear() as d3.AxisScale<string | number>);
    private yAxis: d3.Axis<string | number> = d3.axisRight(d3.scaleLinear() as d3.AxisScale<string | number>);
    private xGrid: d3.Axis<string | number> = d3.axisRight(d3.scaleLinear() as d3.AxisScale<string | number>);
    private yGrid: d3.Axis<string | number> = d3.axisRight(d3.scaleLinear() as d3.AxisScale<string | number>);
    private xLabel: d3.Axis<string | number> = d3.axisRight(d3.scaleLinear() as d3.AxisScale<string | number>);
    private yLabel: d3.Axis<string | number> = d3.axisRight(d3.scaleLinear() as d3.AxisScale<string | number>);

    private xLabelVisible = true;
    private yLabelVisible = true;

    private svg;
    private dots: d3.Selection<SVGCircleElement, unknown, null, undefined>[] = [];

    protected data: Point[] = [];
    protected type: [IndicatorType, IndicatorType] = ['continuous', 'continuous'];

    private hoveredIndex: number | null = null;
    private selectedIndex: number | null = null;

    get margin() {
        const {MARGIN_WITHOUT_LABEL, MARGIN_LEFT_WITH_LABEL, MARGIN_BOTTOM_WITH_LABEL} = ScatterChart;
        return {
            top: MARGIN_WITHOUT_LABEL,
            right: MARGIN_WITHOUT_LABEL,
            left: this.yLabelVisible ? MARGIN_LEFT_WITH_LABEL : MARGIN_WITHOUT_LABEL,
            bottom: this.xLabelVisible ? MARGIN_BOTTOM_WITH_LABEL : MARGIN_WITHOUT_LABEL
        };
    }

    constructor(container: HTMLElement, options?: Options) {
        super();

        this.container = container;
        this.width = options?.width ?? 150;
        this.height = options?.height ?? 150;
        this.xScaleMethod = options?.xScale ?? null;
        this.yScaleMethod = options?.yScale ?? null;
        this.xLabelVisible = options?.xLabelVisible ?? true;
        this.yLabelVisible = options?.yLabelVisible ?? true;

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

        this.createAxises();
    }

    private createAxises() {
        this.svg
            .append('g')
            .classed('axises', true)
            // grids at bottom
            .call(g => g.append('g').classed('x-grid', true))
            .call(g => g.append('g').classed('y-grid', true))
            .call(g => g.append('g').classed('x-axis', true))
            .call(g => g.append('g').classed('y-axis', true))
            .call(g => g.append('g').classed('x-label', true))
            .call(g => g.append('g').classed('y-label', true))
            .call(g => g.append('g').classed('dots', true))
            .call(g => g.append('g').classed('select-dots', true))
            .call(g => g.append('g').classed('hover-dots', true));

        this.xAxis = d3.axisTop(this.xScale as d3.AxisScale<number | string>);
        this.yAxis = d3.axisRight(this.yScale as d3.AxisScale<number | string>);
        this.xGrid = d3.axisTop(this.xScale as d3.AxisScale<number | string>);
        this.yGrid = d3.axisRight(this.yScale as d3.AxisScale<number | string>);
        this.xLabel = d3.axisBottom(this.xScale as d3.AxisScale<number | string>);
        this.yLabel = d3.axisLeft(this.yScale as d3.AxisScale<number | string>);
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
        return d3.scalePoint<string | number>();
    }

    private scaleDots() {
        this.dots.forEach((dot, i) => {
            dot.transition()
                .duration(75)
                .attr('r', i === this.hoveredIndex || i === this.selectedIndex ? DOT_RADIUS_HOVER : DOT_RADIUS);
        });
    }

    private draw() {
        this.hoveredIndex = null;
        this.selectedIndex = null;

        this.xScale = this.createScale(this.type[0], this.xScaleMethod);
        this.yScale = this.createScale(this.type[1], this.yScaleMethod);

        const [xType, yType] = this.type;

        const xValues = this.data.map(r => r.data[0] as number);
        this.xScale.domain(xType === 'continuous' ? d3.extent(xValues) : [...new Set(xValues)]);
        const yValues = this.data.map(r => r.data[1] as number);
        this.yScale.domain(yType === 'continuous' ? d3.extent(yValues) : [...new Set(yValues)]);

        const {left, top} = this.margin;

        this.xScale.range([left, this.width + left]);
        this.yScale.range([this.height + top, top]);

        [this.xAxis, this.xGrid, this.xLabel].forEach(axis => axis.scale(this.xScale as d3.AxisScale<number | string>));
        [this.yAxis, this.yGrid, this.yLabel].forEach(axis => axis.scale(this.yScale as d3.AxisScale<number | string>));

        this.xGrid.tickSize(this.height);
        this.yGrid.tickSize(this.width);

        const xAxisGroup = this.svg.select<SVGGElement>('.x-axis');
        const xGridGroup = this.svg.select<SVGGElement>('.x-grid');
        const xLabelGroup = this.svg.select<SVGGElement>('.x-label');
        const yAxisGroup = this.svg.select<SVGGElement>('.y-axis');
        const yGridGroup = this.svg.select<SVGGElement>('.y-grid');
        const yLabelGroup = this.svg.select<SVGGElement>('.y-label');

        [xAxisGroup, xGridGroup, xLabelGroup].forEach(group =>
            group.attr('transform', `translate(0, ${this.height + top})`).call(g => g.selectChildren().remove())
        );
        [yAxisGroup, yGridGroup, yLabelGroup].forEach(group =>
            group.attr('transform', `translate(${left}, 0)`).call(g => g.selectChildren().remove())
        );

        xAxisGroup.call(this.xAxis).selectAll('.tick text').remove();
        yAxisGroup.call(this.yAxis).selectAll('.tick text').remove();

        xGridGroup
            .call(this.xGrid)
            .call(g => g.selectAll('.tick text').remove())
            .call(g => g.select('.domain').remove());
        yGridGroup
            .call(this.yGrid)
            .call(g => g.selectAll('.tick text').remove())
            .call(g => g.select('.domain').remove());

        if (this.xLabelVisible) {
            xLabelGroup
                .call(this.xLabel)
                .call(g => g.selectAll('.tick line').remove())
                .call(g => g.select('.domain').remove());
        }
        if (this.yLabelVisible) {
            yLabelGroup
                .call(this.yLabel)
                .call(g => g.selectAll('.tick line').remove())
                .call(g => g.select('.domain').remove());
        }

        const dots = this.svg.select<SVGGElement>('.dots');
        const hoverDots = this.svg.select<SVGGElement>('.hover-dots');
        const selectDots = this.svg.select<SVGGElement>('.select-dots');
        dots.selectChildren().remove();
        hoverDots.selectChildren().remove();
        selectDots.selectChildren().remove();

        this.dots = [];
        this.data.forEach((item, i) => {
            const x = this.xScale(item.data[0] as number) ?? 0;
            const y = this.yScale(item.data[1] as number) ?? 0;
            const dot = dots
                .append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', DOT_RADIUS)
                .attr('fill', item.color);
            hoverDots
                .append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', DOT_RADIUS_HOVER)
                .attr('fill', 'transparent')
                .on('mouseenter', () => this.hover(i))
                .on('mouseleave', () => this.hover(null))
                .on('click', (e: Event) => {
                    this.select(i);
                    e.stopPropagation();
                });
            this.dots.push(dot);
        });
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
        const selectDots = this.svg.select<SVGGElement>('.select-dots');
        selectDots.selectChildren().remove();
        this.dots.forEach((dot, i) => {
            if (i === index) {
                const x = dot.attr('cx');
                const y = dot.attr('cy');
                const color = dot.attr('fill');
                selectDots
                    .append('circle')
                    .attr('cx', x)
                    .attr('cy', y)
                    .attr('r', DOT_RADIUS_HOVER)
                    .attr('fill', 'none')
                    .attr('stroke', color)
                    .attr('stroke-width', 1)
                    .transition()
                    .duration(75)
                    .attr('r', DOT_RADIUS_SELECT);
            }
        });
        this.emit('select', index);
    }

    render(data: Point[], type: [IndicatorType, IndicatorType]) {
        this.data = data;
        this.type = type;

        this.draw();
    }

    dispose() {
        this.svg.remove();
    }
}
