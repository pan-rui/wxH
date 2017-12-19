var express = require('express');
var router = express.Router();
var wechat = require('wechat');
var WechatAPI = require('wechat-api');
var wxConfig = require('wxConfig');
var _ = require('underscore');
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
                content: '你在干嘛呢!😉',
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
        let strArry = message.Content.split(/[:：]/);
        if (strArry.length > 1) {
            if (strArry[0] == '歌') {
                let baseUrl='https://i.y.qq.com/v8/playsong.html?hostuin=79277490&songid=&songmid=002TpsfX2SA49N&type=0&platform=1&appsongtype=1&_wv=1&source=qq&appshare=iphone&media_mid=002TpsfX2SA49N';
                let baseUrl='https://i.y.qq.com/v8/playsong.html?hostuin=79277490songid=songmid=001qXhio4NvRTbtype=0platform=1appsongtype=1_wv=1source=qqappshare=iphonemedia_mid=001qXhio4NvRTb';
                tes.getResult('http://c.y.qq.com/soso/fcgi-bin/client_search_cp?ct=24&qqmusic_ver=1298&new_json=1&remoteplace=txt.yqq.center&searchid=37602803789127241&t=0&aggr=1&cr=1&catZhida=1&lossless=0&flag_qc=0&p=1&n=20&w=' + encodeURIComponent(strArry[1]) + '&g_tk=5381&loginUin=0&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0',
                    (result) => {
                        let data = JSON.parse(result.body), music = {};
                        if (strArry[2]) {
                            music = _.filter(data.data.song.list, (val, index, context) => {
                                return val.singer[0].name.indexOf(strArry[2]) >= 0;
                            })[0];
                        }else {
                            music = data.data.song.list[0];
                        }
                        if(!music|| _.values(music).length==0){
                            res.reply({
                                content: '抱歉,没有找到你要的歌,歌名或歌手可能有误!, ',
                                type: 'text'
                            });
                            return;
                        }
                            tes.getResult('http://c.y.qq.com/v8/fcg-bin/fcg_play_single_song.fcg?songmid=' + music['mid'] + '&tpl=yqq_song_detail&format=jsonp&callback=getOneSongInfoCallback&g_tk=5381&jsonpCallback=getOneSongInfoCallback&loginUin=0&hostUin=0&format=jsonp&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0',
                                (result) => {
                                    let ind = result.body.indexOf('{'),
                                        data = JSON.parse(result.body.substring(ind, result.body.length - 1));
                                    if(data.data[0].file) {
                                        let url=baseUrl.replace(/media_mid=([^&]+)/,'media_mid='+data.data[0].file.media_mid).replace(/songmid=([^&]+)/,'songmid='+data.data[0].mid);
                                        console.log('=============' + url);
                                        console.log('=============' + baseUrl.replace(/media_mid=([^&]+)/,'&media_mid='+data.data[0].file.media_mid).replace(/songmid=([^&]+)/,'&songmid='+data.data[0].mid));
                                        res.reply({
                                            type: "music",
                                            content: {
                                                title: data.data[0].name,
                                                description: data.data[0].title,
                                                musicUrl:url ,
                                                hqMusicUrl: url,
                                                thumbMediaId: "jjLhKoDS--j7RtmDrF7uiuZVLa881vzKrnmZT7j09WM3W_-1WRUREz9REdlyphj_"
                                            }
                                        });
                                    }else{
                                        res.reply({
                                            content: '你是在为难我吗?😴 ',
                                            type: 'text'
                                        });
                                    }
                                })
                    })
            }
        } else {
            tes.getResult('http://baike.baidu.com/api/openapi/BaikeLemmaCardApi?scope=103&format=json&appid=379020&bk_key=' + encodeURIComponent(strArry[0]) + '&bk_length=600', (data) => {
                let result = JSON.parse(data.body);
                if (result.image) {
                    res.reply([
                        {
                            title: result.tite,
                            description: result.abstract,
                            picurl: result.image,
                            url: result.url
                        }
                    ])
                } else {
                    res.reply({
                        content: result.abstract,
                        type: 'text'
                    })
                }
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
