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

const sidebar = {};
const long = {Long: require('long')};
const marked = require('marked');

sidebar.NodeSidebar = class {
    constructor(host, node) {
        this._host = host;
        this._node = node;
        this._properties = [];
        this._attributes = [];
        this._inputs = [];
        this._outputs = [];

        if (node.type) {
            this._addProperty(
                'type',
                new sidebar.ValueTextView(this._host, node.type, {documentation: !!node.metadata})
            );
        }

        if (node.name) {
            this._addProperty('name', new sidebar.ValueTextView(this._host, node.name));
        }

        if (node.location) {
            this._addProperty('location', new sidebar.ValueTextView(this._host, node.location));
        }

        if (node.domain) {
            this._addProperty('domain', new sidebar.ValueTextView(this._host, node.domain));
        }

        if (node.description) {
            this._addProperty('description', new sidebar.ValueTextView(this._host, node.description));
        }

        if (node.device) {
            this._addProperty('device', new sidebar.ValueTextView(this._host, node.device));
        }

        const attributes = node.attributes;
        if (attributes && attributes.length > 0) {
            const sortedAttributes = node.attributes.slice();
            sortedAttributes.sort((a, b) => {
                const au = a.name.toUpperCase();
                const bu = b.name.toUpperCase();
                return au < bu ? -1 : au > bu ? 1 : 0;
            });
            for (const attribute of sortedAttributes) {
                this._addAttribute(attribute.name, attribute);
            }
        }

        const inputs = node.inputs;
        if (inputs && inputs.length > 0) {
            for (const input of inputs) {
                this._addInput(input.name, input);
            }
        }

        const outputs = node.outputs;
        if (outputs && outputs.length > 0) {
            for (const output of outputs) {
                this._addOutput(output.name, output);
            }
        }
    }

    render() {
        return {
            properties: this._properties,
            groups: [
                {
                    name: 'attributes',
                    properties: this._attributes
                },
                {
                    name: 'inputs',
                    properties: this._inputs
                },
                {
                    name: 'outputs',
                    properties: this._outputs
                }
            ]
        };
    }

    _addProperty(name, value) {
        const item = new sidebar.NameValueView(this._host, name, value);
        this._properties.push(item.render());
    }

    _addAttribute(name, attribute) {
        const item = new sidebar.NameValueView(this._host, name, new NodeAttributeView(this._host, attribute));
        this._attributes.push(item.render());
    }

    _addInput(name, input) {
        if (input.arguments.length > 0) {
            const view = new sidebar.ParameterView(this._host, input);
            const item = new sidebar.NameValueView(this._host, name, view);
            this._inputs.push(item.render());
        }
    }

    _addOutput(name, output) {
        if (output.arguments.length > 0) {
            const view = new sidebar.ParameterView(this._host, output);
            const item = new sidebar.NameValueView(this._host, name, view);
            this._outputs.push(item.render());
        }
    }

    static formatAttributeValue(value, type, quote) {
        if (typeof value === 'function') {
            return value();
        }
        if (value && long.Long.isLong(value)) {
            return value.toString();
        }
        if (Number.isNaN(value)) {
            return 'NaN';
        }
        switch (type) {
            case 'shape':
                return value.toString();
            case 'shape[]':
                return value ? value.map(item => item.toString()).join(', ') : '(null)';
            case 'graph':
                return value.toString();
            case 'graph[]':
                return value ? value.map(item => item.toString()).join(', ') : '(null)';
            case 'tensor':
                if (
                    value &&
                    value.type &&
                    value.type.shape &&
                    value.type.shape.dimensions &&
                    value.type.shape.dimensions.length == 0
                ) {
                    return value.toString();
                }
                return '[...]';
        }
        if (typeof value === 'string' && (!type || type != 'string')) {
            return quote ? '"' + value + '"' : value;
        }
        if (Array.isArray(value)) {
            if (value.length == 0) {
                return quote ? '[]' : '';
            }
            let ellipsis = false;
            if (value.length > 1000) {
                value = value.slice(0, 1000);
                ellipsis = true;
            }
            const array = value.map(item => {
                if (item && long.Long.isLong(item)) {
                    return item.toString();
                }
                if (Number.isNaN(item)) {
                    return 'NaN';
                }
                return sidebar.NodeSidebar.formatAttributeValue(item, null, true);
            });
            if (ellipsis) {
                array.push('\u2026');
            }
            return quote ? ['[', array.join(', '), ']'].join(' ') : array.join(', ');
        }
        if (value === null) {
            return quote ? 'null' : '';
        }
        if (value === undefined) {
            return 'undefined';
        }
        if (value !== Object(value)) {
            return value.toString();
        }
        const list = [];
        const keys = Object.keys(value).filter(key => !key.startsWith('__') && !key.endsWith('__'));
        if (keys.length == 1) {
            list.push(sidebar.NodeSidebar.formatAttributeValue(value[Object.keys(value)[0]], null, true));
        } else {
            for (const key of keys) {
                list.push(key + ': ' + sidebar.NodeSidebar.formatAttributeValue(value[key], null, true));
            }
        }
        let objectType = value.__type__;
        if (!objectType && value.constructor.name && value.constructor.name !== 'Object') {
            objectType = value.constructor.name;
        }
        if (objectType) {
            return objectType + (list.length == 0 ? '()' : ['(', list.join(', '), ')'].join(''));
        }
        switch (list.length) {
            case 0:
                return quote ? '()' : '';
            case 1:
                return list[0];
            default:
                return quote ? ['(', list.join(', '), ')'].join(' ') : list.join(', ');
        }
    }
};

