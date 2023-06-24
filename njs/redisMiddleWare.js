// nginx does not have full ES6 support (i.e. object destructuring)
// supported javascript features: http://nginx.org/en/docs/njs/compatibility.html

import utils from "./utils.js";

// retrieve the bearer token from redis
function getToken(request) {
    const key = utils.getRedisCookieValue(request);

    // retrieve token from redis
    request.subrequest('/retrieve', `key=${key}`)
        .then(response => {
            request.return(response.status, response.responseBody)
        })
        .catch(error => {
            request.return(403, error.message)
        });
}

// store the bearer token in redis
function setToken(request) {
    // remove 'BEARER ' from authorization header
    const token = request.headersIn.Authorization.slice(7);
    const key = utils.randomString();

    // store token in redis and return a cookie
    request.subrequest('/store', `key=${key}&value=${token}`)
        .then(response => {
            request.headersOut['Set-Cookie'] = `${utils.REDIS_KEY}=${key}; HttpOnly`;
            request.return(response.status, response.responseBody)
        })
        .catch(error => {
            request.return(403, error.message)
        });
}

export default {setToken, getToken};