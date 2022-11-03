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

// cSpell:words grapher selectall nodesep ranksep rankdir pbtxt

const zip = require('netron/src/zip');
const gzip = require('netron/src/gzip');
const tar = require('netron/src/tar');
const protobuf = require('netron/src/protobuf');

const d3 = require('d3');
const dagre = require('dagre');

const grapher = require('netron/src/view-grapher');

const sidebar = require('./sidebar');

const view = {};

view.View = class {
    constructor(host) {
        this._host = host;
        this._host
            .initialize(this)
            .then(() => {
                this._model = null;
                this._selection = [];
                this._host.start();
                this._showAttributes = false;
                this._showInitializers = true;
                this._showNames = false;
                this._showHorizontal = false;
                this._modelFactoryService = new view.ModelFactoryService(this._host);
            })
            .catch(err => {
                this.error(err.message, err);
            });
    }

    cut() {
        this._host.document.execCommand('cut');
    }

    copy() {
        this._host.document.execCommand('copy');
    }

    paste() {
        this._host.document.execCommand('paste');
    }

    selectAll() {
        this._host.document.execCommand('selectall');
    }

    find(value) {
        if (this._activeGraph) {
            this.clearSelection();
            const graphElement = document.getElementById('canvas');
            const view = new sidebar.FindSidebar(this._host, graphElement, this._activeGraph);
            this._host.message('search', view.update(value));
        }
    }

    toggleAttributes(toggle) {
        if (toggle != null && !(toggle ^ this._showAttributes)) {
            return;
        }
        this._showAttributes = toggle == null ? !this._showAttributes : toggle;
        this._reload();
    }

    get showAttributes() {
        return this._showAttributes;
    }

    toggleInitializers(toggle) {
        if (toggle != null && !(toggle ^ this._showInitializers)) {
            return;
        }
        this._showInitializers = toggle == null ? !this._showInitializers : toggle;
        this._reload();
    }

    get showInitializers() {
        return this._showInitializers;
    }

    toggleNames(toggle) {
        if (toggle != null && !(toggle ^ this._showNames)) {
            return;
        }
        this._showNames = toggle == null ? !this._showNames : toggle;
        this._reload();
    }

    get showNames() {
        return this._showNames;
    }

    toggleDirection(toggle) {
        if (toggle != null && !(toggle ^ this._showHorizontal)) {
            return;
        }
        this._showHorizontal = toggle == null ? !this._showHorizontal : toggle;
        this._reload();
    }

    get showHorizontal() {
        return this._showHorizontal;
    }

    toggleTheme(theme) {
        this._host.document.body.className = theme;
    }

    _reload() {
        this._host.status('loading');
        if (this._model && this._activeGraph) {
            this._updateGraph(this._model, this._activeGraph).catch(error => {
                if (error) {
                    this.error('Graph update failed.', error);
                }
            });
        }
    }

    _timeout(time) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    zoomIn() {
        if (this._zoom) {
            this._zoom.scaleBy(d3.select(this._host.document.getElementById('canvas')), 1.2);
        }
    }

    zoomOut() {
        if (this._zoom) {
            this._zoom.scaleBy(d3.select(this._host.document.getElementById('canvas')), 0.8);
        }
    }

    resetZoom() {
        if (this._zoom) {
            this._zoom.scaleTo(d3.select(this._host.document.getElementById('canvas')), 1);
        }
    }

    select(item) {
        this.clearSelection();
        const graphElement = document.getElementById('canvas');
        const selection = sidebar.FindSidebar.selection(item, graphElement);
        if (selection && selection.length > 0) {
            const graphElement = this._host.document.getElementById('canvas');
            const graphRect = graphElement.getBoundingClientRect();
            let x = 0;
            let y = 0;
            for (const element of selection) {
                element.classList.add('select');
                this._selection.push(element);
                const transform = element.transform.baseVal.consolidate();
                const box = element.getBBox();
                const ex = transform ? transform.matrix.e : box.x + box.width / 2;
                const ey = transform ? transform.matrix.f : box.y + box.height / 2;
                x += ex;
                y += ey;
            }
            x = x / selection.length;
            y = y / selection.length;
            this._zoom.transform(
                d3.select(graphElement),
                d3.zoomIdentity.translate(graphRect.width / 2 - x, graphRect.height / 2 - y)
            );
        }
    }

    clearSelection() {
        while (this._selection.length > 0) {
            const element = this._selection.pop();
            element.classList.remove('select');
        }
    }

    error(message, err) {
        this._host.error(message, err.toString());
    }

    accept(file) {
        return this._modelFactoryService.accept(file);
    }

    open(context) {
        return this._timeout(2).then(() => {
            return this._modelFactoryService.open(context).then(model => {
                return this._timeout(20).then(() => {
                    const graph = model.graphs.length > 0 ? model.graphs[0] : null;
                    this._host.message('opened', {
                        graphs: model.graphs.map(g => g.name || ''),
                        selected: graph && (graph.name || '')
                    });
                    return this._updateGraph(model, graph);
                });
            });
        });
    }

    changeGraph(name) {
        this._updateActiveGraph(name);
    }

    _updateActiveGraph(name) {
        if (this._model) {
            const model = this._model;
            const graph = model.graphs.filter(graph => name == graph.name).shift();
            if (graph) {
                this._host.status('loading');
                this._timeout(200).then(() => {
                    return this._updateGraph(model, graph).catch(error => {
                        if (error) {
                            this.error('Graph update failed.', error);
                        }
                    });
                });
            }
        }
    }

    _updateGraph(model, graph) {
        return this._timeout(100).then(() => {
            if (graph && graph != this._activeGraph) {
                const nodes = graph.nodes;
                if (nodes.length > 1400) {
                    if (
                        !this._host.confirm(
                            'Large model detected.',
                            'This graph contains a large number of nodes and might take a long time to render. Do you want to continue?'
                        )
                    ) {
                        return null;
                    }
                }
            }
            return this.renderGraph(model, graph)
                .then(() => {
                    this._model = model;
                    this._activeGraph = graph;
                    this._host.status('rendered');
                    return this._model;
                })
                .catch(error => {
                    return this.renderGraph(this._model, this._activeGraph)
                        .then(() => {
                            this._host.status('rendered');
                            throw error;
                        })
                        .catch(() => {
                            throw error;
                        });
                });
        });
    }

    renderGraph(model, graph) {
        try {
            const graphElement = this._host.document.getElementById('canvas');
            while (graphElement.lastChild) {
                graphElement.removeChild(graphElement.lastChild);
            }
            if (!graph) {
                return Promise.resolve();
            } else {
                this._zoom = null;
                graphElement.style.position = 'absolute';
                graphElement.style.margin = '0';

                const groups = graph.groups;

                const graphOptions = {};
                graphOptions.nodesep = 25;
                graphOptions.ranksep = 20;
                if (this._showHorizontal) {
                    graphOptions.rankdir = 'LR';
                }

                const g = new dagre.graphlib.Graph({compound: groups});
                g.setGraph(graphOptions);
                g.setDefaultEdgeLabel(() => {
                    return {};
                });

                let nodeId = 0;
                const edgeMap = {};
                const clusterMap = {};
                const clusterParentMap = {};
                let id = new Date().getTime();
                const nodes = graph.nodes;

                if (nodes.length > 1500) {
                    graphOptions.ranker = 'longest-path';
                }

                if (groups) {
                    for (const node of nodes) {
                        if (node.group) {
                            const path = node.group.split('/');
                            while (path.length > 0) {
                                const name = path.join('/');
                                path.pop();
                                clusterParentMap[name] = path.join('/');
                            }
                        }
                    }
                }

                for (const node of nodes) {
                    const element = new grapher.NodeElement(this._host.document);
                    const addNode = (element, node, edges) => {
                        const header = element.block('header');
                        const styles = ['node-item-type'];
                        const metadata = node.metadata;
                        const category = metadata && metadata.category ? metadata.category : '';
                        if (category) {
                            styles.push('node-item-type-' + category.toLowerCase());
                        }
                        const type = node.type;
                        if (typeof type !== 'string' || !type.split) {
                            // #416
                            throw new ModelError(
                                "Unknown node type '" + JSON.stringify(type) + "' in '" + model.format + "'."
                            );
                        }
                        const content = this.showNames && node.name ? node.name : type.split('.').pop();
                        const tooltip = this.showNames && node.name ? type : node.name;
                        header.add(null, styles, content, tooltip, () => {
                            this.showNodeProperties(node);
                        });

                        if (node.function) {
                            header.add(null, ['node-item-function'], '+', null, () => {
                                // debugger;
                            });
                        }

                        const initializers = [];
                        let hiddenInitializers = false;
                        if (this._showInitializers) {
                            for (const input of node.inputs) {
                                if (
                                    input.visible &&
                                    input.arguments.length == 1 &&
                                    input.arguments[0].initializer != null
                                ) {
                                    initializers.push(input);
                                }
                                if (
                                    (!input.visible || input.arguments.length > 1) &&
                                    input.arguments.some(argument => argument.initializer != null)
                                ) {
                                    hiddenInitializers = true;
                                }
                            }
                        }
                        let sortedAttributes = [];
                        const attributes = node.attributes;
                        if (this.showAttributes && attributes) {
                            sortedAttributes = attributes.filter(attribute => attribute.visible).slice();
                            sortedAttributes.sort((a, b) => {
                                const au = a.name.toUpperCase();
                                const bu = b.name.toUpperCase();
                                return au < bu ? -1 : au > bu ? 1 : 0;
                            });
                        }
                        if (initializers.length > 0 || hiddenInitializers || sortedAttributes.length > 0) {
                            const block = element.block('list');
                            block.handler = () => {
                                this.showNodeProperties(node);
                            };
                            for (const initializer of initializers) {
                                const argument = initializer.arguments[0];
                                const type = argument.type;
                                let shape = '';
                                let separator = '';
                                if (
                                    type &&
                                    type.shape &&
                                    type.shape.dimensions &&
                                    Object.prototype.hasOwnProperty.call(type.shape.dimensions, 'length')
                                ) {
                                    shape =
                                        '\u3008' +
                                        type.shape.dimensions.map(d => (d ? d : '?')).join('\u00D7') +
                                        '\u3009';
                                    if (
                                        type.shape.dimensions.length == 0 &&
                                        argument.initializer &&
                                        !argument.initializer.state
                                    ) {
                                        shape = argument.initializer.toString();
                                        if (shape && shape.length > 10) {
                                            shape = shape.substring(0, 10) + '\u2026';
                                        }
                                        separator = ' = ';
                                    }
                                }
                                block.add(
                                    'initializer-' + argument.name,
                                    initializer.name,
                                    shape,
                                    type ? type.toString() : '',
                                    separator
                                );
                            }
                            if (hiddenInitializers) {
                                block.add(null, '\u3008' + '\u2026' + '\u3009', '', null, '');
                            }

                            for (const attribute of sortedAttributes) {
                                if (attribute.visible) {
                                    let attributeValue = sidebar.NodeSidebar.formatAttributeValue(
                                        attribute.value,
                                        attribute.type
                                    );
                                    if (attributeValue && attributeValue.length > 25) {
                                        attributeValue = attributeValue.substring(0, 25) + '\u2026';
                                    }
                                    block.add(null, attribute.name, attributeValue, attribute.type, ' = ');
                                }
                            }
                        }

                        if (edges) {
                            const inputs = node.inputs;
                            for (const input of inputs) {
                                for (const argument of input.arguments) {
                                    if (argument.name != '' && !argument.initializer) {
                                        let tuple = edgeMap[argument.name];
                                        if (!tuple) {
                                            tuple = {from: null, to: []};
                                            edgeMap[argument.name] = tuple;
                                        }
                                        tuple.to.push({
                                            node: nodeId,
                                            name: input.name
                                        });
                                    }
                                }
                            }
                            let outputs = node.outputs;
                            if (node.chain && node.chain.length > 0) {
                                const chainOutputs = node.chain[node.chain.length - 1].outputs;
                                if (chainOutputs.length > 0) {
                                    outputs = chainOutputs;
                                }
                            }
                            for (const output of outputs) {
                                for (const argument of output.arguments) {
                                    if (argument.name != '') {
                                        let tuple = edgeMap[argument.name];
                                        if (!tuple) {
                                            tuple = {from: null, to: []};
                                            edgeMap[argument.name] = tuple;
                                        }
                                        tuple.from = {
                                            node: nodeId,
                                            name: output.name,
                                            type: argument.type
                                        };
                                    }
                                }
                            }
                        }

                        if (node.chain && node.chain.length > 0) {
                            for (const innerNode of node.chain) {
                                addNode(element, innerNode, false);
                            }
                        }

                        if (node.inner) {
                            addNode(element, node.inner, false);
                        }
                    };

                    addNode(element, node, true);

                    if (node.controlDependencies && node.controlDependencies.length > 0) {
                        for (const controlDependency of node.controlDependencies) {
                            let tuple = edgeMap[controlDependency];
                            if (!tuple) {
                                tuple = {from: null, to: []};
                                edgeMap[controlDependency] = tuple;
                            }
                            tuple.to.push({
                                node: nodeId,
                                name: controlDependency,
                                controlDependency: true
                            });
                        }
                    }

                    const nodeName = node.name;
                    if (nodeName) {
                        g.setNode(nodeId, {label: element.format(graphElement), id: 'node-' + nodeName});
                    } else {
                        g.setNode(nodeId, {label: element.format(graphElement), id: 'node-' + id.toString()});
                        id++;
                    }

                    const createCluster = function (name) {
                        if (!clusterMap[name]) {
                            g.setNode(name, {rx: 5, ry: 5});
                            clusterMap[name] = true;
                            const parent = clusterParentMap[name];
                            if (parent) {
                                createCluster(parent);
                                g.setParent(name, parent);
                            }
                        }
                    };

                    if (groups) {
                        let groupName = node.group;
                        if (groupName && groupName.length > 0) {
                            if (!Object.prototype.hasOwnProperty.call(clusterParentMap, groupName)) {
                                const lastIndex = groupName.lastIndexOf('/');
                                if (lastIndex != -1) {
                                    groupName = groupName.substring(0, lastIndex);
                                    if (!Object.prototype.hasOwnProperty.call(clusterParentMap, groupName)) {
                                        groupName = null;
                                    }
                                } else {
                                    groupName = null;
                                }
                            }
                            if (groupName) {
                                createCluster(groupName);
                                g.setParent(nodeId, groupName);
                            }
                        }
                    }

                    nodeId++;
                }

                for (const input of graph.inputs) {
                    for (const argument of input.arguments) {
                        let tuple = edgeMap[argument.name];
                        if (!tuple) {
                            tuple = {from: null, to: []};
                            edgeMap[argument.name] = tuple;
                        }
                        tuple.from = {
                            node: nodeId,
                            type: argument.type
                        };
                    }
                    const types = input.arguments.map(argument => argument.type || '').join('\n');
                    let inputName = input.name || '';
                    if (inputName.length > 16) {
                        inputName = inputName.split('/').pop();
                    }

                    const inputElement = new grapher.NodeElement(this._host.document);
                    const inputHeader = inputElement.block('header');
                    inputHeader.add(null, ['graph-item-input'], inputName, types, () => {
                        this.showModelProperties();
                    });
                    g.setNode(nodeId++, {label: inputElement.format(graphElement), class: 'graph-input'});
                }

                for (const output of graph.outputs) {
                    for (const argument of output.arguments) {
                        let tuple = edgeMap[argument.name];
                        if (!tuple) {
                            tuple = {from: null, to: []};
                            edgeMap[argument.name] = tuple;
                        }
                        tuple.to.push({node: nodeId});
                    }
                    const outputTypes = output.arguments.map(argument => argument.type || '').join('\n');
                    let outputName = output.name || '';
                    if (outputName.length > 16) {
                        outputName = outputName.split('/').pop();
                    }

                    const outputElement = new grapher.NodeElement(this._host.document);
                    const outputHeader = outputElement.block('header');
                    outputHeader.add(null, ['graph-item-output'], outputName, outputTypes, () => {
                        this.showModelProperties();
                    });
                    g.setNode(nodeId++, {label: outputElement.format(graphElement)});
                }

                for (const edge of Object.keys(edgeMap)) {
                    const tuple = edgeMap[edge];
                    if (tuple.from != null) {
                        for (const to of tuple.to) {
                            let text = '';
                            const type = tuple.from.type;
                            if (type && type.shape && type.shape.dimensions && type.shape.dimensions.length > 0) {
                                text = type.shape.dimensions.join('\u00D7');
                            }

                            if (this._showNames) {
                                text = edge.split('\n').shift(); // custom argument id
                            }

                            if (to.controlDependency) {
                                g.setEdge(tuple.from.node, to.node, {
                                    label: text,
                                    id: 'edge-' + edge,
                                    arrowhead: 'vee',
                                    class: 'edge-path-control-dependency'
                                });
                            } else {
                                g.setEdge(tuple.from.node, to.node, {
                                    label: text,
                                    id: 'edge-' + edge,
                                    arrowhead: 'vee'
                                });
                            }
                        }
                    }
                }

                // Workaround for Safari background drag/zoom issue:
                // https://stackoverflow.com/questions/40887193/d3-js-zoom-is-not-working-with-mousewheel-in-safari
                const backgroundElement = this._host.document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                backgroundElement.setAttribute('id', 'background');
                backgroundElement.setAttribute('width', '100%');
                backgroundElement.setAttribute('height', '100%');
                backgroundElement.setAttribute('fill', 'none');
                backgroundElement.setAttribute('pointer-events', 'all');
                graphElement.appendChild(backgroundElement);

                const originElement = this._host.document.createElementNS('http://www.w3.org/2000/svg', 'g');
                originElement.setAttribute('id', 'origin');
                graphElement.appendChild(originElement);

                let svg = null;
                svg = d3.select(graphElement);
                this._zoom = d3.zoom();
                this._zoom(svg);
                this._zoom.scaleExtent([0.1, 2]);
                this._zoom.on('zoom', () => {
                    originElement.setAttribute('transform', d3.event.transform.toString());
                });
                this._zoom.transform(svg, d3.zoomIdentity);

                return this._timeout(20).then(() => {
                    const graphRenderer = new grapher.Renderer(this._host.document, originElement);
                    graphRenderer.render(g);

                    const inputElements = graphElement.getElementsByClassName('graph-input');
                    const svgSize = graphElement.getBoundingClientRect();
                    if (inputElements && inputElements.length > 0) {
                        // Center view based on input elements
                        const xs = [];
                        const ys = [];
                        for (let i = 0; i < inputElements.length; i++) {
                            const inputTransform = inputElements[i].transform.baseVal.consolidate().matrix;
                            xs.push(inputTransform.e);
                            ys.push(inputTransform.f);
                        }
                        let x = xs[0];
                        const y = ys[0];
                        if (ys.every(y => y == ys[0])) {
                            x = xs.reduce((a, b) => a + b) / xs.length;
                        }
                        const sx = svgSize.width / (this._showHorizontal ? 4 : 2) - x;
                        const sy = svgSize.height / (this._showHorizontal ? 2 : 4) - y;
                        this._zoom.transform(svg, d3.zoomIdentity.translate(sx, sy));
                    } else {
                        this._zoom.transform(
                            svg,
                            d3.zoomIdentity.translate(
                                (svgSize.width - g.graph().width) / 2,
                                (svgSize.height - g.graph().height) / 2
                            )
                        );
                    }
                    return;
                });
            }
        } catch (error) {
            return Promise.reject(error);
        }
    }

    applyStyleSheet(element, name) {
        let rules = [];
        for (let i = 0; i < this._host.document.styleSheets.length; i++) {
            const styleSheet = this._host.document.styleSheets[i];
            if (styleSheet && styleSheet.href && styleSheet.href.endsWith('/' + name)) {
                rules = styleSheet.cssRules;
                break;
            }
        }
        const nodes = element.getElementsByTagName('*');
        for (let j = 0; j < nodes.length; j++) {
            const node = nodes[j];
            for (let k = 0; k < rules.length; k++) {
                const rule = rules[k];
                if (node.matches(rule.selectorText)) {
                    for (let l = 0; l < rule.style.length; l++) {
                        const item = rule.style.item(l);
                        node.style[item] = rule.style[item];
                    }
                }
            }
        }
    }

    export(file) {
        const lastIndex = file.lastIndexOf('.');
        const extension = lastIndex != -1 ? file.substring(lastIndex + 1) : '';
        if (this._activeGraph && (extension == 'png' || extension == 'svg')) {
            const graphElement = this._host.document.getElementById('canvas');
            const exportElement = graphElement.cloneNode(true);
            this.applyStyleSheet(exportElement, 'style.css');
            exportElement.setAttribute('id', 'export');
            exportElement.removeAttribute('width');
            exportElement.removeAttribute('height');
            exportElement.style.removeProperty('opacity');
            exportElement.style.removeProperty('display');
            const backgroundElement = exportElement.querySelector('#background');
            const originElement = exportElement.querySelector('#origin');
            originElement.setAttribute('transform', 'translate(0,0) scale(1)');
            backgroundElement.removeAttribute('width');
            backgroundElement.removeAttribute('height');

            const parentElement = graphElement.parentElement;
            parentElement.insertBefore(exportElement, graphElement);
            const size = exportElement.getBBox();
            parentElement.removeChild(exportElement);
            parentElement.removeChild(graphElement);
            parentElement.appendChild(graphElement);

            const delta = (Math.min(size.width, size.height) / 2.0) * 0.1;
            const width = Math.ceil(delta + size.width + delta);
            const height = Math.ceil(delta + size.height + delta);
            originElement.setAttribute(
                'transform',
                'translate(' + delta.toString() + ', ' + delta.toString() + ') scale(1)'
            );
            exportElement.setAttribute('width', width);
            exportElement.setAttribute('height', height);
            backgroundElement.setAttribute('width', width);
            backgroundElement.setAttribute('height', height);
            backgroundElement.setAttribute('fill', '#fff');

            const data = new XMLSerializer().serializeToString(exportElement);

            if (extension === 'svg') {
                const blob = new Blob([data], {type: 'image/svg'});
                this._host.export(file, blob);
            } else if (extension === 'png') {
                const imageElement = new Image();
                imageElement.onload = () => {
                    const max = Math.max(width, height);
                    const scale = max * 2.0 > 24000 ? 24000.0 / max : 2.0;
                    const canvas = this._host.document.createElement('canvas');
                    canvas.width = Math.ceil(width * scale);
                    canvas.height = Math.ceil(height * scale);
                    const context = canvas.getContext('2d');
                    context.scale(scale, scale);
                    context.drawImage(imageElement, 0, 0);
                    this._host.document.body.removeChild(imageElement);
                    canvas.toBlob(blob => {
                        if (blob) {
                            this._host.export(file, blob);
                        } else {
                            const err = new Error();
                            err.name = 'Error exporting image.';
                            err.message = 'Image may be too large to render as PNG.';
                            this._host.exception(err, false);
                            this._host.error(err.name, err.message);
                        }
                    }, 'image/png');
                };
                imageElement.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(data)));
                this._host.document.body.insertBefore(imageElement, this._host.document.body.firstChild);
            }
        }
    }

    showModelProperties() {
        if (this._model) {
            const modelSidebar = new sidebar.ModelSidebar(this._host, this._model, this._activeGraph);
            this._host.message('show-model-properties', modelSidebar.render());
        }
    }

    showNodeProperties(node) {
        if (node) {
            const nodeSidebar = new sidebar.NodeSidebar(this._host, node);
            // TODO: export
            // nodeSidebar.on('export-tensor', (sender, tensor) => {
            //     this._host
            //         .require('./numpy')
            //         .then(numpy => {
            //             const defaultPath = tensor.name
            //                 ? tensor.name.split('/').join('_').split(':').join('_').split('.').join('_')
            //                 : 'tensor';
            //             this._host.save('NumPy Array', 'npy', defaultPath, file => {
            //                 try {
            //                     const dataTypeMap = new Map([
            //                         ['float16', 'f2'],
            //                         ['float32', 'f4'],
            //                         ['float64', 'f8'],
            //                         ['int8', 'i1'],
            //                         ['int16', 'i2'],
            //                         ['int32', 'i4'],
            //                         ['int64', 'i8'],
            //                         ['uint8', 'u1'],
            //                         ['uint16', 'u2'],
            //                         ['uint32', 'u4'],
            //                         ['uint64', 'u8'],
            //                         ['qint8', 'i1'],
            //                         ['qint16', 'i2'],
            //                         ['quint8', 'u1'],
            //                         ['quint16', 'u2']
            //                     ]);
            //                     const array = new numpy.Array();
            //                     array.shape = tensor.type.shape.dimensions;
            //                     array.data = tensor.value;
            //                     array.dataType = dataTypeMap.has(tensor.type.dataType)
            //                         ? dataTypeMap.get(tensor.type.dataType)
            //                         : tensor.type.dataType;
            //                     const blob = new Blob([array.toBuffer()], {type: 'application/octet-stream'});
            //                     this._host.export(file, blob);
            //                 } catch (error) {
            //                     this.error('Error saving NumPy tensor.', error);
            //                 }
            //             });
            //         })
            //         .catch(() => {});
            // });
            this._host.message('show-node-properties', {...nodeSidebar.render(), metadata: node.metadata});
        }
    }

    showNodeDocumentation(node) {
        const metadata = node.metadata;
        if (metadata) {
            const documentationSidebar = new sidebar.DocumentationSidebar(this._host, metadata);
            this._host.message('show-node-documentation', documentationSidebar.render());
        }
    }
};

