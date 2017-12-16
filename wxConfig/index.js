module.exports = {
    token: 'banking',
    encodingAESKey: 'cCo0AZHxlAzr3W6zvIfcjYmxBkpQdITVIFThylD3C78',
    appid: 'wx9b59487f2d9c540a',
    appSecret: '6557cd57c50981b4e2a501fdbde54c25',
    checkSignature:false,
    wxVerify: require('./lib/wechatAuth')
};