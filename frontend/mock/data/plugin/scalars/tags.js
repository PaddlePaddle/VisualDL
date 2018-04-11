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
                    }
                },
                "train": {
                    "layer2/biases/summaries/mean": {
                        "displayName": "layer2/biases/summaries/mean",
                        "description": ""
                    },
                    "layer2/biases/summaries/accuracy": {
                        "displayName": "layer2/biases/summaries/accuracy",
                        "description": ""
                    },
                    "layer2/biases/summaries/cost": {
                        "displayName": "layer2/biases/summaries/cost",
                        "description": ""
                    }
                }
            }
        }
    };
};