class ModelError extends Error {
    constructor(message, telemetry) {
        super(message);
        this.name = 'Error loading model.';
        this.telemetry = telemetry;
    }
}

class ModelContext {
    constructor(context) {
        this._context = context;
        this._tags = new Map();
        this._entries = new Map();
    }

    request(file, encoding) {
        return this._context.request(file, encoding);
    }

    get identifier() {
        return this._context.identifier;
    }

    get buffer() {
        return this._context.buffer;
    }

    get text() {
        if (!this._text) {
            this._text = new TextDecoder('utf-8').decode(this.buffer);
        }
        return this._text;
    }

    entries(extension) {
        let entries = this._entries.get(extension);
        if (!entries) {
            entries = [];
            try {
                const buffer = this.buffer;
                switch (extension) {
                    case 'zip': {
                        if (buffer && buffer.length > 2 && buffer[0] == 0x50 && buffer[1] == 0x4b) {
                            entries = new zip.Archive(buffer).entries;
                        }
                        break;
                    }
                    case 'tar': {
                        if (buffer.length >= 512) {
                            let sum = 0;
                            for (let i = 0; i < 512; i++) {
                                sum += i >= 148 && i < 156 ? 32 : buffer[i];
                            }
                            let checksum = '';
                            for (let i = 148; i < 156 && buffer[i] !== 0x00; i++) {
                                checksum += String.fromCharCode(buffer[i]);
                            }
                            checksum = parseInt(checksum, 8);
                            if (!isNaN(checksum) && sum == checksum) {
                                entries = new tar.Archive(buffer).entries;
                            }
                        }
                        break;
                    }
                }
            } catch (error) {
                entries = [];
            }
            this._entries.set(extension, entries);
        }
        return entries;
    }

