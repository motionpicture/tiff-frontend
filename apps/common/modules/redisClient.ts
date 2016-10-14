import redis = require('redis');
import conf = require('config');

let port = conf.get<number>('redis_port')
let host = conf.get<string>('redis_host')
let options = {
    password: conf.get<string>('redis_key'),
    return_buffers: true
};
if (port === 6380) {
    options['tls'] = {servername: host};
}

let client = redis.createClient(port, host, options);

export default client;
