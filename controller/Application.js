
const config = require("../config/config");

/**
 * Application class
 */
class Application {
    constructor() {
        this.config = config;
    }

    /**
     * 
     * @param {*} data 
     * @param {Number} code - Error code 4xx or 5xx need to be passed
     * @returns {Object}
     */
    error(data, code) {
        code = code || this.config.HTTP_STATUS_CODE.BAD_REQUEST;
        
        let body = (typeof data == 'object') ? JSON.stringify(data) : JSON.stringify({error:data});        
        const response = {
            statusCode: code,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                'Content-Type': 'application/json'
            },
            body: body,
        };
        return response;
    }

    /**
     * 
     * @param {*} data 
     * @param {Number} code - Error code 2xx need to be passed
     * @returns {Object}
     */
    response(data, code) {
        code = code || this.config.HTTP_STATUS_CODE.OK;
        let body = (typeof data == 'object') ? JSON.stringify(data) : data;
        const response = {
            statusCode: code,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                'Content-Type': 'application/json'
            },
            body: body,
        };
        return response;
    }
}

module.exports = Application;