/* jshint esversion: 6 */
/* eslint "indent": [ "error", 4, { "SwitchCase": 1 } ] */

var sidebar = sidebar || {};
var long = long || { Long: require('long') };
var marked = marked || require('marked');

sidebar.Sidebar = class {

    constructor(host) {
        this._host = host;
        this._stack = [];
        this._closeSidebarHandler = () => {
            this._pop();
        };
        this._closeSidebarKeyDownHandler = (e) => {
            if (e.keyCode == 27) {
                e.preventDefault();
                this._pop();
            }
        };
        this._resizeSidebarHandler = () => {
            let contentElement = this._host.document.getElementById('sidebar-content');
            if (contentElement) {
                contentElement.style.height = window.innerHeight - 60;
            }
        };
    }

    open(content, title, width) {
        this.close();
        this.push(content, title, width);
    }

    close() {
        this._deactivate();
        this._stack = [];
        this._hide();
    }

    push(content, title, width) {
        let item = { title: title, content: content, width: width };
        this._stack.push(item);
        this._activate(item);
    }

    _pop() {
        this._deactivate();
        if (this._stack.length > 0) {
            this._stack.pop();
        }
        if (this._stack.length > 0) {
            this._activate(this._stack[this._stack.length - 1]);
        }
        else {
            this._hide();
        }
    }

    _hide() {
        let sidebarElement = this._host.document.getElementById('sidebar');
        if (sidebarElement) {
            sidebarElement.style.width = '0';
        }
    }

    _deactivate() {
        let sidebarElement = this._host.document.getElementById('sidebar');
        if (sidebarElement) {
            let closeButton = this._host.document.getElementById('sidebar-closebutton');
            if (closeButton) {
                closeButton.removeEventListener('click', this._closeSidebarHandler);
                closeButton.style.color = '#f8f8f8';
            }

            this._host.document.removeEventListener('keydown', this._closeSidebarKeyDownHandler);
            sidebarElement.removeEventListener('resize', this._resizeSidebarHandler);
        }
    }

    _activate(item) {
        let sidebarElement = this._host.document.getElementById('sidebar');
        if (sidebarElement) {
            sidebarElement.innerHTML = '';

            let titleElement = this._host.document.createElement('h1');
            titleElement.classList.add('sidebar-title');
            titleElement.innerHTML = item.title ? item.title.toUpperCase() : '';
            sidebarElement.appendChild(titleElement);

            let closeButton = this._host.document.createElement('a');
            closeButton.classList.add('sidebar-closebutton');
            closeButton.setAttribute('id', 'sidebar-closebutton');
            closeButton.setAttribute('href', 'javascript:void(0)');
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', this._closeSidebarHandler);
            sidebarElement.appendChild(closeButton);

            let contentElement = this._host.document.createElement('div');
            contentElement.classList.add('sidebar-content');
            contentElement.setAttribute('id', 'sidebar-content');
            sidebarElement.appendChild(contentElement);

            contentElement.style.height = window.innerHeight - 60;

            if (typeof content == 'string') {
                contentElement.innerHTML = item.content;
            }
            else if (item.content instanceof Array) {
                for (const element of item.content) {
                    contentElement.appendChild(element);
                }
            }
            else {
                contentElement.appendChild(item.content);
            }

            sidebarElement.style.width = item.width ? item.width : '500px';
            if (item.width && item.width.endsWith('%')) {
                contentElement.style.width = '100%';
            }
            else {
                contentElement.style.width = 'calc(' + sidebarElement.style.width + ' - 40px)';
            }

            window.addEventListener('resize', this._resizeSidebarHandler);
            this._host.document.addEventListener('keydown', this._closeSidebarKeyDownHandler);
        }
    }
};

