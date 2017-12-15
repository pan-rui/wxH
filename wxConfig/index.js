module.exports = {
    token: 'banking',
    encodingAESKey: 'uncCxIsGt3Z03U5KgPz8BjsMR7xgWbIceMb5qyPUgvM',
    appid: 'wxf498cf460cef273f',
    appSecret: '799b631deb9d0df90ce0f342473c064e',
    checkSignature:false,
    wxVerify: require('./lib/wechatAuth')
};