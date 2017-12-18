var express = require('express');
var router = express.Router();
var wechat = require('wechat');
var WechatAPI = require('wechat-api');
var wxConfig = require('wxConfig');
var tes = require('../services/BankZH');
const firstIn = {video: 'cvmBAMM_C1js-uiw3FKfAgUjA25AJ_9QvCmtlr9mdODm9s234Xs6WcB8Tq-lusgT'}
var api = new WechatAPI(wxConfig.appid, wxConfig.appSecret);
router.get('/', function (req, res, next) {
    tes.tes();
    res.send('hello haha!');
});
/* GET home page. */
router.get('/msg', function (req, res, next) {
    wxConfig.wxVerify(req, res, wxConfig.token);
});
router.post('/msg', wechat(wxConfig, function (req, res, next) {
    // 微信输入信息都在req.weixin上
    var message = req.weixin;
    /*    if (message.FromUserName === 'diaosi') {
            // 回复屌丝(普通回复)
            res.reply('hehe');
        } else if (message.FromUserName === 'text') {
            //你也可以这样回复text类型的信息
            res.reply({
                content: 'text object',
                type: 'text'
            });
        } else if (message.FromUserName === 'hehe') {
            // 回复一段音乐
            res.reply({
                type: "music",
                content: {
                    title: "来段音乐吧",
                    description: "一无所有",
                    musicUrl: "http://mp3.com/xx.mp3",
                    hqMusicUrl: "http://mp3.com/xx.mp3",
                    thumbMediaId: "thisThumbMediaId"
                }
            });
        }else */
    if (message.MsgType == 'event') {
        if (message.Event === 'subscribe') {
            console.log(JSON.stringify(message));
            res.reply({
                content: {
                    title: '美元绝招，剑指2019，谁鹿将死谁手？',
                    mediaId: firstIn.video
                },
                type: 'video'
            })
        } else if (message.Event === 'unsubscribe') {
            console.log(message.FromUserName + '===================取消了关注');
        } else {
            res.reply({
                content: '你在干嘛呢!',
                type: 'text'
            });
            // 回复高富帅(图文回复)
            /*            res.reply([
                            {
                                title: '你来我家接我吧',
                                description: '这是女神与高富帅之间的对话',
                                picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
                                url: 'http://nodeapi.cloudfoundry.com/'
                            }
                        ]);*/
        }
    } else {
        let strArry = message.Content.split(':');
        if (strArry.length > 1) {
            if (strArry[0] == '歌'){

            }
        }else{
            tes.getResult('http://baike.baidu.com/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key='+strArry[0]+'&bk_length=600',(data)=>{
                let result = JSON.parse(data.body);
                res.reply([
                    {
                        title: result.tite,
                        description:result.abstract,
                        picurl:result.image,
                        url:result.url
                    }
                ])
            });
        }
    }
}))

router.get('/eur', function (req, res, next) {
    res.render('login', {data: {a: 'aa', b: 'bb'}}, (err, result) => {
        console.log(JSON.stringify(err) + '\n' + JSON.stringify(result));
    });
});

module.exports = router;
