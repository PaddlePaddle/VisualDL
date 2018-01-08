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
                    "layer2/biases/summaries/mean": {
                        "displayName": "layer2/biases/summaries/mean",
                        "description": ""
                    },
                    "layer1/weights/summaries/min": {
                        "displayName": "layer1/weights/summaries/min",
                        "description": ""
                    },
                    "layer2/biases/summaries/stddev_1": {
                        "displayName": "layer2/biases/summaries/stddev_1",
                        "description": ""
                    },
                    "layer1/biases/summaries/mean": {
                        "displayName": "layer1/biases/summaries/mean",
                        "description": ""
                    },
                    "layer1/weights/summaries/mean": {
                        "displayName": "layer1/weights/summaries/mean",
                        "description": ""
                    },
                    "dropout/dropout_keep_probability": {
                        "displayName": "dropout/dropout_keep_probability",
                        "description": ""
                    },
                    "layer1/weights/summaries/max": {
                        "displayName": "layer1/weights/summaries/max",
                        "description": ""
                    }, "layer2/weights/summaries/mean": {
                        "displayName": "layer2/weights/summaries/mean",
                        "description": ""
                    }, "layer2/weights/summaries/stddev_1": {
                        "displayName": "layer2/weights/summaries/stddev_1",
                        "description": ""
                    },
                    "layer2/weights/summaries/min": {
                        "displayName": "layer2/weights/summaries/min",
                        "description": ""
                    },
                    "layer1/biases/summaries/max": {
                        "displayName": "layer1/biases/summaries/max",
                        "description": ""
                    },
                    "layer2/weights/summaries/max": {
                        "displayName": "layer2/weights/summaries/max",
                        "description": ""
                    },
                    "accuracy_1": {
                        "displayName": "accuracy_1",
                        "description": ""
                    },
                    "layer2/biases/summaries/min": {
                        "displayName": "layer2/biases/summaries/min",
                        "description": ""
                    },
                    "cross_entropy_1": {
                        "displayName": "cross_entropy_1",
                        "description": ""
                    },
                    "layer2/biases/summaries/max": {
                        "displayName": "layer2/biases/summaries/max",
                        "description": ""
                    },
                    "layer1/weights/summaries/stddev_1": {
                        "displayName": "layer1/weights/summaries/stddev_1",
                        "description": ""
                    },
                    "layer1/biases/summaries/stddev_1": {
                        "displayName": "layer1/biases/summaries/stddev_1",
                        "description": ""
                    },
                    "layer1/biases/summaries/min": {
                        "displayName": "layer1/biases/summaries/min",
                        "description": ""
                    }
                },
                "train": {
                    "layer2/biases/summaries/mean": {
                        "displayName": "layer2/biases/summaries/mean",
                        "description": ""
                    },
                    "layer1/weights/summaries/min": {
                        "displayName": "layer1/weights/summaries/min",
                        "description": ""
                    },
                    "layer2/biases/summaries/stddev_1": {
                        "displayName": "layer2/biases/summaries/stddev_1",
                        "description": ""
                    },
                    "layer1/biases/summaries/mean": {
                        "displayName": "layer1/biases/summaries/mean",
                        "description": ""
                    },
                    "layer1/weights/summaries/mean": {
                        "displayName": "layer1/weights/summaries/mean",
                        "description": ""
                    },
                    "dropout/dropout_keep_probability": {
                        "displayName": "dropout/dropout_keep_probability",
                        "description": ""
                    },
                    "layer1/weights/summaries/max": {
                        "displayName": "layer1/weights/summaries/max",
                        "description": ""
                    },
                    "layer2/weights/summaries/mean": {
                        "displayName": "layer2/weights/summaries/mean",
                        "description": ""
                    },
                    "layer2/weights/summaries/stddev_1": {
                        "displayName": "layer2/weights/summaries/stddev_1",
                        "description": ""
                    },
                    "layer2/weights/summaries/min": {
                        "displayName": "layer2/weights/summaries/min",
                        "description": ""
                    },
                    "layer1/biases/summaries/max": {
                        "displayName": "layer1/biases/summaries/max",
                        "description": ""
                    },
                    "layer2/weights/summaries/max": {
                        "displayName": "layer2/weights/summaries/max",
                        "description": ""
                    },
                    "accuracy_1": {
                        "displayName": "accuracy_1",
                        "description": ""
                    },
                    "layer2/biases/summaries/min": {
                        "displayName": "layer2/biases/summaries/min",
                        "description": ""
                    },
                    "cross_entropy_1": {
                        "displayName": "cross_entropy_1",
                        "description": ""
                    },
                    "layer2/biases/summaries/max": {
                        "displayName": "layer2/biases/summaries/max",
                        "description": ""
                    },
                    "layer1/weights/summaries/stddev_1": {
                        "displayName": "layer1/weights/summaries/stddev_1",
                        "description": ""
                    },
                    "layer1/biases/summaries/stddev_1": {
                        "displayName": "layer1/biases/summaries/stddev_1",
                        "description": ""
                    }
                }
            }
        }
    };
};
