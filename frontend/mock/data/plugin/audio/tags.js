/**
 * get mock data
 *
 * @param {string} path request path
 * @param {Object} queryParam query params
 * @param {Object} postParam post params
 * @return {Object}
 */
 module.exports = function (path, queryParam, postParam) {
    return {
        // moock delay
        _timeout: 0,
        // mock http status
        _status: 200,
        // mock response data
        _data: {
            status: 0,
            msg: 'SUCCESS',
            data: {
                "test": {
                    "input_reshape/input/audio/7": {
                        "displayName": "input_reshape/input/audio/7",
                        "description": "", "samples": 1
                    },
                    "input_reshape/input/audio/4": {
                        "displayName": "input_reshape/input/audio/4",
                        "description": "",
                        "samples": 1
                    },
                    "input_reshape/input/audio/5": {
                        "displayName": "input_reshape/input/audio/5",
                        "description": "", "samples": 1
                    }, "input_reshape/input/audio/2": {"displayName": "input_reshape/input/audio/2", "description": "", "samples": 1}, "input_reshape/input/audio/3": {"displayName": "input_reshape/input/audio/3", "description": "", "samples": 1}, "input_reshape/input/audio/0": {"displayName": "input_reshape/input/audio/0", "description": "", "samples": 1}, "input_reshape/input/audio/1": {"displayName": "input_reshape/input/audio/1", "description": "", "samples": 1}, "input_reshape/input/audio/8": {"displayName": "input_reshape/input/audio/8", "description": "", "samples": 1}, "input_reshape/input/audio/9": {"displayName": "input_reshape/input/audio/9", "description": "", "samples": 1}}, "train": {"input_reshape/input/audio/6": {"displayName": "input_reshape/input/audio/6", "description": "", "samples": 1}, "input_reshape/input/audio/7": {"displayName": "input_reshape/input/audio/7", "description": "", "samples": 1}, "input_reshape/input/audio/4": {"displayName": "input_reshape/input/audio/4", "description": "", "samples": 1}, "input_reshape/input/audio/5": {"displayName": "input_reshape/input/audio/5", "description": "", "samples": 1}, "input_reshape/input/audio/2": {"displayName": "input_reshape/input/audio/2", "description": "", "samples": 1}, "input_reshape/input/audio/3": {"displayName": "input_reshape/input/audio/3", "description": "", "samples": 1}, "input_reshape/input/audio/0": {"displayName": "input_reshape/input/audio/0", "description": "", "samples": 1}, "input_reshape/input/audio/1": {"displayName": "input_reshape/input/audio/1", "description": "", "samples": 1}, "input_reshape/input/audio/8": {"displayName": "input_reshape/input/audio/8", "description": "", "samples": 1}, "input_reshape/input/audio/9": {"displayName": "input_reshape/input/audio/9", "description": "", "samples": 1}}}
        }
    };
};
