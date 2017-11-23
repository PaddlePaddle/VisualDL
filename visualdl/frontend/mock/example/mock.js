/**
 * frontend mock data
 *
 * @param {string} path request path
 * @param {Object} queryParam params
 * @param {Object} postParam post post params
 * @return {Object}
 */
module.exports = function (path, queryParam, postParam) {
    return {
        // delay
        _timeout: 0,

        // http code status
        _status: 200,

        // response data
        _data: {
            // 0 for sucsuss, others for error
            status: 0,
            // error msg
            msg: '',
            data: ''
        }
    };
};