    tags(extension) {
        let tags = this._tags.get(extension);
        if (!tags) {
            tags = new Map();
            try {
                switch (extension) {
                    case 'pbtxt': {
                        const b = this.buffer;
                        const length = b.length;
                        const signature =
                            (length >= 3 && b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) ||
                            (length >= 4 && b[0] === 0x00 && b[1] === 0x00 && b[2] === 0xfe && b[3] === 0xff) ||
                            (length >= 4 && b[0] === 0xff && b[1] === 0xfe && b[2] === 0x00 && b[3] === 0x00) ||
                            (length >= 4 && b[0] === 0x84 && b[1] === 0x31 && b[2] === 0x95 && b[3] === 0x33) ||
                            (length >= 2 && b[0] === 0xfe && b[1] === 0xff) ||
                            (length >= 2 && b[0] === 0xff && b[1] === 0xfe);
                        if (
                            !signature &&
                            b.subarray(0, Math.min(1024, length)).some(c => c < 7 || (c > 14 && c < 32))
                        ) {
                            break;
                        }
                        const reader = protobuf.TextReader.create(this.text);
                        reader.start(false);
                        while (!reader.end(false)) {
                            const tag = reader.tag();
                            tags.set(tag, true);
                            reader.skip();
                        }
                        break;
                    }
                    case 'pb': {
                        const tagTypes = new Set([0, 1, 2, 3, 5]);
                        const reader = protobuf.Reader.create(this.buffer);
                        const end = reader.next();
                        while (reader.pos < end) {
                            const tagType = reader.uint32();
                            tags.set(tagType >>> 3, tagType & 7);
                            if (!tagTypes.has(tagType & 7)) {
                                tags = new Map();
                                break;
                            }
                            try {
                                reader.skipType(tagType & 7);
                            } catch (err) {
                                tags = new Map();
                                break;
                            }
                        }
                        break;
                    }
                }
            } catch (error) {
                tags = new Map();
            }
            this._tags.set(extension, tags);
        }
        return tags;
    }
}

