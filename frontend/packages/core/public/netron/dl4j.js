/* jshint esversion: 6 */
/* eslint "indent": [ "error", 4, { "SwitchCase": 1 } ] */

// Experimental

var dl4j = dl4j || {};
var long = long || { Long: require('long') };

dl4j.ModelFactory = class {

    match(context) {
        const identifier = context.identifier.toLowerCase();
        const extension = identifier.split('.').pop().toLowerCase();
        if (extension === 'zip' && context.entries('zip').length > 0) {
            if (dl4j.ModelFactory._openContainer(context)) {
                return true;
            }
        }
        return false;
    }

    open(context, host) {
        const identifier = context.identifier;
        try {
            const container = dl4j.ModelFactory._openContainer(context);
            const configuration = JSON.parse(container.configuration);
            return dl4j.Metadata.open(host).then((metadata) => {
                try {
                    return new dl4j.Model(metadata, configuration, container.coefficients);
                }
                catch (error) {
                    host.exception(error, false);
                    const message = error && error.message ? error.message : error.toString();
                    throw new dl4j.Error(message.replace(/\.$/, '') + " in '" + identifier + "'.");
                }
            });
        }
        catch (error) {
            host.exception(error, false);
            const message = error && error.message ? error.message : error.toString();
            return Promise.reject(new dl4j.Error(message.replace(/\.$/, '') + " in '" + identifier + "'."));
        }
    }

    static _openContainer(context) {
        const entries = context.entries('zip');
        const configurationEntries = entries.filter((entry) => entry.name === 'configuration.json');
        if (configurationEntries.length != 1) {
            return null;
        }
        let configuration = null;
        try {
            configuration = new TextDecoder('utf-8').decode(configurationEntries[0].data);
        }
        catch (error) {
            return null;
        }
        if (configuration.indexOf('"vertices"') === -1 && configuration.indexOf('"confs"') === -1) {
            return null;
        }
        const coefficientsEntries = entries.filter((entry) => entry.name === 'coefficients.bin');
        if (coefficientsEntries.length > 1) {
            return null;
        }
        const coefficients = coefficientsEntries.length == 1 ? coefficientsEntries[0].data : [];
        return {
            configuration: configuration,
            coefficients: coefficients
        };
    }
};

dl4j.Model = class {

    constructor(metadata, configuration, coefficients) {
        this._graphs = [];
        this._graphs.push(new dl4j.Graph(metadata, configuration, coefficients));
    }

    get format() {
        return 'Deeplearning4j';
    }

    get graphs() {
        return this._graphs;
    }
};

dl4j.Graph = class {

    constructor(metadata, configuration, coefficients) {

        this._inputs = [];
        this._outputs =[];
        this._nodes = [];

        const reader = new dl4j.NDArrayReader(coefficients);
        const dataType = reader.dataType;

        if (configuration.networkInputs) {
            for (const input of configuration.networkInputs) {
                this._inputs.push(new dl4j.Parameter(input, true, [
                    new dl4j.Argument(input, null, null)
                ]));
            }
        }

        if (configuration.networkOutputs) {
            for (const output of configuration.networkOutputs) {
                this._outputs.push(new dl4j.Parameter(output, true, [
                    new dl4j.Argument(output, null, null)
                ]));
            }
        }

        let inputs = null;

        // Computation Graph
        if (configuration.vertices) {
            for (const name in configuration.vertices) {
                const vertex = dl4j.Node._object(configuration.vertices[name]);
                inputs = configuration.vertexInputs[name];
                let variables = [];
                let layer = null;

                switch (vertex.__type__) {
                    case 'LayerVertex':
                        layer = dl4j.Node._object(vertex.layerConf.layer);
                        variables = vertex.layerConf.variables;
                        break;
                    case 'MergeVertex':
                        layer = { __type__: 'Merge', layerName: name };
                        break;
                    case 'ElementWiseVertex':
                        layer = { __type__: 'ElementWise', layerName: name, op: vertex.op };
                        break;
                    case 'PreprocessorVertex':
                        layer = { __type__: 'Preprocessor', layerName: name };
                        break;
                    default:
                        throw new dl4j.Error("Unsupported vertex class '" + vertex['@class'] + "'.");
                }

                this._nodes.push(new dl4j.Node(metadata, layer, inputs, dataType, variables));
            }
        }

        // Multi Layer Network
        if (configuration.confs) {
            inputs = [ 'input' ];
            this._inputs.push(new dl4j.Parameter('input', true, [
                new dl4j.Argument('input', null, null)
            ]));
            for (const conf of configuration.confs) {
                const layer = dl4j.Node._object(conf.layer);
                this._nodes.push(new dl4j.Node(metadata, layer, inputs, dataType, conf.variables));
                inputs = [ layer.layerName ];
            }
            this._outputs.push(new dl4j.Parameter('output', true, [
                new dl4j.Argument(inputs[0], null, null)
            ]));
        }
    }

    get inputs() {
        return this._inputs;
    }

    get outputs() {
        return this._outputs;
    }

    get nodes() {
        return this._nodes;
    }
};

