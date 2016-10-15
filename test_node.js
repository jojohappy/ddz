var request = require('request');
var utils = require('./lib/utils');
var Capi = require('qcloudapi-sdk');

// var secretId = 'AKIDiWhZxE3Tb5eWTkCiYM52tvgbLF37pxwv';
// var secretKey = 'I3LjIe4729TrJI0mBMkSQ6nRCptz6fnr';

var secretId = 'AKIDfGlLj3rIIJJuOt8pXTKF3hjbIKKIqpJf';
var secretKey = 'Qgt28A94soikmnlcP9nYCoW5Xt5HPQMI';

var capi = new Capi({
    SecretId: secretId,
    SecretKey: secretKey,
    serviceType: 'wenzhi'
});

capi.request({
    Region: 'gz',
    Action: 'LexicalAnalysis',
    code: 2097152,
    text: '开设淘宝',
    type: 1
}, function(error, data) {
    console.log(data);
});
