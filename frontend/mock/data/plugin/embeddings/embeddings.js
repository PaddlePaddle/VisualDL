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
                "embedding": [
                    [10.0, 8.04, "yellow"],
                    [8.0, 6.95, "blue"],
                    [13.0, 7.58, "red"],
                    [9.0, 8.81, "king"],
                    [11.0, 8.33, "queen"],
                    [14.0, 9.96, "man"],
                    [6.0, 7.24, "women"],
                    [4.0, 4.26, "kid"],
                    [12.0, 10.84, "adult"],
                    [7.0, 4.82, "light"],
                    [5.0, 5.68, "dark"]
                ]
            }
        }
    };
};