class ArchiveContext {
    constructor(entries, rootFolder, identifier, buffer) {
        this._entries = {};
        if (entries) {
            for (const entry of entries) {
                if (entry.name.startsWith(rootFolder)) {
                    const name = entry.name.substring(rootFolder.length);
                    if (identifier.length > 0 && identifier.indexOf('/') < 0) {
                        this._entries[name] = entry;
                    }
                }
            }
        }
        this._identifier = identifier.substring(rootFolder.length);
        this._buffer = buffer;
    }

    request(file, encoding) {
        const entry = this._entries[file];
        if (!entry) {
            return Promise.reject(new Error('File not found.'));
        }
        const data = encoding ? new TextDecoder(encoding).decode(entry.data) : entry.data;
        return Promise.resolve(data);
    }

    get identifier() {
        return this._identifier;
    }

    get buffer() {
        return this._buffer;
    }
}

class ArchiveError extends Error {
    constructor(message) {
        super(message);
        this.name = 'Error loading archive.';
    }
}

view.ModelFactoryService = class {
    constructor(host) {
        this._host = host;
        this._extensions = [];
        this.register('./onnx', ['.onnx', '.pb', '.pbtxt', '.prototxt']);
        this.register('./mxnet', ['.mar', '.model', '.json', '.params']);
        this.register('./keras', ['.h5', '.hd5', '.hdf5', '.keras', '.json', '.model', '.pb', '.pth']);
        this.register('./coreml', ['.mlmodel']);
        this.register('./caffe', ['.caffemodel', '.pbtxt', '.prototxt', '.pt']);
        this.register('./caffe2', ['.pb', '.pbtxt', '.prototxt']);
        this.register('./pytorch', [
            '.pt',
            '.pth',
            '.pt1',
            '.pkl',
            '.h5',
            '.t7',
            '.model',
            '.dms',
            '.tar',
            '.ckpt',
            '.bin',
            '.pb',
            '.zip'
        ]);
        this.register('./torch', ['.t7']);
        this.register('./tflite', ['.tflite', '.lite', '.tfl', '.bin', '.pb', '.tmfile', '.h5', '.model', '.json']);
        this.register('./tf', ['.pb', '.meta', '.pbtxt', '.prototxt', '.json', '.index', '.ckpt']);
        this.register('./mediapipe', ['.pbtxt']);
        this.register('./uff', ['.uff', '.pb', '.trt', '.pbtxt', '.uff.txt']);
        this.register('./sklearn', ['.pkl', '.pickle', '.joblib', '.model', '.meta', '.pb', '.pt', '.h5']);
        this.register('./cntk', ['.model', '.cntk', '.cmf', '.dnn']);
        this.register('./paddle', ['.paddle', '.pdmodel', '__model__']);
        this.register('./armnn', ['.armnn']);
        this.register('./bigdl', ['.model', '.bigdl']);
        this.register('./darknet', ['.cfg', '.model']);
        this.register('./mnn', ['.mnn']);
        this.register('./ncnn', ['.param', '.bin', '.cfg.ncnn', '.weights.ncnn']);
        this.register('./tnn', ['.tnnproto', '.tnnmodel']);
        this.register('./tengine', ['.tmfile']);
        this.register('./barracuda', ['.nn']);
        this.register('./openvino', ['.xml', '.bin']);
        this.register('./flux', ['.bson']);
        this.register('./npz', ['.npz', '.h5', '.hd5', '.hdf5']);
        this.register('./dl4j', ['.zip']);
        this.register('./mlnet', ['.zip']);
    }

    register(id, extensions) {
        for (const extension of extensions) {
            this._extensions.push({extension: extension, id: id});
        }
    }

    open(context) {
        return this._openSignature(context).then(context => {
            return this._openArchive(context).then(context => {
                context = new ModelContext(context);
                const identifier = context.identifier;
                const extension = identifier.split('.').pop().toLowerCase();
                const modules = this._filter(context);
                if (modules.length == 0) {
                    throw new ModelError("Unsupported file extension '." + extension + "'.");
                }
                const errors = [];
                let match = false;
                const nextModule = () => {
                    if (modules.length > 0) {
                        const id = modules.shift();
                        return this._host.require(id).then(module => {
                            if (!module.ModelFactory) {
                                throw new ModelError("Failed to load module '" + id + "'.");
                            }
                            const modelFactory = new module.ModelFactory();
                            if (!modelFactory.match(context)) {
                                return nextModule();
                            }
                            match++;
                            return modelFactory
                                .open(context, this._host)
                                .then(model => {
                                    return model;
                                })
                                .catch(error => {
                                    errors.push(error);
                                    return nextModule();
                                });
                        });
                    } else {
                        if (match) {
                            if (errors.length == 1) {
                                throw errors[0];
                            }
                            throw new ModelError(errors.map(err => err.message).join('\n'));
                        }
                        const knownUnsupportedIdentifiers = new Set([
                            'natives_blob.bin',
                            'v8_context_snapshot.bin',
                            'snapshot_blob.bin',
                            'image_net_labels.json',
                            'package.json',
                            'models.json',
                            'LICENSE.meta',
                            'input_0.pb',
                            'output_0.pb'
                        ]);
                        const skip = knownUnsupportedIdentifiers.has(identifier);
                        const buffer = context.buffer;
                        const content = Array.from(buffer.subarray(0, Math.min(16, buffer.length)))
                            .map(c => (c < 16 ? '0' : '') + c.toString(16))
                            .join('');
                        throw new ModelError(
                            'Unsupported file content (' +
                                content +
                                ") for extension '." +
                                extension +
                                "' in '" +
                                identifier +
                                "'.",
                            !skip
                        );
                    }
                };
                return nextModule();
            });
        });
    }

    _openArchive(context) {
        let archive = null;
        let extension;
        let identifier = context.identifier;
        let buffer = context.buffer;

        try {
            extension = identifier.split('.').pop().toLowerCase();
            if (extension == 'gz' || extension == 'tgz') {
                archive = new gzip.Archive(buffer);
                if (archive.entries.length == 1) {
                    const entry = archive.entries[0];
                    if (entry.name) {
                        identifier = entry.name;
                    } else {
                        identifier = identifier.substring(0, identifier.lastIndexOf('.'));
                        if (extension == 'tgz') {
                            identifier += '.tar';
                        }
                    }
                    buffer = entry.data;
                }
            }
        } catch (error) {
            const message = error && error.message ? error.message : error.toString();
            return Promise.reject(new ArchiveError(message.replace(/\.$/, '') + " in '" + identifier + "'."));
        }

        try {
            extension = identifier.split('.').pop().toLowerCase();
            switch (extension) {
                case 'tar': {
                    // handle .pth.tar
                    const torch = [0x8a, 0x0a, 0x6c, 0xfc, 0x9c, 0x46, 0xf9, 0x20, 0x6a, 0xa8, 0x50, 0x19];
                    if (
                        !buffer ||
                        buffer.length < 14 ||
                        buffer[0] != 0x80 ||
                        !torch.every((v, i) => v == buffer[i + 2])
                    ) {
                        archive = new tar.Archive(buffer);
                    }
                    break;
                }
                case 'zip': {
                    archive = new zip.Archive(buffer);
                    // PyTorch Zip archive
                    if (
                        archive.entries.some(e => e.name.split('/').pop().split('\\').pop() === 'version') &&
                        archive.entries.some(e => e.name.split('/').pop().split('\\').pop() === 'data.pkl')
                    ) {
                        return Promise.resolve(context);
                    }
                    // dl4j
                    if (
                        archive.entries.some(e => e.name.split('/').pop().split('\\').pop() === 'coefficients.bin') &&
                        archive.entries.some(e => e.name.split('/').pop().split('\\').pop() === 'configuration.json')
                    ) {
                        return Promise.resolve(context);
                    }
                    break;
                }
            }
        } catch (error) {
            const message = error && error.message ? error.message : error.toString();
            return Promise.reject(new ArchiveError(message.replace(/\.$/, '') + " in '" + identifier + "'."));
        }

        if (!archive) {
            return Promise.resolve(context);
        }

        try {
            const folders = {};
            for (const entry of archive.entries) {
                if (entry.name.indexOf('/') != -1) {
                    folders[entry.name.split('/').shift() + '/'] = true;
                } else {
                    folders['/'] = true;
                }
            }
            if (extension == 'tar') {
                delete folders['PaxHeader/'];
            }
            let rootFolder = Object.keys(folders).length == 1 ? Object.keys(folders)[0] : '';
            rootFolder = rootFolder == '/' ? '' : rootFolder;
            let matches = [];
            const entries = archive.entries.slice();
            const nextEntry = () => {
                if (entries.length > 0) {
                    const entry = entries.shift();
                    if (entry.name.startsWith(rootFolder)) {
                        const identifier = entry.name.substring(rootFolder.length);
                        if (identifier.length > 0 && identifier.indexOf('/') < 0 && !identifier.startsWith('.')) {
                            const context = new ModelContext(
                                new ArchiveContext(null, rootFolder, entry.name, entry.data)
                            );
                            let modules = this._filter(context);
                            const nextModule = () => {
                                if (modules.length > 0) {
                                    const id = modules.shift();
                                    return this._host.require(id).then(module => {
                                        if (!module.ModelFactory) {
                                            throw new ArchiveError("Failed to load module '" + id + "'.", null);
                                        }
                                        const factory = new module.ModelFactory();
                                        if (factory.match(context)) {
                                            matches.push(entry);
                                            modules = [];
                                        }
                                        return nextModule();
                                    });
                                } else {
                                    return nextEntry();
                                }
                            };
                            return nextModule();
                        }
                    }
                    return nextEntry();
                } else {
                    if (matches.length == 0) {
                        return Promise.resolve(context);
                    }
                    // MXNet
                    if (
                        matches.length == 2 &&
                        matches.some(e => e.name.endsWith('.params')) &&
                        matches.some(e => e.name.endsWith('-symbol.json'))
                    ) {
                        matches = matches.filter(e => e.name.endsWith('.params'));
                    }
                    if (matches.length > 1) {
                        return Promise.reject(new ArchiveError('Archive contains multiple model files.'));
                    }
                    const match = matches[0];
                    return Promise.resolve(
                        new ModelContext(new ArchiveContext(archive.entries, rootFolder, match.name, match.data))
                    );
                }
            };
            return nextEntry();
        } catch (error) {
            return Promise.reject(new ArchiveError(error.message));
        }
    }

    accept(identifier) {
        identifier = identifier.toLowerCase();
        for (const extension of this._extensions) {
            if (identifier.endsWith(extension.extension)) {
                return true;
            }
        }
        if (
            identifier.endsWith('.zip') ||
            identifier.endsWith('.tar') ||
            identifier.endsWith('.tar.gz') ||
            identifier.endsWith('.tgz')
        ) {
            return true;
        }
        return false;
    }

    _filter(context) {
        const identifier = context.identifier.toLowerCase();
        const list = this._extensions.filter(entry => identifier.endsWith(entry.extension)).map(entry => entry.id);
        return Array.from(new Set(list));
    }

    _openSignature(context) {
        const buffer = context.buffer;
        if (context.buffer.length === 0) {
            return Promise.reject(new ModelError('File has no content.', true));
        }
        const list = [
            // cSpell:disable
            {name: 'ELF executable', value: /^\x7FELF/},
            {name: 'Git LFS header', value: /^version https:\/\/git-lfs.github.com\/spec\/v1\n/},
            {name: 'Git LFS header', value: /^oid sha256:/},
            {name: 'HTML markup', value: /^\s*<html>/},
            {name: 'HTML markup', value: /^\s*<!DOCTYPE html>/},
            {name: 'HTML markup', value: /^\s*<!DOCTYPE HTML>/},
            {name: 'Unity metadata', value: /^fileFormatVersion:/},
            {name: 'Vulkan SwiftShader ICD manifest', value: /^{\s*"file_format_version":\s*"1.0.0"\s*,\s*"ICD":/},
            {name: 'StringIntLabelMapProto data', value: /^item\s*{\r?\n\s*id:/},
            {name: 'StringIntLabelMapProto data', value: /^item\s*{\r?\n\s*name:/},
            {name: 'Python source code', value: /^\s*import sys, types, os;/}
            // cSpell:enable
        ];
        const text = new TextDecoder().decode(buffer.subarray(0, Math.min(1024, buffer.length)));
        for (const item of list) {
            if (text.match(item.value)) {
                return Promise.reject(new ModelError('Invalid file content. File contains ' + item.name + '.', true));
            }
        }
        return Promise.resolve(context);
    }
};

if (typeof module !== 'undefined' && typeof module.exports === 'object') {
    module.exports.View = view.View;
    module.exports.ModelFactoryService = view.ModelFactoryService;
}