dl4j.Parameter = class {

    constructor(name, visible, args) {
        this._name = name;
        this._visible = visible;
        this._arguments = args;
    }

    get name() {
        return this._name;
    }

    get visible() {
        return this._visible;
    }

    get arguments() {
        return this._arguments;
    }
};

dl4j.Argument = class {

    constructor(name, type, initializer) {
        if (typeof name !== 'string') {
            throw new dl4j.Error("Invalid argument identifier '" + JSON.stringify(name) + "'.");
        }
        this._name = name;
        this._type = type;
        this._initializer = initializer;
    }

    get name() {
        return this._name;
    }

    get type() {
        if (this._initializer) {
            return this._initializer.type;
        }
        return this._type;
    }

    get initializer() {
        return this._initializer;
    }
};

dl4j.Node = class {

    constructor(metadata, layer, inputs, dataType, variables) {

        this._metadata = metadata;
        this._type = layer.__type__;
        this._name = layer.layerName || '';
        this._inputs = [];
        this._outputs = [];
        this._attributes = [];

        if (inputs && inputs.length > 0) {
            const args = inputs.map((input) => new dl4j.Argument(input, null, null));
            this._inputs.push(new dl4j.Parameter(args.length < 2 ? 'input' : 'inputs', true, args));
        }

        if (variables) {
            for (const variable of variables) {
                let tensor = null;
                switch (this._type) {
                    case 'Convolution':
                        switch (variable) {
                            case 'W':
                                tensor = new dl4j.Tensor(dataType, layer.kernelSize.concat([ layer.nin, layer.nout ]));
                                break;
                            case 'b':
                                tensor = new dl4j.Tensor(dataType, [ layer.nout ]);
                                break;
                            default:
                                throw new dl4j.Error("Unknown '" + this._type + "' variable '" + variable + "'.");
                        }
                        break;
                    case 'SeparableConvolution2D':
                        switch (variable) {
                            case 'W':
                                tensor = new dl4j.Tensor(dataType, layer.kernelSize.concat([ layer.nin, layer.nout ]));
                                break;
                            case 'pW':
                                tensor = new dl4j.Tensor(dataType, [ layer.nout ]);
                                break;
                            default:
                                throw new dl4j.Error("Unknown '" + this._type + "' variable '" + variable + "'.");
                        }
                        break;
                    case 'Output':
                    case 'Dense':
                        switch (variable) {
                            case 'W':
                                tensor = new dl4j.Tensor(dataType, [ layer.nout, layer.nin ]);
                                break;
                            case 'b':
                                tensor = new dl4j.Tensor(dataType, [ layer.nout ]);
                                break;
                            default:
                                throw new dl4j.Error("Unknown '" + this._type + "' variable '" + variable + "'.");
                        }
                        break;
                    case 'BatchNormalization':
                        tensor = new dl4j.Tensor(dataType, [ layer.nin ]);
                        break;
                    default:
                        throw new dl4j.Error("Unknown '" + this._type + "' variable '" + variable + "'.");
                }
                this._inputs.push(new dl4j.Parameter(variable, true, [
                    new dl4j.Argument(variable, null, tensor)
                ]));
            }
        }

        if (this._name) {
            this._outputs.push(new dl4j.Parameter('output', true, [
                new dl4j.Argument(this._name, null, null)
            ]));
        }

        let attributes = layer;

        if (layer.activationFn) {
            let activation = dl4j.Node._object(layer.activationFn);
            if (activation.__type__ !== 'ActivationIdentity' && activation.__type__ !== 'Identity') {
                if (activation.__type__.startsWith('Activation')) {
                    activation.__type__ = activation.__type__.substring('Activation'.length);
                }
                if (this._type == 'Activation') {
                    this._type = activation.__type__;
                    attributes = activation;
                }
                else {
                    this._chain = this._chain || [];
                    this._chain.push(new dl4j.Node(metadata, activation, [], null, null));
                }
            }
        }

        for (const key in attributes) {
            switch (key) {
                case '__type__':
                case 'constraints':
                case 'layerName':
                case 'activationFn':
                case 'idropout':
                case 'hasBias':
                    continue;
            }
            this._attributes.push(new dl4j.Attribute(metadata.attribute(this._type, key), key, attributes[key]));
        }

        if (layer.idropout) {
            const dropout = dl4j.Node._object(layer.idropout);
            if (dropout.p !== 1.0) {
                throw new dl4j.Error("Layer 'idropout' not implemented.");
            }
        }
    }

    get type() {
        return this._type;
    }

    get name() {
        return this._name;
    }

    get metadata() {
        return this._metadata.type(this._type);
    }

    get inputs() {
        return this._inputs;
    }

    get outputs() {
        return this._outputs;
    }

    get attributes() {
        return this._attributes;
    }

    get chain() {
        return this._chain;
    }

    static _object(value) {
        let result = {};
        if (value['@class']) {
            result = value;
            let type = value['@class'].split('.').pop();
            if (type.endsWith('Layer')) {
                type = type.substring(0, type.length - 5);
            }
            delete value['@class'];
            result.__type__ = type;
        }
        else {
            let key = Object.keys(value)[0];
            result = value[key];
            if (key.length > 0) {
                key = key[0].toUpperCase() + key.substring(1);
            }
            result.__type__ = key;
        }
        return result;
    }
};

