/**
 * get mock data
 *
 * @param {string} path request path
 * @param {Object} queryParam query params
 * @param {Object} postParam post params
 * @return {Object}
 */
module.exports = function(path, queryParam, postParam) {
    if (queryParam.dimension === '3') {
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
                    "embedding": [
                        [10.0, 8.04, 3],
                        [8.0, 6.95, 4],
                        [13.0, 7.58, 1],
                        [9.0, 8.81, 3],
                        [11.0, 8.33, 5],
                        [14.0, 9.96, 6],
                        [6.0, 7.24, 1],
                        [4.0, 4.26, 2],
                        [12.0, 10.84, 6],
                        [7.0, 4.8, 3],
                        [5.0, 5.68, 3]
                    ],
                    "labels": [
                        "yellow",
                        "blue",
                        "red",
                        "king",
                        "queen",
                        "man",
                        "women",
                        "kid",
                        "adult",
                        "light",
                        "dark"
                    ]
                }
            }
        };
    } else {
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
                    "embedding": [
                        [10.0, 8.04],
                        [8.0, 6.95],
                        [13.0, 7.58],
                        [9.0, 8.81],
                        [11.0, 8.33],
                        [14.0, 9.96],
                        [6.0, 7.24],
                        [4.0, 4.26],
                        [12.0, 10.84],
                        [7.0, 4.8],
                        [5.0, 5.68]
                    ],
                    "labels": [
                        "yellow",
                        "blue",
                        "red",
                        "king",
                        "queen",
                        "man",
                        "women",
                        "kid",
                        "adult",
                        "light",
                        "dark"
                    ]
                }
            }
        };
    }
};