sidebar.NodeSidebar = class {

    constructor(host, node) {
        this._host = host;
        this._node = node;
        this._elements = [];
        this._attributes = [];
        this._inputs = [];
        this._outputs = [];

        if (node.type) {
            let showDocumentation = null;
            if (node.metadata) {
                showDocumentation = {};
                showDocumentation.text = '?';
                showDocumentation.callback = () => {
                    this._raise('show-documentation', null);
                };
            }
            this._addProperty('type', new sidebar.ValueTextView(this._host, node.type, showDocumentation));
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
            let sortedAttributes = node.attributes.slice();
            sortedAttributes.sort((a, b) => {
                const au = a.name.toUpperCase();
                const bu = b.name.toUpperCase();
                return (au < bu) ? -1 : (au > bu) ? 1 : 0;
            });
            this._addHeader('Attributes');
            for (const attribute of sortedAttributes) {
                this._addAttribute(attribute.name, attribute);
            }
        }

        const inputs = node.inputs;
        if (inputs && inputs.length > 0) {
            this._addHeader('Inputs');
            for (const input of inputs) {
                this._addInput(input.name, input);
            }
        }

        const outputs = node.outputs;
        if (outputs && outputs.length > 0) {
            this._addHeader('Outputs');
            for (const output of outputs) {
                this._addOutput(output.name, output);
            }
        }

        const divider = this._host.document.createElement('div');
        divider.setAttribute('style', 'margin-bottom: 20px');
        this._elements.push(divider);
    }

    render() {
        return this._elements;
    }

    _addHeader(title) {
        const headerElement = this._host.document.createElement('div');
        headerElement.className = 'sidebar-view-header';
        headerElement.innerText = title;
        this._elements.push(headerElement);
    }

    _addProperty(name, value) {
        const item = new sidebar.NameValueView(this._host, name, value);
        this._elements.push(item.render());
    }

    _addAttribute(name, attribute) {
        const item = new sidebar.NameValueView(this._host, name, new NodeAttributeView(this._host, attribute));
        this._attributes.push(item);
        this._elements.push(item.render());
    }

    _addInput(name, input) {
        if (input.arguments.length > 0) {
            const view = new sidebar.ParameterView(this._host, input);
            view.on('export-tensor', (sender, tensor) => {
                this._raise('export-tensor', tensor);
            });
            const item = new sidebar.NameValueView(this._host, name, view);
            this._inputs.push(item);
            this._elements.push(item.render());
        }
    }

    _addOutput(name, output) {
        if (output.arguments.length > 0) {
            const item = new sidebar.NameValueView(this._host, name, new sidebar.ParameterView(this._host, output));
            this._outputs.push(item);
            this._elements.push(item.render());
        }
    }

    toggleInput(name) {
        for (const input of this._inputs) {
            if (name == input.name) {
                input.toggle();
            }
        }
    }

    on(event, callback) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(callback);
    }

    _raise(event, data) {
        if (this._events && this._events[event]) {
            for (const callback of this._events[event]) {
                callback(this, data);
            }
        }
    }

    static formatAttributeValue(value, type, quote) {
        if (typeof value === 'function') {
            return value();
        }
        if (value && long.Long.isLong(value)) {
            return value.toString();
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
                return value ? value.map((item) => item.toString()).join(', ') : '(null)';
            case 'graph':
                return value.toString();
            case 'graph[]':
                return value ? value.map((item) => item.toString()).join(', ') : '(null)';
            case 'tensor':
                if (value && value.type && value.type.shape && value.type.shape.dimensions && value.type.shape.dimensions.length == 0) {
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
            let array = value.map((item) => {
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
            return quote ? [ '[', array.join(', '), ']' ].join(' ') : array.join(', ');
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
        let list = [];
        const keys = Object.keys(value).filter((key) => !key.startsWith('__') && !key.endsWith('__'));
        if (keys.length == 1) {
            list.push(sidebar.NodeSidebar.formatAttributeValue(value[Object.keys(value)[0]], null, true));
        }
        else {
            for (const key of keys) {
                list.push(key + ': ' + sidebar.NodeSidebar.formatAttributeValue(value[key], null, true));
            }
        }
        let objectType = value.__type__;
        if (!objectType && value.constructor.name && value.constructor.name && value.constructor.name !== 'Object') {
            objectType = value.constructor.name;
        }
        if (objectType) {
            return objectType + (list.length == 0 ? '()' : [ '(', list.join(', '), ')' ].join(''));
        }
        switch (list.length) {
            case 0:
                return quote ? '()' : '';
            case 1:
                return list[0];
            default:
                return quote ? [ '(', list.join(', '), ')' ].join(' ') : list.join(', ');
        }
    }
};

sidebar.NameValueView = class {

    constructor(host, name, value) {
        this._host = host;
        this._name = name;
        this._value = value;

        const nameElement = this._host.document.createElement('div');
        nameElement.className = 'sidebar-view-item-name';

        const nameInputElement = this._host.document.createElement('input');
        nameInputElement.setAttribute('type', 'text');
        nameInputElement.setAttribute('value', name);
        nameInputElement.setAttribute('title', name);
        nameInputElement.setAttribute('readonly', 'true');
        nameElement.appendChild(nameInputElement);

        const valueElement = this._host.document.createElement('div');
        valueElement.className = 'sidebar-view-item-value-list';

        for (const element of value.render()) {
            valueElement.appendChild(element);
        }

        this._element = this._host.document.createElement('div');
        this._element.className = 'sidebar-view-item';
        this._element.appendChild(nameElement);
        this._element.appendChild(valueElement);
    }

    get name() {
        return this._name;
    }

    render() {
        return this._element;
    }

    toggle() {
        this._value.toggle();
    }
};

sidebar.SelectView = class {

    constructor(host, values, selected) {
        this._host = host;
        this._elements = [];

        const selectElement = this._host.document.createElement('select');
        selectElement.setAttribute('class', 'sidebar-view-item-select');
        selectElement.addEventListener('change', (e) => {
            this._raise('change', e.target.value);
        });
        this._elements.push(selectElement);

        for (const value of values) {
            const optionElement = this._host.document.createElement('option');
            optionElement.innerText = value;
            if (value == selected) {
                optionElement.setAttribute('selected', 'selected');
            }
            selectElement.appendChild(optionElement);
        }
    }

    render() {
        return this._elements;
    }

    on(event, callback) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(callback);
    }

    _raise(event, data) {
        if (this._events && this._events[event]) {
            for (const callback of this._events[event]) {
                callback(this, data);
            }
        }
    }
};

sidebar.ValueTextView = class {

    constructor(host, value, action) {
        this._host = host;
        this._elements = [];
        const element = this._host.document.createElement('div');
        element.className = 'sidebar-view-item-value';
        this._elements.push(element);

        if (action) {
            this._action = this._host.document.createElement('div');
            this._action.className = 'sidebar-view-item-value-expander';
            this._action.innerHTML = action.text;
            this._action.addEventListener('click', () => {
                action.callback();
            });
            element.appendChild(this._action);
        }

        const line = this._host.document.createElement('div');
        line.className = 'sidebar-view-item-value-line';
        line.innerText = value;
        element.appendChild(line);
    }

    render() {
        return this._elements;
    }

    toggle() {
    }
};

class NodeAttributeView {

    constructor(host, attribute) {
        this._host = host;
        this._attribute = attribute;
        this._element = this._host.document.createElement('div');
        this._element.className = 'sidebar-view-item-value';

        if (attribute.type) {
            this._expander = this._host.document.createElement('div');
            this._expander.className = 'sidebar-view-item-value-expander';
            this._expander.innerText = '+';
            this._expander.addEventListener('click', () => {
                this.toggle();
            });
            this._element.appendChild(this._expander);
        }
        let value = sidebar.NodeSidebar.formatAttributeValue(this._attribute.value, this._attribute.type);
        if (value && value.length > 1000) {
            value = value.substring(0, 1000) + '\u2026';
        }
        if (value && typeof value === 'string') {
            value = value.split('<').join('&lt;').split('>').join('&gt;');
        }
        let valueLine = this._host.document.createElement('div');
        valueLine.className = 'sidebar-view-item-value-line';
        valueLine.innerHTML = (value ? value : '&nbsp;');
        this._element.appendChild(valueLine);
    }

    render() {
        return [ this._element ];
    }

    toggle() {
        if (this._expander.innerText == '+') {
            this._expander.innerText = '-';

            const typeLine = this._host.document.createElement('div');
            typeLine.className = 'sidebar-view-item-value-line-border';
            const type = this._attribute.type;
            const value = this._attribute.value;
            if (type == 'tensor' && value && value.type) {
                typeLine.innerHTML = 'type: ' + '<code><b>' + value.type.toString() + '</b></code>';
                this._element.appendChild(typeLine);
            }
            else {
                typeLine.innerHTML = 'type: ' + '<code><b>' + this._attribute.type + '</b></code>';
                this._element.appendChild(typeLine);
            }

            const description = this._attribute.description;
            if (description) {
                const descriptionLine = this._host.document.createElement('div');
                descriptionLine.className = 'sidebar-view-item-value-line-border';
                descriptionLine.innerHTML = description;
                this._element.appendChild(descriptionLine);
            }

            if (this._attribute.type == 'tensor' && value) {
                const state = value.state;
                const valueLine = this._host.document.createElement('div');
                valueLine.className = 'sidebar-view-item-value-line-border';
                const contentLine = this._host.document.createElement('pre');
                contentLine.innerHTML = state || value.toString();
                valueLine.appendChild(contentLine);
                this._element.appendChild(valueLine);
            }
        }
        else {
            this._expander.innerText = '+';
            while (this._element.childElementCount > 2) {
                this._element.removeChild(this._element.lastChild);
            }
        }
    }
}

sidebar.ParameterView = class {

    constructor(host, list) {
        this._list = list;
        this._elements = [];
        this._items = [];
        for (const argument of list.arguments) {
            const item = new sidebar.ArgumentView(host, argument);
            item.on('export-tensor', (sender, tensor) => {
                this._raise('export-tensor', tensor);
            });
            this._items.push(item);
            this._elements.push(item.render());
        }
    }

    render() {
        return this._elements;
    }

    toggle() {
        for (const item of this._items) {
            item.toggle();
        }
    }

    on(event, callback) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(callback);
    }

    _raise(event, data) {
        if (this._events && this._events[event]) {
            for (const callback of this._events[event]) {
                callback(this, data);
            }
        }
    }
};

sidebar.ArgumentView = class {

    constructor(host, argument) {
        this._host = host;
        this._argument = argument;

        this._element = this._host.document.createElement('div');
        this._element.className = 'sidebar-view-item-value';

        const initializer = argument.initializer;
        if (initializer) {
            this._element.classList.add('sidebar-view-item-value-dark');
        }

        const quantization = argument.quantization;
        const type = argument.type;
        if (type || initializer || quantization) {
            this._expander = this._host.document.createElement('div');
            this._expander.className = 'sidebar-view-item-value-expander';
            this._expander.innerText = '+';
            this._expander.addEventListener('click', () => {
                this.toggle();
            });
            this._element.appendChild(this._expander);
        }

        let name = this._argument.name || '';
        this._hasId = name ? true : false;
        if (initializer && !this._hasId) {
            const kindLine = this._host.document.createElement('div');
            kindLine.className = 'sidebar-view-item-value-line';
            kindLine.innerHTML = 'kind: <b>' + initializer.kind + '</b>';
            this._element.appendChild(kindLine);
        }
        else {
            const nameLine = this._host.document.createElement('div');
            nameLine.className = 'sidebar-view-item-value-line';
            if (typeof name !== 'string') {
                throw new Error("Invalid argument identifier '" + JSON.stringify(name) + "'.");
            }
            name = name.split('\n').shift(); // custom argument id
            name = name || ' ';
            nameLine.innerHTML = '<span class=\'sidebar-view-item-value-line-content\'>name: <b>' + name + '</b></span>';
            this._element.appendChild(nameLine);
        }
    }

    render() {
        return this._element;
    }

    toggle() {
        if (this._expander) {
            if (this._expander.innerText == '+') {
                this._expander.innerText = '-';

                let initializer = this._argument.initializer;
                if (initializer && this._hasId) {
                    let kind = initializer.kind;
                    if (kind) {
                        let kindLine = this._host.document.createElement('div');
                        kindLine.className = 'sidebar-view-item-value-line-border';
                        kindLine.innerHTML = 'kind: ' + '<b>' + kind + '</b>';
                        this._element.appendChild(kindLine);
                    }
                }

                let type = '?';
                let denotation = null;
                if (this._argument.type) {
                    type = this._argument.type.toString();
                    denotation = this._argument.type.denotation || null;
                }

                if (type) {
                    let typeLine = this._host.document.createElement('div');
                    typeLine.className = 'sidebar-view-item-value-line-border';
                    typeLine.innerHTML = 'type: <code><b>' + type.split('<').join('&lt;').split('>').join('&gt;') + '</b></code>';
                    this._element.appendChild(typeLine);
                }
                if (denotation) {
                    let denotationLine = this._host.document.createElement('div');
                    denotationLine.className = 'sidebar-view-item-value-line-border';
                    denotationLine.innerHTML = 'denotation: <code><b>' + denotation + '</b></code>';
                    this._element.appendChild(denotationLine);
                }

                let description = this._argument.description;
                if (description) {
                    let descriptionLine = this._host.document.createElement('div');
                    descriptionLine.className = 'sidebar-view-item-value-line-border';
                    descriptionLine.innerHTML = description;
                    this._element.appendChild(descriptionLine);
                }

                let quantization = this._argument.quantization;
                if (quantization) {
                    let quantizationLine = this._host.document.createElement('div');
                    quantizationLine.className = 'sidebar-view-item-value-line-border';
                    quantizationLine.innerHTML = '<span class=\'sidebar-view-item-value-line-content\'>quantization: ' + '<b>' + quantization + '</b></span>';
                    this._element.appendChild(quantizationLine);
                }

                if (this._argument.location) {
                    let location = this._host.document.createElement('div');
                    location.className = 'sidebar-view-item-value-line-border';
                    location.innerHTML = 'location: ' + '<b>' + this._argument.location + '</b>';
                    this._element.appendChild(location);
                }

                if (initializer) {
                    let reference = initializer.reference;
                    if (reference) {
                        let referenceLine = this._host.document.createElement('div');
                        referenceLine.className = 'sidebar-view-item-value-line-border';
                        referenceLine.innerHTML = 'reference: ' + '<b>' + reference + '</b>';
                        this._element.appendChild(referenceLine);
                    }
                    let state = initializer.state;
                    if (state === null && this._host.save &&
                        initializer.type.dataType && initializer.type.dataType != '?' &&
                        initializer.type.shape && initializer.type.shape.dimensions && initializer.type.shape.dimensions.length > 0) {
                        this._saveButton = this._host.document.createElement('div');
                        this._saveButton.className = 'sidebar-view-item-value-expander';
                        this._saveButton.innerHTML = '&#x1F4BE;';
                        this._saveButton.addEventListener('click', () => {
                            this._raise('export-tensor', initializer);
                        });
                        this._element.appendChild(this._saveButton);
                    }

                    let valueLine = this._host.document.createElement('div');
                    valueLine.className = 'sidebar-view-item-value-line-border';
                    let contentLine = this._host.document.createElement('pre');
                    try {
                        contentLine.innerHTML = state || initializer.toString();
                    }
                    catch (err) {
                        contentLine.innerHTML = err.toString();
                        this._host.exception(err, false);
                    }
                    valueLine.appendChild(contentLine);
                    this._element.appendChild(valueLine);
                }
            }
            else {
                this._expander.innerText = '+';
                while (this._element.childElementCount > 2) {
                    this._element.removeChild(this._element.lastChild);
                }
            }
        }
    }

    on(event, callback) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(callback);
    }

    _raise(event, data) {
        if (this._events && this._events[event]) {
            for (const callback of this._events[event]) {
                callback(this, data);
            }
        }
    }
};

