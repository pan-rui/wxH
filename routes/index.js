var express = require('express');
var router = express.Router();
var wechat = require('wechat');
var WechatAPI = require('wechat-api');
var wxConfig = require('../config/wxConfig');
var wxAuth = require('../config/wechatAuth');

var api = new WechatAPI(appid, appsecret);

/* GET home page. */
router.get('/verify', function(req, res, next) {
    wxAuth(req, res);
});


module.exports = router;
