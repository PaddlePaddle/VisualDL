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
            data: [
                {
                    "wall_time": 1512549785.061623,
                    "step": 60,
                    "query": "sample=0&index=0&tag=input_reshape%2Finput%2Fimage%2F0&run=test",
                    "width": 28,
                    "height": 28
                },
                {"wall_time": 1512886109.672786, "step": 60, "query": "sample=0&index=1&tag=input_reshape%2Finput%2Fimage%2F0&run=test", "width": 28, "height": 28},
                {"wall_time": 1512886124.266915, "step": 210, "query": "sample=0&index=2&tag=input_reshape%2Finput%2Fimage%2F0&run=test", "width": 28, "height": 28},
                {"wall_time": 1512886138.898628, "step": 330, "query": "sample=0&index=3&tag=input_reshape%2Finput%2Fimage%2F0&run=test", "width": 28, "height": 28},
                {"wall_time": 1512886139.883663, "step": 340, "query": "sample=0&index=4&tag=input_reshape%2Finput%2Fimage%2F0&run=test", "width": 28, "height": 28},
                {"wall_time": 1512886147.195567, "step": 410, "query": "sample=0&index=5&tag=input_reshape%2Finput%2Fimage%2F0&run=test", "width": 28, "height": 28},
                {"wall_time": 1512886156.47856, "step": 500, "query": "sample=0&index=6&tag=input_reshape%2Finput%2Fimage%2F0&run=test", "width": 28, "height": 28},
                {"wall_time": 1512886187.82793, "step": 810, "query": "sample=0&index=7&tag=input_reshape%2Finput%2Fimage%2F0&run=test", "width": 28, "height": 28},
                {"wall_time": 1512886200.386198, "step": 950, "query": "sample=0&index=8&tag=input_reshape%2Finput%2Fimage%2F0&run=test", "width": 28, "height": 28},
                {"wall_time": 1512886204.224405, "step": 990, "query": "sample=0&index=9&tag=input_reshape%2Finput%2Fimage%2F0&run=test", "width": 28, "height": 28}
            ]
        }
    };
};