sidebar.ModelSidebar = class {

    constructor(host, model, graph) {
        this._host = host;
        this._model = model;
        this._elements = [];

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

        let metadata = this._model.metadata;
        if (metadata) {
            for (const property of this._model.metadata) {
                this._addProperty(property.name, new sidebar.ValueTextView(this._host, property.value));
            }
        }

        if (this._model._graphs.length > 1) {
            let graphSelector = new sidebar.SelectView(this._host, this._model.graphs.map((g) => g.name), graph.name);
            graphSelector.on('change', (sender, data) => {
                this._raise('update-active-graph', data);
            });
            this._addProperty('subgraph', graphSelector);
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

            if (graph.inputs.length > 0) {
                this._addHeader('Inputs');
                for (const input of graph.inputs) {
                    this.addArgument(input.name, input);
                }
            }

            if (graph.outputs.length > 0) {
                this._addHeader('Outputs');
                for (const output of graph.outputs) {
                    this.addArgument(output.name, output);
                }
            }
        }
    }

    render() {
        return this._elements;
    }

    _addHeader(title) {
        let headerElement = this._host.document.createElement('div');
        headerElement.className = 'sidebar-view-header';
        headerElement.innerText = title;
        this._elements.push(headerElement);
    }

    _addProperty(name, value) {
        let item = new sidebar.NameValueView(this._host, name, value);
        this._elements.push(item.render());
    }

    addArgument(name, argument) {
        let view = new sidebar.ParameterView(this._host, argument);
        view.toggle();
        let item = new sidebar.NameValueView(this._host, name, view);
        this._elements.push(item.render());
    }

    on(event, callback) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(callback);
    }

    _raise(event, data) {
        if (this._events && this._events[event]) {
            for (const callback of this._events[event]) {
                callback(this, data);
            }
        }
    }
};

