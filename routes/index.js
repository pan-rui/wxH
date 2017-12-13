var express = require('express');
var router = express.Router();
var wechat = require('wechat');
var WechatAPI = require('wechat-api');
var wxConfig = require('wxConfig');

var api = new WechatAPI(wxConfig.appId, wxConfig.appSecret);

/* GET home page. */
router.get('/verify', function(req, res, next) {
    wxConfig.wxVerify(req, res,wxConfig.token);
});


module.exports = router;
