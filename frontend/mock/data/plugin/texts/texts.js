/**
 * get mock data
 *
 * @param {string} path request path
 * @param {Object} queryParam query params
 * @param {Object} postParam post params
 * @return {Object}
 */
module.exports = function (path, queryParam, postParam) {
    if (queryParam.run === 'train') {
        return {
            // moock delay
            _timeout: 0,
            // mock http status
            _status: 200,
            // mock response data
            _data: {
                status: 0,
                msg: 'SUCCESS',
                data: [[1511842145.705075, 1, "Hello 1"], [1511842145.7388, 2, "Hello 2"], [1511842145.774563, 3, "Hello 3"], [1511842145.806828, 4, "Hello 4"], [1511842145.838082, 5, "Hello 5"], [1511842145.868955, 6, "Hello 6"], [1511842145.899323, 7, "Hello 7"], [1511842145.930518, 8, "Hello 8"], [1511842145.96089, 9, "Hello 7"], [1511842146.460557, 11, "Hello 11"], [1511842146.4952, 12, "Hello 12"], [1511842146.525936, 13, "Hello 13"], [1511842146.556059, 14, "Hello 14"], [1511842146.648703, 15, "Hello 15"], [1511842146.683295, 16, "Hello 16"], [1511842146.719782, 17, "Hello 17"], [1511842146.752392, 18, "Hello 18"]]
            }
        }
    }
    else {
        return {
            // moock delay
            _timeout: 0,
            // mock http status
            _status: 200,
            // mock response data
            _data: {
                status: 0,
                msg: 'SUCCESS',
                data: [[1511842145.514333, 0, "Hello 0"], [1511842146.427384, 10, "Hello 10"], [1511842147.260405, 20, "Hello 20"], [1511842148.019018, 30, "Hello 30 "], [1511842148.793569, 40, "Hello 40 "], [1511842149.610228, 50, "Hello 50 "], [1511842150.437095, 60, "Hello 60"], [1511842151.254679, 70, "Hello 70"], [1511842152.039353, 80, "Hello 80"], [1511842152.800043, 90, "Hello 90"]]
            }
        }
    }
};