sidebar.NameValueView = class {
    constructor(host, name, value) {
        this._host = host;
        this._name = name;
        this._value = value;

        this._element = {name, values: value.render()};
    }

    get name() {
        return this._name;
    }

    render() {
        return this._element;
    }
};

// sidebar.SelectView = class {
//     constructor(host, values, selected) {
//         this._host = host;
//         this._elements = [];

//         const selectElement = this._host.document.createElement('select');
//         selectElement.setAttribute('class', 'sidebar-view-item-select');
//         selectElement.addEventListener('change', e => {
//             this._raise('change', e.target.value);
//         });
//         this._elements.push(selectElement);

//         for (const value of values) {
//             const optionElement = this._host.document.createElement('option');
//             optionElement.innerText = value;
//             if (value == selected) {
//                 optionElement.setAttribute('selected', 'selected');
//             }
//             selectElement.appendChild(optionElement);
//         }
//     }

//     render() {
//         return this._elements;
//     }

//     on(event, callback) {
//         this._events = this._events || {};
//         this._events[event] = this._events[event] || [];
//         this._events[event].push(callback);
//     }

//     _raise(event, data) {
//         if (this._events && this._events[event]) {
//             for (const callback of this._events[event]) {
//                 callback(this, data);
//             }
//         }
//     }
// };

sidebar.ValueTextView = class {
    constructor(host, value, action) {
        this._host = host;
        this._elements = [];
        this._elements.push(Object.assign({value}, action));
    }

    render() {
        return this._elements;
    }
};

class NodeAttributeView {
    constructor(host, attribute) {
        this._host = host;
        this._attribute = attribute;
        this._element = {};

        if (attribute.type) {
            this._element.children = this.renderChildren();
        }
        let value = sidebar.NodeSidebar.formatAttributeValue(this._attribute.value, this._attribute.type);
        if (value && value.length > 1000) {
            value = value.substring(0, 1000) + '\u2026';
        }
        this._element.value = value ? value : ' ';
    }

    render() {
        return [this._element];
    }

