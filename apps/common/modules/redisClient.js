"use strict";
const redis = require('redis');
const conf = require('config');
let port = conf.get('redis_port');
let host = conf.get('redis_host');
let options = {
    password: conf.get('redis_key'),
    return_buffers: true
};
if (port === 6380) {
    options['tls'] = { servername: host };
}
let client = redis.createClient(port, host, options);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = client;
