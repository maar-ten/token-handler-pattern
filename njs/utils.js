// nginx does not have full ES6 support (i.e. object destructuring)
// supported javascript features: http://nginx.org/en/docs/njs/compatibility.html

const REDIS_KEY = 'redis_key';

// create a random 128bit hexadecimal string
function randomString() {
  const array = new Uint32Array(4);
  crypto.getRandomValues(array);

  return array.reduce((acc, cur) => acc += cur.toString(16), '')
}

function hasToken(request) {
  if (request.headersIn.Authorization) {
    request.return(200);
    return;
  }

  request.return(401);
}

function parseToken(request) {
  // remove 'BEARER ' from authorization header
  return request.headersIn.Authorization.slice(7);
}

// cookie header form is: "redis-key=abc; HttpOnly; Secure"
// cookies are separated by semi-colons
// cookie key and value are separated by equal sign
// spaces are allowed around keys, values and separators
function getRedisCookieValue(request) {
  const redisCookie = request.headersIn['Cookie'].split(';')
    .map(cookie => cookie.trim().split('='))
    .find(cookieArray => cookieArray[0].trim().toLowerCase() === REDIS_KEY); // returns [key,value] || undefined
  return redisCookie ? redisCookie[1].trim() : undefined;
}

export default {REDIS_KEY, randomString, hasToken, parseToken, getRedisCookieValue}