    renderChildren() {
        const children = [];
        const typeLine = this._host.document.createElement('div');
        typeLine.className = 'sidebar-view-item-value-line-border';
        const type = this._attribute.type;
        const value = this._attribute.value;
        if (type == 'tensor' && value && value.type) {
            children.push({
                name: 'type',
                value: value.type.toString(),
                type: 'code'
            });
        } else {
            children.push({
                name: 'type',
                value: this._attribute.type,
                type: 'code'
            });
        }

        const description = this._attribute.description;
        if (description) {
            children.push({
                value: description
            });
        }

        if (this._attribute.type == 'tensor' && value) {
            const state = value.state;
            children.push({
                value: state || value.toString(),
                type: 'raw'
            });
        }

        return children;
    }
}

sidebar.ParameterView = class {
    constructor(host, list) {
        this._list = list;
        this._elements = [];
        this._items = [];
        for (const argument of list.arguments) {
            const item = new sidebar.ArgumentView(host, argument);
            this._items.push(item);
            this._elements.push(item.render());
        }
    }

    render() {
        return this._elements;
    }
};

sidebar.ArgumentView = class {
    constructor(host, argument) {
        this._host = host;
        this._argument = argument;

        this._element = {};

        const initializer = argument.initializer;
        const quantization = argument.quantization;
        const type = argument.type;
        if (type || initializer || quantization) {
            this._element.children = this.renderChildren();
        }

        let name = this._argument.name || '';
        this._hasId = name ? true : false;
        if (initializer && !this._hasId) {
            this._element.name = 'kind';
            this._element.value = initializer.kind;
        } else {
            if (typeof name !== 'string') {
                throw new Error("Invalid argument identifier '" + JSON.stringify(name) + "'.");
            }
            name = name.split('\n').shift(); // custom argument id
            this._element.name = 'name';
            this._element.value = name || ' ';
        }
    }

    render() {
        return this._element;
    }

    renderChildren() {
        const children = [];

        let type = '?';
        let denotation = null;
        if (this._argument.type) {
            type = this._argument.type.toString();
            denotation = this._argument.type.denotation || null;
        }

        if (type) {
            children.push({
                name: 'type',
                value: type,
                type: 'code'
            });
        }
        if (denotation) {
            children.push({
                name: 'denotation',
                value: denotation,
                type: 'code'
            });
        }

        const description = this._argument.description;
        if (description) {
            children.push({
                name: 'description',
                value: description
            });
        }

        const quantization = this._argument.quantization;
        if (quantization) {
            children.push({
                name: 'quantization',
                value: quantization
            });
        }

        if (this._argument.location) {
            children.push({
                name: 'location',
                value: this._argument.location
            });
        }

        const initializer = this._argument.initializer;
        if (initializer) {
            const reference = initializer.reference;
            if (reference) {
                children.push({
                    name: 'reference',
                    value: this._argument.reference
                });
            }
            const state = initializer.state;

            // TODO: export tensor
            // if (
            //     state === null &&
            //     this._host.save &&
            //     initializer.type.dataType &&
            //     initializer.type.dataType != '?' &&
            //     initializer.type.shape &&
            //     initializer.type.shape.dimensions &&
            //     initializer.type.shape.dimensions.length > 0
            // ) {
            //     this._saveButton = this._host.document.createElement('div');
            //     this._saveButton.className = 'sidebar-view-item-value-expander';
            //     this._saveButton.innerHTML = '&#x1F4BE;';
            //     this._saveButton.addEventListener('click', () => {
            //         this._raise('export-tensor', initializer);
            //     });
            //     this._element.appendChild(this._saveButton);
            // }

            let content = '';
            try {
                content = state || initializer.toString();
            } catch (err) {
                content = err.toString();
                this._host.exception(err, false);
            }
            children.push({
                value: content,
                type: 'raw'
            });
        }

        return children;
    }
};

