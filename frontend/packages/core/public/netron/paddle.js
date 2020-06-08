/* jshint esversion: 6 */
/* eslint "indent": [ "error", 4, { "SwitchCase": 1 } ] */

var paddle = paddle || {};
var protobuf = protobuf || require('protobufjs');
var base = base || require('./base');

paddle.ModelFactory = class {

    match(context) {
        const identifier = context.identifier;
        const extension = identifier.split('.').pop().toLowerCase();
        if (identifier == '__model__' || extension == 'paddle') {
            return true;
        }
        return false;
    }

    open(context, host) {
        return host.require('./paddle-proto').then(() => {
            let desc = null;
            const identifier = context.identifier;
            try {
                paddle.proto = protobuf.roots.paddle.paddle.framework.proto;
                desc = paddle.proto.ProgramDesc.decode(context.buffer);
            }
            catch (error) {
                throw new paddle.Error("File format is not paddle.ProgramDesc (" + error.message + ") in '" + identifier + "'.");
            }
            return paddle.Metadata.open(host).then((metadata) => {
                try {
                    return new paddle.Model(metadata, desc);
                }
                catch (error) {
                    host.exception(error, false);
                    throw new paddle.Error(error.message);
                }
            });
        });
    }
};

paddle.Model = class {

    constructor(metadata, desc) {
        this._graphs = [];
        for (const block of desc.blocks) {
            this._graphs.push(new paddle.Graph(metadata, block));
        }
    }

    get graphs() {
        return this._graphs;
    }

    get format() {
        return 'PaddlePaddle';
    }
};