sidebar.DocumentationSidebar = class {

    constructor(host, metadata) {
        this._host = host;
        this._metadata = metadata;
    }

    render() {
        if (!this._elements) {
            this._elements = [];

            const documentation = sidebar.DocumentationSidebar.formatDocumentation(this._metadata);

            const element = this._host.document.createElement('div');
            element.setAttribute('class', 'sidebar-view-documentation');

            this._append(element, 'h1', documentation.name);

            if (documentation.summary) {
                this._append(element, 'p', documentation.summary);
            }

            if (documentation.description) {
                this._append(element, 'p', documentation.description);
            }

            if (documentation.attributes) {
                this._append(element, 'h2', 'Attributes');
                const attributes = this._append(element, 'dl');
                for (const attribute of documentation.attributes) {
                    this._append(attributes, 'dt', attribute.name + (attribute.type ? ': <tt>' + attribute.type + '</tt>' : ''));
                    this._append(attributes, 'dd', attribute.description);
                }
                element.appendChild(attributes);
            }

            if (documentation.inputs) {
                this._append(element, 'h2', 'Inputs' + (documentation.inputs_range ? ' (' + documentation.inputs_range + ')' : ''));
                const inputs = this._append(element, 'dl');
                for (const input of documentation.inputs) {
                    this._append(inputs, 'dt', input.name + (input.type ? ': <tt>' + input.type + '</tt>' : '') + (input.option ? ' (' + input.option + ')' : ''));
                    this._append(inputs, 'dd', input.description);
                }
            }

            if (documentation.outputs) {
                this._append(element, 'h2', 'Outputs' + (documentation.outputs_range ? ' (' + documentation.outputs_range + ')' : ''));
                const outputs = this._append(element, 'dl');
                for (const output of documentation.outputs) {
                    this._append(outputs, 'dt', output.name + (output.type ? ': <tt>' + output.type + '</tt>' : '') + (output.option ? ' (' + output.option + ')' : ''));
                    this._append(outputs, 'dd', output.description);
                }
            }

            if (documentation.type_constraints) {
                this._append(element, 'h2', 'Type Constraints');
                const type_constraints = this._append(element, 'dl');
                for (const type_constraint of documentation.type_constraints) {
                    this._append(type_constraints, 'dt', type_constraint.type_param_str + ': ' + type_constraint.allowed_type_strs.map((item) => '<tt>' + item + '</tt>').join(', '));
                    this._append(type_constraints, 'dd', type_constraint.description);
                }
            }

            if (documentation.examples) {
                this._append(element, 'h2', 'Examples');
                for (const example of documentation.examples) {
                    this._append(element, 'h3', example.summary);
                    this._append(element, 'pre', example.code);
                }
            }

            if (documentation.references) {
                this._append(element, 'h2', 'References');
                const references = this._append(element, 'ul');
                for (const reference of documentation.references) {
                    this._append(references, 'li', reference.description);
                }
            }

            if (documentation.domain && documentation.since_version && documentation.support_level) {
                this._append(element, 'h2', 'Support');
                this._append(element, 'dl', 'In domain <tt>' + documentation.domain + '</tt> since version <tt>' + documentation.since_version + '</tt> at support level <tt>' + documentation.support_level + '</tt>.');
            }

            element.addEventListener('click', (e) => {
                if (e.target && e.target.href) {
                    let link = e.target.href;
                    if (link.startsWith('http://') || link.startsWith('https://')) {
                        e.preventDefault();
                        this._raise('navigate', { link: link });
                    }
                }
            });
            this._elements = [ element ];
        }
        return this._elements;
    }

    on(event, callback) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(callback);
    }

    _raise(event, data) {
        if (this._events && this._events[event]) {
            for (const callback of this._events[event]) {
                callback(this, data);
            }
        }
    }

    _append(parent, type, content) {
        const element = this._host.document.createElement(type);
        if (content) {
            element.innerHTML = content;
        }
        parent.appendChild(element);
        return element;
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
        this._contentElement = this._host.document.createElement('div');
        this._contentElement.setAttribute('class', 'sidebar-view-find');
        this._searchElement = this._host.document.createElement('input');
        this._searchElement.setAttribute('id', 'search');
        this._searchElement.setAttribute('type', 'text');
        this._searchElement.setAttribute('placeholder', 'Search...');
        this._searchElement.setAttribute('style', 'width: 100%');
        this._searchElement.addEventListener('input', (e) => {
            this.update(e.target.value);
            this._raise('search-text-changed', e.target.value);
        });
        this._resultElement = this._host.document.createElement('ol');
        this._resultElement.addEventListener('click', (e) => {
            this.select(e);
        });
        this._contentElement.appendChild(this._searchElement);
        this._contentElement.appendChild(this._resultElement);
    }

    on(event, callback) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(callback);
    }

    _raise(event, data) {
        if (this._events && this._events[event]) {
            for (const callback of this._events[event]) {
                callback(this, data);
            }
        }
    }

    select(e) {
        let selection = [];
        let id = e.target.id;

        let nodesElement = this._graphElement.getElementById('nodes');
        let nodeElement = nodesElement.firstChild;
        while (nodeElement) {
            if (nodeElement.id == id) {
                selection.push(nodeElement);
            }
            nodeElement = nodeElement.nextSibling;
        }

        let edgePathsElement = this._graphElement.getElementById('edge-paths');
        let edgePathElement = edgePathsElement.firstChild;
        while (edgePathElement) {
            if (edgePathElement.id == id) {
                selection.push(edgePathElement);
            }
            edgePathElement = edgePathElement.nextSibling;
        }

        let initializerElement = this._graphElement.getElementById(id);
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
            this._raise('select', selection);
        }
    }

    focus(searchText) {
        this._searchElement.focus();
        this._searchElement.value = '';
        this._searchElement.value = searchText;
        this.update(searchText);
    }

    update(searchText) {
        while (this._resultElement.lastChild) {
            this._resultElement.removeChild(this._resultElement.lastChild);
        }

        let text = searchText.toLowerCase();

        let nodeMatches = new Set();
        let edgeMatches = new Set();

        for (const node of this._graph.nodes) {

            let initializers = [];

            for (const input of node.inputs) {
                for (const argument of input.arguments) {
                    if (argument.name && argument.name.toLowerCase().indexOf(text) != -1 && !edgeMatches.has(argument.name)) {
                        if (!argument.initializer) {
                            let inputItem = this._host.document.createElement('li');
                            inputItem.innerText = '\u2192 ' + argument.name.split('\n').shift(); // custom argument id
                            inputItem.id = 'edge-' + argument.name;
                            this._resultElement.appendChild(inputItem);
                            edgeMatches.add(argument.name);
                        }
                        else {
                            initializers.push(argument.initializer);
                        }
                    }
                }
            }

            const name = node.name;
            const operator = node.type;
            if (!nodeMatches.has(name) && name &&
                ((name.toLowerCase().indexOf(text) != -1) ||
                (operator && operator.toLowerCase().indexOf(text) != -1))) {
                let nameItem = this._host.document.createElement('li');
                nameItem.innerText = '\u25A2 ' + node.name;
                nameItem.id = 'node-' + node.name;
                this._resultElement.appendChild(nameItem);
                nodeMatches.add(node.name);
            }

            for (const initializer of initializers) {
                let initializeItem = this._host.document.createElement('li');
                initializeItem.innerText = '\u25A0 ' + initializer.name;
                initializeItem.id = 'initializer-' + initializer.name;
                this._resultElement.appendChild(initializeItem);
            }
        }

        for (const node of this._graph.nodes) {
            for (const output of node.outputs) {
                for (const argument of output.arguments) {
                    if (argument.name && argument.name.toLowerCase().indexOf(text) != -1 && !edgeMatches[argument.name]) {
                        let outputItem = this._host.document.createElement('li');
                        outputItem.innerText = '\u2192 ' + argument.name.split('\n').shift(); // custom argument id
                        outputItem.id = 'edge-' + argument.name;
                        this._resultElement.appendChild(outputItem);
                        edgeMatches[argument.name] = true;
                    }
                }
            }
        }

        this._resultElement.style.display = this._resultElement.childNodes.length != 0 ? 'block' : 'none';
    }

    get content() {
        return this._contentElement;
    }
};

if (typeof module !== 'undefined' && typeof module.exports === 'object') {
    module.exports.Sidebar = sidebar.Sidebar;
    module.exports.ModelSidebar = sidebar.ModelSidebar;
    module.exports.NodeSidebar = sidebar.NodeSidebar;
    module.exports.DocumentationSidebar = sidebar.DocumentationSidebar;
    module.exports.FindSidebar = sidebar.FindSidebar;
}