sidebar.ModelSidebar = class {
    constructor(host, model, graph) {
        this._host = host;
        this._model = model;
        this._properties = [];
        this._groups = [];

        if (this._model.format) {
            this._addProperty('format', new sidebar.ValueTextView(this._host, this._model.format));
        }
        if (this._model.producer) {
            this._addProperty('producer', new sidebar.ValueTextView(this._host, this._model.producer));
        }
        if (this._model.source) {
            this._addProperty('source', new sidebar.ValueTextView(this._host, this._model.source));
        }
        if (this._model.name) {
            this._addProperty('name', new sidebar.ValueTextView(this._host, this._model.name));
        }
        if (this._model.version) {
            this._addProperty('version', new sidebar.ValueTextView(this._host, this._model.version));
        }
        if (this._model.description) {
            this._addProperty('description', new sidebar.ValueTextView(this._host, this._model.description));
        }
        if (this._model.author) {
            this._addProperty('author', new sidebar.ValueTextView(this._host, this._model.author));
        }
        if (this._model.company) {
            this._addProperty('company', new sidebar.ValueTextView(this._host, this._model.company));
        }
        if (this._model.license) {
            this._addProperty('license', new sidebar.ValueTextView(this._host, this._model.license));
        }
        if (this._model.domain) {
            this._addProperty('domain', new sidebar.ValueTextView(this._host, this._model.domain));
        }
        if (this._model.imports) {
            this._addProperty('imports', new sidebar.ValueTextView(this._host, this._model.imports));
        }
        if (this._model.runtime) {
            this._addProperty('runtime', new sidebar.ValueTextView(this._host, this._model.runtime));
        }

        const metadata = this._model.metadata;
        if (metadata) {
            for (const property of metadata) {
                this._addProperty(property.name, new sidebar.ValueTextView(this._host, property.value));
            }
        }

        if (this._model) {
            // let graphSelector = new sidebar.SelectView(
            //     this._host,
            //     this._model.graphs.map(g => g.name),
            //     graph.name
            // );
            // graphSelector.on('change', (sender, data) => {
            //     this._raise('update-active-graph', data);
            // });
            this._addProperty('subgraph', new sidebar.ValueTextView(this._host, graph.name));
        }

        if (graph) {
            if (graph.version) {
                this._addProperty('version', new sidebar.ValueTextView(this._host, graph.version));
            }
            if (graph.type) {
                this._addProperty('type', new sidebar.ValueTextView(this._host, graph.type));
            }
            if (graph.tags) {
                this._addProperty('tags', new sidebar.ValueTextView(this._host, graph.tags));
            }
            if (graph.description) {
                this._addProperty('description', new sidebar.ValueTextView(this._host, graph.description));
            }

            if (graph.inputs.length) {
                for (const input of graph.inputs) {
                    this._addGroupProperty('inputs', input.name, input);
                }
            }

            if (graph.outputs.length) {
                for (const output of graph.outputs) {
                    this._addGroupProperty('outputs', output.name, output);
                }
            }
        }
    }

    render() {
        return {
            properties: this._properties,
            groups: this._groups
        };
    }

    _addGroupProperty(group, name, argument) {
        const exist = this._groups.find(g => g.name === group);
        if (!exist) {
            this._groups.push({
                name: group,
                properties: [this._addArgument(name, argument)]
            });
        } else {
            exist.properties.push(this._addArgument(name, argument));
        }
    }

    _addProperty(name, value) {
        const item = new sidebar.NameValueView(this._host, name, value);
        this._properties.push(item.render());
    }

    _addArgument(name, argument) {
        const view = new sidebar.ParameterView(this._host, argument);
        const item = new sidebar.NameValueView(this._host, name, view);
        return item.render();
    }
};

sidebar.DocumentationSidebar = class {
    constructor(host, metadata) {
        this._host = host;
        this._metadata = metadata;
    }

    render() {
        return sidebar.DocumentationSidebar.formatDocumentation(this._metadata);
    }

    static formatDocumentation(data) {
        if (data) {
            data = JSON.parse(JSON.stringify(data));
            if (data.summary) {
                data.summary = marked(data.summary);
            }
            if (data.description) {
                data.description = marked(data.description);
            }
            if (data.attributes) {
                for (const attribute of data.attributes) {
                    if (attribute.description) {
                        attribute.description = marked(attribute.description);
                    }
                }
            }
            if (data.inputs) {
                for (const input of data.inputs) {
                    if (input.description) {
                        input.description = marked(input.description);
                    }
                }
            }
            if (data.outputs) {
                for (const output of data.outputs) {
                    if (output.description) {
                        output.description = marked(output.description);
                    }
                }
            }
            if (data.references) {
                for (const reference of data.references) {
                    if (reference) {
                        reference.description = marked(reference.description);
                    }
                }
            }
            return data;
        }
        return '';
    }
};

