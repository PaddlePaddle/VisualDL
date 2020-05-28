import {Model} from './types';

type Extension = {
    extension: string;
    id: string;
};

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
                        if (buffer && buffer.length > 2 && buffer[0] == 0x50 && buffer[1] == 0x4B) {
                            entries = new zip.Archive(buffer).entries;
                        }
                        break;
                    }
                    case 'tar': {
                        if (buffer.length >= 512) {
                            let sum = 0;
                            for (let i = 0; i < 512; i++) {
                                sum += (i >= 148 && i < 156) ? 32 : buffer[i];
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
            }
            catch (error) {
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
                        if (!signature && b.subarray(0, Math.min(1024, length)).some((c) => c < 7 || (c > 14 && c < 32))) {
                            break;
                        }
                        const reader = prototxt.TextReader.create(this.text);
                        reader.start(false);
                        while (!reader.end(false)) {
                            const tag = reader.tag();
                            tags.set(tag, true);
                            reader.skip();
                        }
                        break;
                    }
                    case 'pb': {
                        const reader = new protobuf.Reader.create(this.buffer);
                        while (reader.pos < reader.len) {
                            const tagType = reader.uint32();
                            tags.set(tagType >>> 3, tagType & 7);
                            try {
                                reader.skipType(tagType & 7);
                            }
                            catch (err) {
                                tags = new Map();
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            catch (error) {
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
    constructor(message: string) {
        super(message);
        this.name = 'Error loading archive.';
    }
}

class ModelError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Error loading model.';
    }
}

export default class ModelFactoryService {
    _extensions: Extension[] = [];

    constructor() {
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
        this.register('./sklearn', ['.pkl', '.joblib', '.model', '.meta', '.pb']);
        this.register('./cntk', ['.model', '.cntk', '.cmf', '.dnn']);
        this.register('./paddle', ['.paddle', '__model__']);
        this.register('./armnn', ['.armnn']);
        this.register('./bigdl', ['.model', '.bigdl']);
        this.register('./darknet', ['.cfg', '.model']);
        this.register('./mnn', ['.mnn']);
        this.register('./ncnn', ['.param', '.bin', '.cfg.ncnn', '.weights.ncnn']);
        this.register('./tengine', ['.tmfile']);
        this.register('./barracuda', ['.nn']);
        this.register('./openvino', ['.xml', '.bin']);
        this.register('./flux', ['.bson']);
        this.register('./chainer', ['.npz', '.h5', '.hd5', '.hdf5']);
        this.register('./dl4j', ['.zip']);
        this.register('./mlnet', ['.zip']);
    }

    register(id: string, extensions: string[]) {
        for (const extension of extensions) {
            this._extensions.push({extension: extension, id: id});
        }
    }

    async open(context) {
        const signatureContext = await this._openSignature(context);
        const archiveContext = await this._openArchive(signatureContext);
        const modelContext = new ModelContext(archiveContext);
        const identifier = context.identifier;
        const extension = identifier.split('.').pop().toLowerCase();
        const modules = this._filter(context);
        if (modules.length == 0) {
            throw new ModelError("Unsupported file extension '." + extension + "'.");
        }
        const errors: Error[] = [];
        let match = false;
        const nextModule = async (): Promise<Model> => {
            if (modules.length > 0) {
                const id = modules.shift();
                const module = await import(`netron/src/${id}`);
                if (!module.ModelFactory) {
                    throw new ModelError("Failed to load module '" + id + "'.");
                }
                const modelFactory = new module.ModelFactory();
                if (!modelFactory.match(modelContext)) {
                    return await nextModule();
                }
                match = true;
                try {
                    const model = await modelFactory.open(modelContext);
                    return model;
                } catch (error) {
                    errors.push(error);
                    return await nextModule();
                }
            } else {
                if (match) {
                    if (errors.length == 1) {
                        throw errors[0];
                    }
                    throw new ModelError(errors.map(err => err.message).join('\n'));
                }
                const buffer = context.buffer;
                const content = Array.from<number>(buffer.subarray(0, Math.min(16, buffer.length)))
                    .map(c => (c < 16 ? '0' : '') + c.toString(16))
                    .join('');
                throw new ModelError(`Unsupported file content (${content}) for extension '.${extension}' in '${identifier}'.`);
            }
        };
        return nextModule();
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
            let folders = {};
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
            let entries = archive.entries.slice();
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
        const list = this._extensions.filter(entry => identifier.endsWith(entry.extension)).map(extry => extry.id);
        return Array.from(new Set(list));
    }

    _openSignature(context) {
        const buffer = context.buffer;
        if (context.buffer.length === 0) {
            return Promise.reject(new ModelError('File has no content.', true));
        }
        const list = [
            {name: 'ELF executable', value: '\x7FELF'},
            {name: 'Git LFS header', value: 'version https://git-lfs.github.com/spec/v1\n'},
            {name: 'Git LFS header', value: 'oid sha256:'},
            {name: 'HTML markup', value: '<html>'},
            {name: 'HTML markup', value: '<!DOCTYPE html>'},
            {name: 'HTML markup', value: '<!DOCTYPE HTML>'},
            {name: 'HTML markup', value: '\n\n\n\n\n<!DOCTYPE html>'},
            {name: 'HTML markup', value: '\n\n\n\n\n\n<!DOCTYPE html>'},
            {name: 'Unity metadata', value: 'fileFormatVersion:'},
            {name: 'Vulkan SwiftShader ICD manifest', value: '{"file_format_version": "1.0.0", "ICD":'},
            {name: 'StringIntLabelMapProto data', value: 'item {\r\n  id:'},
            {name: 'StringIntLabelMapProto data', value: 'item {\r\n  name:'},
            {name: 'StringIntLabelMapProto data', value: 'item {\n  id:'},
            {name: 'StringIntLabelMapProto data', value: 'item {\n  name:'},
            {name: 'Python source code', value: 'import sys, types, os;'}
        ];
        for (const item of list) {
            if (
                buffer.length >= item.value.length &&
                buffer.subarray(0, item.value.length).every((v, i) => v === item.value.charCodeAt(i))
            ) {
                return Promise.reject(new ModelError('Invalid file content. File contains ' + item.name + '.', true));
            }
        }
        return Promise.resolve(context);
    }
}