paddle.Graph = class {

    constructor(metadata, block) {
        this._nodes = [];
        this._inputs = [];
        this._outputs = [];

        const initializers = {};
        const types = {};
        for (const variable of block.vars) {
            if (variable.persistable && variable.type &&
                variable.type.type != paddle.proto.VarType.Type.FETCH_LIST &&
                variable.type.type != paddle.proto.VarType.Type.FEED_MINIBATCH) {
                initializers[variable.name] = new paddle.Tensor(variable);
            }
            else {
                types[variable.name] = paddle.Graph._type(variable);
            }

        }

        const scope = {};
        for (let i = 0; i < block.ops.length; i++) {
            for (const input of block.ops[i].inputs) {
                input.arguments = input.arguments.map((argument) => scope[argument] ? scope[argument] : argument);
            }
            for (const output of block.ops[i].outputs) {
                output.arguments = output.arguments.map((argument) => {
                    if (scope[argument]) {
                        const next = argument + '\n' + i.toString(); // custom argument id
                        scope[argument] = next;
                        return next;
                    }
                    scope[argument] = argument;
                    return argument;
                });
            }
        }

        let lastNode = null;
        let lastOutput = null;
        for (const op of block.ops) {
            if (op.type == 'feed') {
                const inputName = op.attrs.filter((attr) => attr.name == 'col')[0].i.toString();
                this._inputs.push(new paddle.Parameter(inputName, op.outputs[0].arguments.map((id) => {
                    return new paddle.Argument(id, types[id], null, null);
                })));
            }
            else if (op.type == 'fetch') {
                const outputName = op.attrs.filter((attr) => attr.name == 'col')[0].i.toString();
                this._outputs.push(new paddle.Parameter(outputName, op.inputs[0].arguments.map((id) => {
                    return new paddle.Argument(id, types[id], null, null);
                })));
            }
            else {
                const node = new paddle.Node(metadata, op, initializers, types);
                if (op.inputs.length == 1 && op.inputs[0].arguments.length == 1 &&
                    op.outputs.length >= 1 && op.outputs[0].arguments.length == 1 &&
                    op.inputs[0].arguments[0].split('\n').shift() == op.outputs[0].arguments[0].split('\n').shift() &&
                    lastNode &&
                    lastOutput == op.inputs[0].arguments[0].split('\n').shift()) {
                    lastNode.chain.push(node);
                }
                else {
                    this._nodes.push(node);
                    lastNode = null;
                    lastOutput = null;
                    if (op.outputs.length == 1 && op.outputs[0].arguments.length == 1) {
                        lastNode = node;
                        lastOutput = op.outputs[0].arguments[0].split('\n').shift();
                    }
                }
            }
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

    static _type(variable) {
        switch (variable.type.type) {
            case paddle.proto.VarType.Type.LOD_TENSOR:
                if (variable.type.lod_tensor) {
                    return new paddle.TensorType(variable.type.lod_tensor.tensor);
                }
                break;
            default:
                break;
        }
        return null;
    }
};


paddle.Parameter = class {
    constructor(name, args) {
        this._name = name;
        this._arguments = args;
    }

    get name() {
        return this._name;
    }

    get visible() {
        return true;
    }

    get arguments() {
        return this._arguments;
    }
};

paddle.Argument = class {

    constructor(name, type, description, initializer) {
        if (typeof name !== 'string') {
            throw new paddle.Error("Invalid argument identifier '" + JSON.stringify(name) + "'.");
        }
        this._name = name;
        this._type = type || null;
        this._description = description || null;
        this._initializer = initializer || null;
    }

    get name() {
        return this._name;
    }

    get type() {
        if (this._type) {
            return this._type;
        }
        if (this._initializer) {
            return this._initializer.type;
        }
        return null;
    }

    get description() {
        return this._description;
    }

    get initializer() {
        return this._initializer;
    }
};

paddle.Node = class {

    constructor(metadata, op, initializers, types) {
        this._metadata = metadata;
        this._type = op.type;
        this._attributes = [];
        this._inputs = [];
        this._outputs = [];
        this._chain = [];
        for (const attr of op.attrs) {
            const schema = metadata.attribute(this._type, this._name);
            this._attributes.push(new paddle.Attribute(schema, attr));
        }
        for (const input of op.inputs) {
            if (input.arguments.length > 0) {
                const inputArguments = input.arguments.map((argument) => new paddle.Argument(argument, types[argument.split('\n').shift()], null, initializers[argument]));
                this._inputs.push(new paddle.Parameter(input.parameter, inputArguments));
            }
        }
        for (const output of op.outputs) {
            if (output.arguments.length > 0) {
                const outputArguments = output.arguments.map((argument) => new paddle.Argument(argument, types[argument.split('\n').shift()], null, null));
                this._outputs.push(new paddle.Parameter(output.parameter, outputArguments));
            }
        }
        this._update(this._inputs, 'X');
        this._update(this._inputs, 'Input');
        this._update(this._outputs, 'Y');
        this._update(this._outputs, 'Out');
    }

    get type() {
        return this._type;
    }

    get name() {
        return '';
    }

    get metadata() {
        return this._metadata.type(this._type);
    }

    get attributes() {
        return this._attributes;
    }

    get inputs() {
        return this._inputs;
    }

    get outputs() {
        return this._outputs;
    }

    get chain() {
        return this._chain;
    }

    _update(list, name) {
        let item = null;
        for (let i = 0; i < list.length; i++) {
            if (list[i].name == name) {
                item = list[i];
                list.splice(i, 1);
                break;
            }
        }
        if (item) {
            list.splice(0, 0, item);
        }
    }
};

paddle.Attribute = class {

    constructor(schema, attr) {
        this._name = attr.name;
        this._value = '?';
        switch (attr.type) {
            case paddle.proto.AttrType.STRING:
                this._type = 'string';
                this._value = attr.s;
                break;
            case paddle.proto.AttrType.STRINGS:
                this._type = 'string[]';
                this._value = attr.strings;
                break;
            case paddle.proto.AttrType.BOOLEAN:
                this._type = 'boolean';
                this._value = attr.b;
                break;
            case paddle.proto.AttrType.BOOLEANS:
                this._type = 'boolean[]';
                this._value = attr.bools;
                break;
            case paddle.proto.AttrType.FLOAT:
                this._type = 'float32';
                this._value = attr.f;
                break;
            case paddle.proto.AttrType.FLOATS:
                this._type = 'float[]';
                this._value = attr.floats;
                break;
            case paddle.proto.AttrType.INT:
                this._type = 'int32';
                this._value = attr.i;
                break;
            case paddle.proto.AttrType.INTS:
                this._type = 'int32[]';
                this._value = attr.ints;
                break;
            case paddle.proto.AttrType.LONG:
                this._type = 'int64';
                break;
            case paddle.proto.AttrType.LONGS:
                this._type = 'int64[]';
                break;
            default:
                break;
        }
        switch (this._name) {
            case 'use_mkldnn':
            case 'use_cudnn':
            case 'op_callstack':
            case 'op_role':
            case 'op_role_var':
            case 'op_namescope':
            case 'is_test':
                this._visible = false;
                break;
        }
        if (schema) {
            if (Object.prototype.hasOwnProperty.call(schema, 'default')) {
                const defaultValue = schema.default;
                const value = this._value;
                if (defaultValue == value) {
                    this._visible = false;
                }
                else if (Array.isArray(value) && Array.isArray(defaultValue) && value.length == defaultValue.length) {
                    if (value.every((item, index) => { return item == defaultValue[index]; })) {
                        this._visible = false;
                    }
                }

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
        return this._visible == false ? false : true;
    }
};

paddle.Tensor = class {

    constructor(variable) {
        this._type = paddle.Graph._type(variable);
    }

    get type() {
        return this._type;
    }

    get state() {
        return 'Tensor data not implemented.';
    }

    get value() {
        return null;
    }

    toString() {
        return '';
    }
};

paddle.TensorType = class {

    constructor(desc) {
        switch (desc.data_type) {
            case paddle.proto.VarType.Type.INT32:
                this._dataType = 'int32';
                break;
            case paddle.proto.VarType.Type.INT64:
                this._dataType = 'int64';
                break;
            case paddle.proto.VarType.Type.FP32:
                this._dataType = 'float32';
                break;
            case paddle.proto.VarType.Type.FP64:
                this._dataType = 'float64';
                break;
            default:
                this._dataType = '?';
                break;
        }
        this._shape = new paddle.TensorShape(desc.dims);
    }

    get dataType() {
        return this._dataType;
    }

    get shape() {
        return this._shape;
    }

    get denotation() {
        return this._denotation;
    }

    toString() {
        return this.dataType + this._shape.toString();
    }
};

paddle.TensorShape = class {

    constructor(dimensions) {
        this._dimensions = dimensions.map((dimension) => {
            return dimension != -1 ? dimension : '?';
        });
    }

    get dimensions() {
        return this._dimensions;
    }

    toString() {
        return (this._dimensions && this._dimensions.length) ? ('[' + this._dimensions.join(',') + ']') : '';
    }
};

paddle.Metadata = class {

    static open(host) {
        if (paddle.Metadata._metadata) {
            return Promise.resolve(paddle.Metadata._metadata);
        }
        return host.request(null, 'paddle-metadata.json', 'utf-8').then((data) => {
            paddle.Metadata._metadata = new paddle.Metadata(data);
            return paddle.Metadata._metadata;
        }).catch(() => {
            paddle.Metadata._metadata = new paddle.Metadata(null);
            return paddle.Metadata._metadata;
        });
    }

    constructor(data) {
        this._map = {};
        this._attributeCache = {};
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

    type(name) {
        return this._map[name] || null;
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

paddle.Error = class extends Error {
    constructor(message) {
        super(message);
        this.name = 'Error loading PaddlePaddle model.';
    }
};

if (typeof module !== 'undefined' && typeof module.exports === 'object') {
    module.exports.ModelFactory = paddle.ModelFactory;
}