dl4j.Attribute = class {

    constructor(schema, name, value) {
        this._name = name;
        this._value = value;
        this._visible = false;
        if (schema) {
            if (schema.visible) {
                this._visible = true;
            }
        }
    }

    get name() {
        return this._name;
    }

    get type() {
        return this._type;
    }

    get value() {
        return this._value;
    }

    get visible() {
        return this._visible;
    }
};
dl4j.Tensor = class {

    constructor(dataType, shape) {
        this._type = new dl4j.TensorType(dataType, new dl4j.TensorShape(shape));
    }

    get type() {
        return this._type;
    }

    get state() {
        return 'Not implemented.';
    }
};

dl4j.TensorType = class {

    constructor(dataType, shape) {
        this._dataType = dataType;
        this._shape = shape;
    }

    get dataType() {
        return this._dataType;
    }

    get shape() {
        return this._shape;
    }

    toString() {
        return (this.dataType || '?') + this._shape.toString();
    }
};

dl4j.TensorShape = class {

    constructor(dimensions) {
        this._dimensions = dimensions;
    }

    get dimensions() {
        return this._dimensions;
    }

    toString() {
        if (this._dimensions) {
            if (this._dimensions.length == 0) {
                return '';
            }
            return '[' + this._dimensions.map((dimension) => dimension.toString()).join(',') + ']';
        }
        return '';
    }
};

dl4j.Metadata = class {

    static open(host) {
        dl4j.Metadata.textDecoder = dl4j.Metadata.textDecoder || new TextDecoder('utf-8');
        if (dl4j.Metadata._metadata) {
            return Promise.resolve(dl4j.Metadata._metadata);
        }
        return host.request(null, 'dl4j-metadata.json', 'utf-8').then((data) => {
            dl4j.Metadata._metadata = new dl4j.Metadata(data);
            return dl4j.Metadata._metadata;
        }).catch(() => {
            dl4j.Metadata._metadata = new dl4j.Metadata(null);
            return dl4j.Metadata._metadata;
        });
    }

    constructor(data) {
        this._map = {};
        this._attributeCache = {};
        if (data) {
            if (data) {
                const items = JSON.parse(data);
                if (items) {
                    for (const item of items) {
                        item.schema.name = item.name;
                        this._map[item.name] = item.schema;
                    }
                }
            }
        }
    }

    type(name) {
        return this._map[name];
    }

    attribute(type, name) {
        let map = this._attributeCache[type];
        if (!map) {
            map = {};
            const schema = this.type(type);
            if (schema && schema.attributes && schema.attributes.length > 0) {
                for (const attribute of schema.attributes) {
                    map[attribute.name] = attribute;
                }
            }
            this._attributeCache[type] = map;
        }
        return map[name] || null;
    }
};

dl4j.NDArrayReader = class {

    constructor(buffer) {
        let reader = new dl4j.BinaryReader(buffer);
        /* let shape = */ dl4j.NDArrayReader._header(reader);
        let data = dl4j.NDArrayReader._header(reader);
        this._dataType = data.type;
    }

    get dataType() {
        return this._dataType;
    }

    static _header(reader) {
        let header = {};
        header.alloc = reader.string();
        header.length = 0;
        switch (header.alloc) {
            case 'DIRECT':
            case 'HEAP':
            case 'JAVACPP':
                header.length = reader.int32();
                break;
            case 'LONG_SHAPE':
            case 'MIXED_DATA_TYPES':
                header.length = reader.int64();
                break;
        }
        header.type = reader.string();
        switch (header.type) {
            case 'INT':
                header.type = 'int32';
                header.itemsize = 4;
                break;
            case 'FLOAT':
                header.type = 'float32';
                header.itemsize = 4;
                break;
        }
        header.data = reader.bytes(header.itemsize * header.length);
        return header;
    }
};

dl4j.BinaryReader = class {

    constructor(buffer) {
        this._buffer = buffer;
        this._position = 0;
    }

    bytes(size) {
        let data = this._buffer.subarray(this._position, this._position + size);
        this._position += size;
        return data;
    }

    string() {
        let size = this._buffer[this._position++] << 8 | this._buffer[this._position++];
        let buffer = this.bytes(size);
        return new TextDecoder('ascii').decode(buffer);
    }

    int32() {
        return this._buffer[this._position++] << 24 |
            this._buffer[this._position++] << 16 |
            this._buffer[this._position++] << 8 |
            this._buffer[this._position++];
    }

    int64() {
        let hi = this.int32();
        let lo = this.int32();
        return new long.Long(hi, lo, true).toNumber();
    }
};

dl4j.Error = class extends Error {
    constructor(message) {
        super(message);
        this.name = 'Error loading Deeplearning4j model.';
    }
};

if (typeof module !== 'undefined' && typeof module.exports === 'object') {
    module.exports.ModelFactory = dl4j.ModelFactory;
}