sidebar.FindSidebar = class {
    constructor(host, graphElement, graph) {
        this._host = host;
        this._graphElement = graphElement;
        this._graph = graph;
    }

    static selection(item, graphElement) {
        const selection = [];
        const id = item.id;

        const nodesElement = graphElement.getElementById('nodes');
        if (nodesElement) {
            let nodeElement = nodesElement.firstChild;
            while (nodeElement) {
                if (nodeElement.id == id) {
                    selection.push(nodeElement);
                }
                nodeElement = nodeElement.nextSibling;
            }
        }
        const clustersElement = graphElement.getElementById('clusters');
        if (clustersElement) {
            let clusterElement = clustersElement.firstChild;
            while (clusterElement) {
                if (clusterElement.id == id) {
                    selection.push(clusterElement);
                }
                clusterElement = clusterElement.nextSibling;
            }
        }
        const edgePathsElement = graphElement.getElementById('edge-paths');
        if (edgePathsElement) {
            let edgePathElement = edgePathsElement.firstChild;
            while (edgePathElement) {
                if (edgePathElement.id === id) {
                    // console.log('edgePathElement',edgePathElement.getAttribute("fromnode"),item);
                    // if (item.fromnode && edgePathElement.getAttribute("fromnode") === item.fromnode) {
                    //     selection.push(edgePathElement);
                    // }
                    // if (item.tonode && edgePathElement.getAttribute("tonode") === item.tonode) {
                    //     selection.push(edgePathElement);
                    // }
                    selection.push(edgePathElement);
                }
                edgePathElement = edgePathElement.nextSibling;
            }
        }
        let initializerElement = graphElement.getElementById(id);
        if (initializerElement) {
            while (initializerElement.parentElement) {
                initializerElement = initializerElement.parentElement;
                if (initializerElement.id && initializerElement.id.startsWith('node-')) {
                    selection.push(initializerElement);
                    break;
                }
            }
        }

        if (selection.length > 0) {
            return selection;
        }

        return null;
    }
    static selection2(item, graphElement) {
        const selection = [];
        const id = item.id;

        const nodesElement = graphElement.getElementById('nodes');
        if (nodesElement) {
            let nodeElement = nodesElement.firstChild;
            while (nodeElement) {
                if (nodeElement.id == id) {
                    selection.push(nodeElement);
                }
                nodeElement = nodeElement.nextSibling;
            }
        }
        const clustersElement = graphElement.getElementById('clusters');
        if (clustersElement) {
            let clusterElement = clustersElement.firstChild;
            while (clusterElement) {
                if (clusterElement.id == id) {
                    selection.push(clusterElement);
                }
                clusterElement = clusterElement.nextSibling;
            }
        }
        const edgePathsElement = graphElement.getElementById('edge-paths');
        if (edgePathsElement) {
            let edgePathElement = edgePathsElement.firstChild;
            while (edgePathElement) {
                if (edgePathElement.id === id) {
                    if (item.fromnode && edgePathElement.getAttribute('fromnode') === item.fromnode) {
                        selection.push(edgePathElement);
                    }
                    if (item.tonode && edgePathElement.getAttribute('tonode') === item.tonode) {
                        selection.push(edgePathElement);
                    }
                }
                edgePathElement = edgePathElement.nextSibling;
            }
        }
        let initializerElement = graphElement.getElementById(id);
        if (initializerElement) {
            while (initializerElement.parentElement) {
                initializerElement = initializerElement.parentElement;
                if (initializerElement.id && initializerElement.id.startsWith('node-')) {
                    selection.push(initializerElement);
                    break;
                }
            }
        }

        if (selection.length > 0) {
            return selection;
        }

        return null;
    }

    update(searchText) {
        const text = searchText.toLowerCase();

        const nodeMatches = new Set();
        const edgeMatches = new Set();

        const result = [];
        for (const node of this._graph.nodes) {
            const initializers = [];

            for (const input of node.inputs) {
                for (const argument of input.arguments) {
                    if (
                        argument.name &&
                        argument.name.toLowerCase().indexOf(text) != -1 &&
                        !edgeMatches.has(argument.name)
                    ) {
                        if (!argument.initializer) {
                            result.push({
                                type: 'input',
                                name: argument.name.split('\n').shift(), // custom argument id
                                id: 'edge-' + argument.name
                            });
                            edgeMatches.add(argument.name);
                        } else {
                            // initializers.push(argument.initializer);
                        }
                    }
                }
            }

            const name = node.name;
            console.log('name', node);
            const operator = node.type;
            if (
                !nodeMatches.has(name) &&
                name &&
                (name.toLowerCase().indexOf(text) != -1 || (operator && operator.toLowerCase().indexOf(text) != -1))
            ) {
                result.push({
                    type: 'node',
                    name: name,
                    id: 'node-' + name
                });
                nodeMatches.add(name);
            }
            // let path = node.name.split('/');
            // path.pop();
            // let groupName = path.join('/');
            // console.log('groupName', groupName);
            // const clusterNode = name => {
            //     if (
            //         !nodeMatches.has(name) &&
            //         name &&
            //         (name.toLowerCase().indexOf(text) != -1 || (operator && operator.toLowerCase().indexOf(text) != -1))
            //     ) {
            //         result.push({
            //             type: 'node',
            //             name: name,
            //             id: 'node-' + name
            //         });
            //         nodeMatches.add(name);
            //         let path = name.split('/');
            //         while (path.length > 0) {
            //             const name = path.join('/');
            //             path.pop();
            //             if (name) {
            //                 clusterNode(name);
            //             }
            //         }
            //     }
            // };
            // if (groupName) {
            //     clusterNode(groupName);
            //     // g.setParent(nodeId, groupName);
            // }
            // clusterNode(node.show_name);
            // if (
            //     !nodeMatches.has(name) &&
            //     name &&
            //     (name.toLowerCase().indexOf(text) != -1 || (operator && operator.toLowerCase().indexOf(text) != -1))
            // ) {
            //     result.push({
            //         type: 'node',
            //         name: node.name,
            //         id: 'node-' + node.name
            //     });
            //     //
            //     nodeMatches.add(node.name);
            // }
            for (const initializer of initializers) {
                result.push({
                    type: 'initializer',
                    name: initializer.name,
                    id: 'initializer-' + initializer.name
                });
            }
        }

        for (const node of this._graph.nodes) {
            for (const output of node.outputs) {
                for (const argument of output.arguments) {
                    if (
                        argument.name &&
                        argument.name.toLowerCase().indexOf(text) != -1 &&
                        !edgeMatches.has(argument.name)
                    ) {
                        result.push({
                            type: 'output',
                            name: argument.name.split('\n').shift(), // custom argument id
                            id: 'edge-' + argument.name
                        });
                        edgeMatches.add(argument.name);
                    }
                }
            }
        }
        return {
            text: searchText,
            result: result
        };
    }
};

if (typeof module !== 'undefined' && typeof module.exports === 'object') {
    module.exports.Sidebar = sidebar.Sidebar;
    module.exports.ModelSidebar = sidebar.ModelSidebar;
    module.exports.NodeSidebar = sidebar.NodeSidebar;
    module.exports.DocumentationSidebar = sidebar.DocumentationSidebar;
    module.exports.FindSidebar = sidebar.FindSidebar;
}
