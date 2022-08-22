/**
 * Copyright 2020 Baidu Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var grapher = grapher || {};

var dagre = dagre || require('dagre');

grapher.Renderer = class {
    constructor(host, svgElement, view) {
        this._document = host.document;

        this._svgElement = svgElement;

        this._host = host;

        this._view = view;
    }

    render(graph) {
        let svgClusterGroup = null;

        let svgEdgePathGroup = null;

        let svgEdgeLabelGroup = null;

        let svgNodeGroup = null;

        svgClusterGroup = this.createElement('g');

        svgClusterGroup.setAttribute('id', 'clusters');

        svgClusterGroup.setAttribute('class', 'clusters');

        this._svgElement.appendChild(svgClusterGroup);

        svgEdgePathGroup = this.createElement('g');

        svgEdgePathGroup.setAttribute('id', 'edge-paths');

        svgEdgePathGroup.setAttribute('class', 'edge-paths');

        this._svgElement.appendChild(svgEdgePathGroup);

        svgEdgeLabelGroup = this.createElement('g');

        svgEdgeLabelGroup.setAttribute('id', 'edge-labels');

        svgEdgeLabelGroup.setAttribute('class', 'edge-labels');

        this._svgElement.appendChild(svgEdgeLabelGroup);

        svgNodeGroup = this.createElement('g');

        svgNodeGroup.setAttribute('id', 'nodes');

        svgNodeGroup.setAttribute('class', 'nodes');

        this._svgElement.appendChild(svgNodeGroup);
        // } else {
        // svgClusterGroup = this._document.getElementById('clusters')
        // svgEdgePathGroup = this._document.getElementById('edge-paths')
        // svgEdgeLabelGroup = this._document.getElementById('edge-labels')
        // svgNodeGroup = this._document.getElementById('nodes')
        // }

        for (const nodeId of graph.nodes()) {
            if (graph.children(nodeId).length == 0) {
                const node = graph.node(nodeId);

                // 在这里进行缓存的判断
                // console.log('this._document', this._document);
                // const nodeDom = this._document.getElementById(node.id);
                // console.log('nodeDom', nodeDom);
                if (this._view._nodes.hasOwnProperty(node.id)) {
                    // 这个节点存在过
                    svgNodeGroup.appendChild(this._view._nodes[node.id]);
                    const nodeBox = this._view._nodes[node.id].getBBox();

                    node.width = nodeBox.width;

                    node.height = nodeBox.height;

                    node.element = this._view._nodes[node.id];
                } else {
                    const element = this.createElement('g');

                    if (node.id) {
                        element.setAttribute('id', node.id);
                    }
                    element.setAttribute(
                        'class',
                        Object.prototype.hasOwnProperty.call(node, 'class') ? 'node ' + node.class : 'node'
                    );
                    element.style.opacity = 0;

                    const container = this.createElement('g');

                    container.appendChild(node.label);
                    // node.label 就是fromat 之后的节点
                    element.appendChild(container);
                    svgNodeGroup.appendChild(element);
                    const nodeBox = node.label.getBBox();

                    const nodeX = -nodeBox.width / 2;

                    const nodeY = -nodeBox.height / 2;

                    container.setAttribute('transform', 'translate(' + nodeX + ',' + nodeY + ')');

                    node.width = nodeBox.width;

                    node.height = nodeBox.height;

                    node.element = element;
                }
            }
        }

        for (const edgeId of graph.edges()) {
            const edge = graph.edge(edgeId);

            if (edge.label) {
                const tspan = this.createElement('tspan');

                tspan.setAttribute('xml:space', 'preserve');

                tspan.setAttribute('dy', '1em');

                tspan.setAttribute('x', '1');

                tspan.appendChild(this._document.createTextNode(edge.label));
                const text = this.createElement('text');

                text.appendChild(tspan);
                const textContainer = this.createElement('g');

                textContainer.appendChild(text);
                const labelElement = this.createElement('g');

                labelElement.style.opacity = 0;

                labelElement.setAttribute('class', 'edge-label');

                labelElement.appendChild(textContainer);
                svgEdgeLabelGroup.appendChild(labelElement);
                const edgeBox = textContainer.getBBox();

                const edgeX = -edgeBox.width / 2;

                const edgeY = -edgeBox.height / 2;

                textContainer.setAttribute('transform', 'translate(' + edgeX + ',' + edgeY + ')');

                edge.width = edgeBox.width;

                edge.height = edgeBox.height;

                edge.labelElement = labelElement;
            }
        }

        dagre.layout(graph);
        // 实际要变的就是这一块
        for (const nodeId of graph.nodes()) {
            if (graph.children(nodeId).length == 0) {
                const node = graph.node(nodeId);

                node.element.setAttribute('transform', 'translate(' + node.x + ',' + node.y + ')');

                node.element.style.opacity = 1;

                delete node.element;
            }
        }

        for (const edgeId of graph.edges()) {
            const edge = graph.edge(edgeId);

            if (edge.labelElement) {
                edge.labelElement.setAttribute('transform', 'translate(' + edge.x + ',' + edge.y + ')');

                edge.labelElement.style.opacity = 1;

                delete edge.labelElement;
            }
        }

        const edgePathGroupDefs = this.createElement('defs');

        svgEdgePathGroup.appendChild(edgePathGroupDefs);
        const marker = this.createElement('marker');

        marker.setAttribute('id', 'arrowhead-vee');

        marker.setAttribute('viewBox', '0 0 10 10');

        marker.setAttribute('refX', 9);

        marker.setAttribute('refY', 5);

        marker.setAttribute('markerUnits', 'strokeWidth');

        marker.setAttribute('markerWidth', 8);

        marker.setAttribute('markerHeight', 6);

        marker.setAttribute('orient', 'auto');

        edgePathGroupDefs.appendChild(marker);
        const markerPath = this.createElement('path');

        markerPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 L 4 5 z');

        markerPath.style.setProperty('stroke-width', 1);

        markerPath.style.setProperty('stroke-dasharray', '1,0');

        marker.appendChild(markerPath);

        for (const edgeId of graph.edges()) {
            const edge = graph.edge(edgeId);

            const edgePath = grapher.Renderer._computeCurvePath(edge, graph.node(edgeId.v), graph.node(edgeId.w));

            const edgeElement = this.createElement('path');

            edgeElement.setAttribute(
                'class',
                Object.prototype.hasOwnProperty.call(edge, 'class') ? 'edge-path ' + edge.class : 'edge-path'
            );
            edgeElement.setAttribute('d', edgePath);

            edgeElement.setAttribute('marker-end', 'url(#arrowhead-vee)');

            if (edge.id) {
                edgeElement.setAttribute('id', edge.id);
            }
            if (edge.fromnode) {
                edgeElement.setAttribute('fromnode', edge.fromnode);
            }
            if (edge.tonode) {
                edgeElement.setAttribute('tonode', edge.tonode);
            }
            svgEdgePathGroup.appendChild(edgeElement);
        }
        const groupArray = [];

        for (const nodeId of graph.nodes()) {
            if (!Number(nodeId) && Number(nodeId) !== 0) {
                groupArray.push(nodeId);
            }
        }
        const newGroupArray = groupArray.sort((a, b) => {
            let level1 = a.split('/').length;

            let level2 = b.split('/').length;

            return level1 - level2;
        });
        for (const nodeId of newGroupArray) {
            if (graph.children(nodeId).length > 0) {
                const node = graph.node(nodeId);

                if (this._view._clusters.hasOwnProperty(node.id)) {
                    const nodeDom = this._view._clusters.hasOwnProperty(node.id);

                    nodeDom.setAttribute('transform', 'translate(' + node.x + ',' + node.y + ')');

                    nodeDom.firstChild.setAttribute('x', -node.width / 2);

                    nodeDom.firstChild.setAttribute('y', -node.height / 2);

                    nodeDom.firstChild.setAttribute('width', node.width + 10);

                    nodeDom.firstChild.setAttribute('height', node.height + 10);
                } else {
                    const nodeElement = this.createElement('g');

                    nodeElement.setAttribute('class', 'cluster');

                    nodeElement.setAttribute('id', `node-${nodeId}`);

                    nodeElement.setAttribute('transform', 'translate(' + node.x + ',' + node.y + ')');

                    const rect = this.createElement('rect');

                    const tspan = this.createElement('tspan');

                    const button = this.createElement('circle');

                    const buttonSign = this.createElement('tspan');

                    button.setAttribute('r', '6.5');

                    button.setAttribute('cx', node.width / 2 - 20 + 7.5 + 10);

                    button.setAttribute('cy', -(node.height / 2) + 5 + 7.5);

                    buttonSign.setAttribute('x', node.width / 2 - 15 + 9);

                    buttonSign.setAttribute('y', -(node.height / 2) + 1.3);

                    buttonSign.setAttribute('xml:space', 'preserve');

                    buttonSign.setAttribute('dy', '1em');

                    buttonSign.setAttribute('font-size', '16px');

                    buttonSign.setAttribute('class', 'button-text');

                    button.setAttribute('class', 'clusterButton');

                    tspan.setAttribute('xml:space', 'preserve');

                    tspan.setAttribute('dy', '1em');

                    tspan.setAttribute('x', 0);

                    tspan.setAttribute('y', -(node.height / 2) + 5);

                    tspan.setAttribute('text-anchor', 'middle');

                    let name = '';

                    for (const nodes of this._host._view._allGraph.nodes) {
                        if (nodes.name === node.nodeId) {
                            name = nodes.show_name.split('/')[nodes.show_name.split('/').length - 1];
                        }
                    }
                    tspan.appendChild(this._document.createTextNode(name));
                    buttonSign.appendChild(this._document.createTextNode('-'));
                    const text = this.createElement('text');

                    text.appendChild(tspan);
                    const text2 = this.createElement('text');

                    text2.appendChild(buttonSign);
                    rect.setAttribute('class', node.classList.join(' '));

                    rect.setAttribute('x', -node.width / 2);

                    rect.setAttribute('y', -node.height / 2);

                    rect.setAttribute('width', node.width + 10);

                    rect.setAttribute('height', node.height + 10);

                    const borderElement = this.createElement('path');

                    borderElement.setAttribute('class', ['cluster', 'border'].join(' '));

                    borderElement.setAttribute(
                        'd',
                        grapher.NodeElement.roundedRect2(
                            -node.width / 2,

                            -node.height / 2,

                            node.width + 10,

                            node.height + 10,

                            true,
                            true,
                            true,
                            true
                        )
                    );
                    nodeElement.addEventListener('click', () => {
                        this._view.select({
                            id: `node-${nodeId}`,

                            name: nodeId,

                            type: 'node'
                        });
                    });
                    text2.addEventListener('click', () => {
                        this._host.selectNodeId({
                            nodeId: node.nodeId,

                            expand: node.expand,

                            isKeepData: node.isKeepData
                        });
                        this._host.selectItems({
                            id: `node-${node.nodeId}`,

                            name: node.nodeId,

                            type: 'node'
                        });
                    });
                    rect.addEventListener('click', () => {
                        if (this._view.isCtrl) {
                            for (const nodes of this._view._allGraph.nodes) {
                                if (nodes.name === node.nodeId) {
                                    for (const type of this._view.non_graphMetadatas) {
                                        if (type.name === nodes.type) {
                                            if (this._view.Language === 'zh') {
                                                window.open(
                                                    `https://www.paddlepaddle.org.cn/documentation/docs/zh/api/paddle/nn/${type.name}_cn.html`
                                                );
                                            } else {
                                                window.open(
                                                    `https://www.paddlepaddle.org.cn/documentation/docs/en/api/paddle/nn/${type.name}_en.html`
                                                );
                                            }
                                        }
                                    }
                                    this._view.showNodeProperties(nodes);
                                    return;
                                }
                            }
                        } else {
                            for (const nodes of this._view._allGraph.nodes) {
                                if (nodes.name === node.nodeId) {
                                    this._view.showNodeProperties(nodes);
                                    return;
                                }
                            }
                        }
                    });
                    if (node.rx) {
                        rect.setAttribute('rx', node.rx);
                    }
                    if (node.ry) {
                        rect.setAttribute('ry', node.ry);
                    }

                    nodeElement.appendChild(rect);
                    nodeElement.appendChild(text);
                    nodeElement.appendChild(button);
                    nodeElement.appendChild(text2);
                    nodeElement.appendChild(borderElement);
                    svgClusterGroup.appendChild(nodeElement);
                }
            }
        }
    }

    createElement(name) {
        return this._document.createElementNS('http://www.w3.org/2000/svg', name);
    }

    static _computeCurvePath(edge, tail, head) {
        const points = edge.points.slice(1, edge.points.length - 1);

        points.unshift(grapher.Renderer.intersectRect(tail, points[0]));

        points.push(grapher.Renderer.intersectRect(head, points[points.length - 1]));

        const path = new Path();

        const curve = new Curve(path);

        for (let i = 0; i < points.length; i++) {
            const point = points[i];

            if (i == 0) {
                curve.lineStart();
            }
            curve.point(point.x, point.y);

            if (i == points.length - 1) {
                curve.lineEnd();
            }
        }

        return path.data;
    }

    static intersectRect(node, point) {
        const x = node.x;

        const y = node.y;

        const dx = point.x - x;

        const dy = point.y - y;

        let w = node.width / 2;

        let h = node.height / 2;

        let sx;

        let sy;

        if (Math.abs(dy) * w > Math.abs(dx) * h) {
            if (dy < 0) {
                h = -h;
            }
            sx = dy === 0 ? 0 : (h * dx) / dy;

            sy = h;
        } else {
            if (dx < 0) {
                w = -w;
            }
            sx = w;

            sy = dx === 0 ? 0 : (w * dy) / dx;
        }
        return {x: x + sx, y: y + sy};
    }
};

grapher.NodeElement = class {
    constructor(document) {
        this._document = document;

        this._blocks = [];
    }

    block(type) {
        this._block = null;

        switch (type) {
            case 'header':
                this._block = new grapher.NodeElement.Header(this._document);

                break;
            case 'list':
                this._block = new grapher.NodeElement.List(this._document);

                break;
        }
        this._blocks.push(this._block);
        return this._block;
    }

    format(contextElement) {
        const rootElement = this.createElement('g');

        contextElement.appendChild(rootElement);
        let width = 0;

        let height = 0;

        const tops = [];

        for (const block of this._blocks) {
            tops.push(height);
            block.layout(rootElement);
            if (width < block.width) {
                width = block.width;
            }
            height = height + block.height;
        }

        for (let i = 0; i < this._blocks.length; i++) {
            // push 进来的header 或者 list
            const top = tops.shift();

            this._blocks[i].update(rootElement, top, width, i == 0, i == this._blocks.length - 1);
        }
        const borderElement = this.createElement('path');

        borderElement.setAttribute('class', ['node', 'border'].join(' '));

        borderElement.setAttribute('d', grapher.NodeElement.roundedRect(0, 0, width, height, true, true, true, true));

        rootElement.appendChild(borderElement);
        contextElement.innerHTML = '';

        return rootElement;
    }

    static roundedRect(x, y, width, height, r1, r2, r3, r4) {
        const radius = 5;

        r1 = r1 ? radius : 0;

        r2 = r2 ? radius : 0;

        r3 = r3 ? radius : 0;

        r4 = r4 ? radius : 0;

        return (
            'M' +
            (x + r1) +
            ',' +
            y +
            'h' +
            (width - r1 - r2) +
            'a' +
            r2 +
            ',' +
            r2 +
            ' 0 0 1 ' +
            r2 +
            ',' +
            r2 +
            'v' +
            (height - r2 - r3) +
            'a' +
            r3 +
            ',' +
            r3 +
            ' 0 0 1 ' +
            -r3 +
            ',' +
            r3 +
            'h' +
            (r3 + r4 - width) +
            'a' +
            r4 +
            ',' +
            r4 +
            ' 0 0 1 ' +
            -r4 +
            ',' +
            -r4 +
            'v' +
            (-height + r4 + r1) +
            'a' +
            r1 +
            ',' +
            r1 +
            ' 0 0 1 ' +
            r1 +
            ',' +
            -r1 +
            'z'
        );
    }
    static roundedRect2(x, y, width, height, r1, r2, r3, r4) {
        const radius = 10;

        r1 = r1 ? radius : 0;

        r2 = r2 ? radius : 0;

        r3 = r3 ? radius : 0;

        r4 = r4 ? radius : 0;

        return (
            'M' +
            (x + r1) +
            ',' +
            y +
            'h' +
            (width - r1 - r2) +
            'a' +
            r2 +
            ',' +
            r2 +
            ' 0 0 1 ' +
            r2 +
            ',' +
            r2 +
            'v' +
            (height - r2 - r3) +
            'a' +
            r3 +
            ',' +
            r3 +
            ' 0 0 1 ' +
            -r3 +
            ',' +
            r3 +
            'h' +
            (r3 + r4 - width) +
            'a' +
            r4 +
            ',' +
            r4 +
            ' 0 0 1 ' +
            -r4 +
            ',' +
            -r4 +
            'v' +
            (-height + r4 + r1) +
            'a' +
            r1 +
            ',' +
            r1 +
            ' 0 0 1 ' +
            r1 +
            ',' +
            -r1 +
            'z'
        );
    }

    createElement(name) {
        return this._document.createElementNS('http://www.w3.org/2000/svg', name);
    }
};

grapher.NodeElement.Header = class {
    constructor(document) {
        this._document = document;

        this._items = [];
    }

    add(id, classList, content, tooltip, handler) {
        this._items.push({
            id: id,

            classList: classList,

            content: content,

            tooltip: tooltip,

            handler: handler
        });
    }

    layout(parentElement) {
        this._width = 0;

        this._height = 0;

        this._elements = [];

        let x = 0;

        const y = 0;

        for (const item of this._items) {
            const yPadding = 4;

            const xPadding = 7;

            const element = this.createElement('g');

            let classList = ['node-item'];

            parentElement.appendChild(element);
            const pathElement = this.createElement('path');

            const textElement = this.createElement('text');

            element.appendChild(pathElement);
            element.appendChild(textElement);
            if (item.classList) {
                classList = classList.concat(item.classList);
            }
            element.setAttribute('class', classList.join(' '));

            if (item.id) {
                element.setAttribute('id', item.id);
            }
            if (item.handler) {
                element.addEventListener('click', item.handler);
            }
            if (item.tooltip) {
                const titleElement = this.createElement('title');

                titleElement.textContent = item.tooltip;

                element.appendChild(titleElement);
            }
            if (item.content) {
                textElement.textContent = item.content;
            }
            const boundingBox = textElement.getBBox();

            const width = boundingBox.width + xPadding + xPadding;

            const height = boundingBox.height + yPadding + yPadding;

            this._elements.push({
                group: element,

                text: textElement,

                path: pathElement,

                x: x,

                y: y,

                width: width,

                height: height,

                tx: xPadding,

                ty: yPadding - boundingBox.y
            });
            x += width;

            if (this._height < height) {
                this._height = height;
            }
            if (x > this._width) {
                this._width = x;
            }
        }
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    update(parentElement, top, width, first, last) {
        const dx = width - this._width;

        let i;

        let element;

        for (i = 0; i < this._elements.length; i++) {
            element = this._elements[i];

            if (i == 0) {
                element.width = element.width + dx;
            } else {
                element.x = element.x + dx;

                element.tx = element.tx + dx;
            }
            element.y = element.y + top;
        }

        for (i = 0; i < this._elements.length; i++) {
            element = this._elements[i];

            element.group.setAttribute('transform', 'translate(' + element.x + ',' + element.y + ')');

            const r1 = i == 0 && first;

            const r2 = i == this._elements.length - 1 && first;

            const r3 = i == this._elements.length - 1 && last;

            const r4 = i == 0 && last;

            element.path.setAttribute(
                'd',
                grapher.NodeElement.roundedRect(0, 0, element.width, element.height, r1, r2, r3, r4)
            );
            element.text.setAttribute('x', 7);

            element.text.setAttribute('y', element.ty - 1);
        }

        let lineElement;

        for (i = 0; i < this._elements.length; i++) {
            element = this._elements[i];

            if (i != 0) {
                lineElement = this.createElement('line');

                lineElement.setAttribute('class', 'node');

                lineElement.setAttribute('x1', element.x);

                lineElement.setAttribute('x2', element.x);

                lineElement.setAttribute('y1', top);

                lineElement.setAttribute('y2', top + this._height);

                parentElement.appendChild(lineElement);
            }
        }

        if (!first) {
            lineElement = this.createElement('line');

            lineElement.setAttribute('class', 'node');

            lineElement.setAttribute('x1', 0);

            lineElement.setAttribute('x2', width);

            lineElement.setAttribute('y1', top);

            lineElement.setAttribute('y2', top);

            parentElement.appendChild(lineElement);
        }
    }

    createElement(name) {
        return this._document.createElementNS('http://www.w3.org/2000/svg', name);
    }
};

grapher.NodeElement.List = class {
    constructor(document) {
        this._document = document;

        this._items = [];
    }

    add(id, name, value, tooltip, separator) {
        this._items.push({id: id, name: name, value: value, tooltip: tooltip, separator: separator});
    }

    get handler() {
        return this._handler;
    }

    set handler(handler) {
        this._handler = handler;
    }

    layout(parentElement) {
        this._width = 0;

        this._height = 0;

        const x = 0;

        const y = 0;

        this._element = this.createElement('g');

        this._element.setAttribute('class', 'node-attribute');

        parentElement.appendChild(this._element);
        if (this._handler) {
            this._element.addEventListener('click', this._handler);
        }
        this._backgroundElement = this.createElement('path');

        this._element.appendChild(this._backgroundElement);
        this._element.setAttribute('transform', 'translate(' + x + ',' + y + ')');

        this._height += 3;

        for (const item of this._items) {
            const yPadding = 1;

            const xPadding = 6;

            const textElement = this.createElement('text');

            if (item.id) {
                textElement.setAttribute('id', item.id);
            }
            textElement.setAttribute('xml:space', 'preserve');

            this._element.appendChild(textElement);
            if (item.tooltip) {
                const titleElement = this.createElement('title');

                titleElement.textContent = item.tooltip;

                textElement.appendChild(titleElement);
            }
            const textNameElement = this.createElement('tspan');

            textNameElement.textContent = item.name;

            if (item.separator.trim() != '=') {
                textNameElement.style.fontWeight = 'bold';
            }
            textElement.appendChild(textNameElement);
            const textValueElement = this.createElement('tspan');

            textValueElement.textContent = item.separator + item.value;

            textElement.appendChild(textValueElement);
            const size = textElement.getBBox();

            const width = xPadding + size.width + xPadding;

            if (this._width < width) {
                this._width = width;
            }
            textElement.setAttribute('x', x + xPadding);

            textElement.setAttribute('y', this._height + yPadding - size.y);

            this._height += yPadding + size.height + yPadding;
        }
        this._height += 3;

        if (this._width < 100) {
            this._width = 100;
        }
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    update(parentElement, top, width, first, last) {
        this._element.setAttribute('transform', 'translate(0,' + top + ')');

        const r1 = first;

        const r2 = first;

        const r3 = last;

        const r4 = last;

        this._backgroundElement.setAttribute(
            'd',
            grapher.NodeElement.roundedRect(0, 0, width, this._height, r1, r2, r3, r4)
        );

        if (!first) {
            const lineElement = this.createElement('line');

            lineElement.setAttribute('class', 'node');

            lineElement.setAttribute('x1', 0);

            lineElement.setAttribute('x2', width);

            lineElement.setAttribute('y1', 0);

            lineElement.setAttribute('y2', 0);

            this._element.appendChild(lineElement);
        }
    }

    createElement(name) {
        return this._document.createElementNS('http://www.w3.org/2000/svg', name);
    }
};

class Path {
    constructor() {
        this._x0 = null;

        this._y0 = null;

        this._x1 = null;

        this._y1 = null;

        this._data = '';
    }

    moveTo(x, y) {
        this._data += 'M' + (this._x0 = this._x1 = +x) + ',' + (this._y0 = this._y1 = +y);
    }

    lineTo(x, y) {
        this._data += 'L' + (this._x1 = +x) + ',' + (this._y1 = +y);
    }

    bezierCurveTo(x1, y1, x2, y2, x, y) {
        this._data += 'C' + +x1 + ',' + +y1 + ',' + +x2 + ',' + +y2 + ',' + (this._x1 = +x) + ',' + (this._y1 = +y);
    }

    closePath() {
        if (this._x1 !== null) {
            this._x1 = this._x0;

            this._y1 = this._y0;

            this._data += 'Z';
        }
    }

    get data() {
        return this._data;
    }
}

class Curve {
    constructor(context) {
        this._context = context;
    }

    lineStart() {
        this._x0 = NaN;

        this._x1 = NaN;

        this._y0 = NaN;

        this._y1 = NaN;

        this._point = 0;
    }

    lineEnd() {
        switch (this._point) {
            case 3:
                this.curve(this._x1, this._y1);

                this._context.lineTo(this._x1, this._y1);

                break;
            case 2:
                this._context.lineTo(this._x1, this._y1);

                break;
        }
        if (this._line || (this._line !== 0 && this._point === 1)) {
            this._context.closePath();
        }
        this._line = 1 - this._line;
    }

    point(x, y) {
        x = +x;

        y = +y;

        switch (this._point) {
            case 0:
                this._point = 1;

                if (this._line) {
                    this._context.lineTo(x, y);
                } else {
                    this._context.moveTo(x, y);
                }
                break;
            case 1:
                this._point = 2;

                break;
            case 2:
                this._point = 3;

                this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6);

                this.curve(x, y);

                break;
            default:
                this.curve(x, y);

                break;
        }
        this._x0 = this._x1;

        this._x1 = x;

        this._y0 = this._y1;

        this._y1 = y;
    }

    curve(x, y) {
        this._context.bezierCurveTo(
            (2 * this._x0 + this._x1) / 3,

            (2 * this._y0 + this._y1) / 3,

            (this._x0 + 2 * this._x1) / 3,

            (this._y0 + 2 * this._y1) / 3,

            (this._x0 + 4 * this._x1 + x) / 6,

            (this._y0 + 4 * this._y1 + y) / 6
        );
    }
}

if (typeof module !== 'undefined' && typeof module.exports === 'object') {
    module.exports.Renderer = grapher.Renderer;

    module.exports.NodeElement = grapher.NodeElement;
}
