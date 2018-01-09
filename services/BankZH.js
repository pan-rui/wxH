const cheerio = require('cheerio');
const http = require('http');
const rediz = require('redis');
const fs = require('fs');
const bluebird = require('bluebird');
bluebird.promisifyAll(rediz.RedisClient.prototype);
bluebird.promisifyAll(rediz.Multi.prototype);
const nodemailer = require('nodemailer');
const mysql = require('mysql');
const async = require('async');
var _ = require('underscore');
const wechatApi = require('wechat-api');
const wxConfig = require('wxConfig');
var redis = rediz.createClient({host: '31.220.44.191', port: 6379, password: 'panrui~'});
const url57 = 'http://www.boc.cn/fimarkets/foreignx/';
const url58 = 'http://www.boc.cn/fimarkets/fm7/';
const url59 = 'http://www.boc.cn/fimarkets/boud/';
const api = new wechatApi(wxConfig.appid, wxConfig.appSecret);
const currency = {
    '澳元/美元': ['AUD', '/opt/html/images/AUD.jpg'],
    '欧元/美元': ['EUR', '/opt/html/images/EUR.jpg'],
    '英镑/美元': ['GBP', '/opt/html/images/GBP.jpg'],
    '美元/日元': ['JPY', '/opt/html/images/JPY.jpg'],
    '美元/加元': ['CAD', '/opt/html/images/CAD.jpg'],
    '黄金': ['XAU', '/opt/html/images/XAU.jpg'],
    '债市': ['Zhai', '/opt/html/images/Zhai.jpg']
};
exports.getResult = function getResult(url, callback) {
    http.get(url, (res) => {
        if (res.statusCode == 200) {
            res.setEncoding('utf8');
            var body = '';
            res.on('data', function (d) {
                body += d;
            });
            // callback.apply(this,)
            // let isJSON=/^application\/json/.test(res.headers['content-type']);
            res.on('end', () => callback.apply(this, [{
                body: body
            }]));
        }
    }).on('error', () => {
        console.log('抓取数据失败...')
    })
}
exports.dateFormat = function dateFormat(date, format) {
    date = isNaN(date) ? new Date(date.replace('CST', '')) : new Date(date);
    var o = {
        'M+': date.getMonth() + 1, //month
        'd+': date.getDate(), //day
        'H+': date.getHours(), //hour
        'm+': date.getMinutes(), //minute
        's+': date.getSeconds(), //second
        'q+': Math.floor((date.getMonth() + 3) / 3), //quarter
        'S': date.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp('(' + k + ')').test(format))
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
    return format;
}
exports.downFX = function downFX() {
    this.getResult(url57, function (data) {
        let $ = cheerio.load(data.body);
        // let li = $('div.news li').first();
        for(let [ii, li] of Object.entries([$('div.news li').first(),$('div.news li').eq(1)])) {
        // for(var li in [$('div.news li').first(),$('div.news li').eq(1)]) {
            const date = li.find('span').first().text().replace('[', '').replace(']', '').trim();
            const href = li.find('a').first().attr('href');
            const text = li.find('a').first().text();
            if (this.dateFormat(new Date(), 'yyyy-MM-dd') == date && '汇市观潮' == text.substr(0, 4)) {
                // if ('汇市观潮' == text.substr(0, 4)) {
                let redisKey = date + 'FX';
                redis.getAsync(redisKey).then((ress) => {
                    if (!ress || ress != '1') {
                        this.getResult(url57 + href.substr(2), (da2) => {
                            let _$ = cheerio.load(da2.body);
                            let contents = _$('div.sub_con'), b1 = contents.find('p[align]').eq(1),
                                b2 = contents.find('p[align]').eq(2), b3 = contents.find('p[align]').eq(3);
                            let html = `<html><head></head><body><p style="color: red;">${b1.prev().text()}</p><p style="color: green;">${b2.prev().text()}</p><p style="color: blue;">${b3.prev().text()}</p> </body>`;
                            try {
                                this.sendMail({html: html});
                            } catch (e) {
                                console.log('邮件发送失败' + e)
                            }
                            let texts = _$('div.sub_con > p');
                            let articles = [], textArr = [], tex = '';
                            texts = _.initial(_.rest(texts));
                            _.each(texts, (el, i, list) => {
                                if ($(el).text().startsWith('货币')) {
                                    if (tex != '') textArr[textArr.length] = tex;
                                    tex = '';
                                } else {
                                    tex += $.html(el);
                                }
                            });
                            textArr[textArr.length] = tex;
                            /*                        articles[articles.length] = {
                                                        thumb_media_id: 'jjLhKoDS--j7RtmDrF7uiuZVLa881vzKrnmZT7j09WM3W_-1WRUREz9REdlyphj_',
                                                        author: '小潘',
                                                        title: '充气女友进化论,哈哈',
                                                        content: '<html><head></head><body><iframe frameborder="0" width="640" height="498" src="https://v.qq.com/iframe/player.html?vid=p05203wum6o&tiny=0&auto=0" allowfullscreen></iframe></body></html>',
                                                        digest: '市场本没有波动,做得人多了就有了波动!',
                                                        show_cover_pic: '0',
                                                    };*/
                            let arry = [b1, b2, b3], curIndex = 0;
                            async.forEach(arry, (val, callback) => {
                                let text = val.prev().text(), src = val.find('img').first().attr('src');
                                if(src.indexOf("http")!=0){
                                    let in1=url57.lastIndexOf('/'),in2=src.indexOf('/')
                                    src=url57.substring(0,in1)+src.substring(in2)
                                }
                                let imgPath = '/opt/html/GIF/' + currency[text.substr(3, 5)][0] + '.gif';
                                // let imgPath = currency[text.substr(3, 5)][0] + '.gif';
                                // let imgUrl = '';
                                async.waterfall([(next) => (this.downImg({
                                    src: src,
                                    path: imgPath,
                                    index: curIndex
                                }, next)), (rst1, next) => api.uploadImage(rst1.path, (err, result) => {
                                    if (err) {
                                        console.log('上传文件错误' + JSON.stringify(err))
                                    } else {
                                        next(err, {index: rst1.index, result: result, src: rst1.src});
                                    }
                                })], (err, rst) => {
                                    // imgUrl = rst.url;
                                    let valText = textArr[rst.index].replace(rst.src, rst.result.url);
                                    redis.getAsync(currency[text.substr(3, 5)][0]).then((res) => {
                                        articles[articles.length] = {
                                            thumb_media_id: res,
                                            author: '小潘',
                                            title: text.substring(3).replace(/元 /g, '元'),
                                            content: '<html><head></head><body>' + '<br/>' + valText + '<br/>' + wxConfig.bottomHtml + '</body></html>',
                                            digest: '市场本没有波动,做得人多了就有了波动!',
                                            show_cover_pic: '0',
                                        }
                                    });
                                });
                                curIndex++;
                                callback();         //注意:放在大括号里调用不到...此行会执行3次,但最终只会调用一次方法
                            }, (err) => {
                                if (err) {
                                    console.log(JSON.stringify(err));
                                    return;
                                }
                                let inter = 0, flag = 0;
                                inter = setInterval(function () {
                                    if (articles.length == arry.length) {
                                        redis.getAsync('articles').then((resss) => {
                                            if (flag == 0 && resss && resss.length > 5) {
                                                articles = _.union(JSON.parse(resss), articles);
                                                flag = 1;
                                            }
                                            redis.setAsync('articles', JSON.stringify(articles), 'EX', 28800).then((rr) => {
                                                redis.setAsync(redisKey, '1', 'EX', 28800).then((r) => {
                                                    // redis.getAsync(date).then((rr) => {console.log(rr)})
                                                    console.log(redisKey + '====已处理')
                                                });
                                            })
                                        })
                                        clearInterval(inter);
                                    }
                                }, 500)
                            });
                        });
                    }
                });
            }
        }
    })
}
// thumb_media_id:'6knVxeY2v8rr_fIC_L3t5r-L5SV93fGtWlB6Nx1kkg4',

exports.sendMail = function sendMail(opt) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.163.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'panrui-520@163.com', // generated ethereal user
            pass: 'prCHU123456'  // generated ethereal password
        }
    });
    let mailOptions = {
        from: '"panrui-520" <panrui-520@163.com>', // sender address
        to: '79277490@qq.com', // list of receivers
        subject: '今日行情', // Subject line
        text: opt.content, // plain text body
        html: opt.html // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
    });
}

exports.downImg = function downImg(params, callback) {
    http.get(params.src, function (res) {
        var imgData = "";
        res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
        res.on("data", function (chunk) {
            imgData += chunk;
        });
        res.on("end", async function () {
            await fs.writeFile(params.path, imgData, "binary", async function (err, result1) {
                if (err) {
                    console.log(url + '\n' + params.path + '\n' + JSON.stringify(err));
                    return;
                }
                // console.log('down success');
                await callback(err, params);
            });
        });
    });
}

exports.downZhai = function downZhai() {
    this.getResult(url59, function (data) {
        let $ = cheerio.load(data.body);
        let li = $('div.news li').first();
        const date = li.find('span').first().text().replace('[', '').replace(']', '').trim();
        const href = li.find('a').first().attr('href');
        const text = li.find('a').first().text();
        if (this.dateFormat(new Date(), 'yyyy-MM-dd') == date) {
            let redisKey = date + 'Zhai';
            redis.getAsync(redisKey).then((ress) => {
                if (!ress || ress != '1') {
                    this.getResult(url59 + href.substr(2), (da2) => {
                        let _$ = cheerio.load(da2.body);
                        let contents = _$('div.sub_con > p,table');
                        contents = _.initial(_.rest(contents));
                        let articles = [];
                        let aStr = '';
                        _.each(contents, (el, i, list) => {
                            aStr += $.html(el);
                        })
                        let reg = /src="([^"]+)/;
                        if (reg.test(aStr)) {
                            let src = RegExp.$1,
                                imgPath = '/opt/html/GIF/' + currency[text.substr(0, 2)][0] + '.gif';
                            async.waterfall([(next) => (this.downImg({path:imgPath,src:src}, next)), (rst1, next) => api.uploadImage(rst1.path, (err, result) => {
                                if (err) {
                                    console.log('上传文件错误' + JSON.stringify(err))
                                } else {
                                    next(err, result);
                                }
                            })], (err, rst) => {
                                aStr.replace(reg, rst.url);
                                redis.getAsync(currency['债市'][0]).then((res) => {
                                    articles[articles.length] = {
                                        thumb_media_id:res ,
                                        author: '小潘',
                                        title: text,
                                        content: '<html><head></head><body>' + '<br/>' + aStr + wxConfig.bottomHtml + '</body></html>',
                                        digest: '市场本没有波动,做得人多了就有了波动!',
                                        show_cover_pic: '1',
                                    }
                                });
                                redis.getAsync('articles').then((resss) => {
                                    if (resss)
                                        articles = _.union(JSON.parse(resss), articles);
                                    redis.setAsync('articles', articles, 'EX', 28800).then((rr) => {
                                        redis.setAsync(redisKey, '1', 'EX', 28800).then((r) => {
                                            // redis.getAsync(date).then((rr) => {console.log(rr)})
                                            console.log(redisKey + '====已处理')
                                        });
                                    })
                                })
                            });
                        } else {
                            redis.getAsync(currency['债市'][0]).then((res) => {
                                articles[articles.length] = {
                                    thumb_media_id: res,
                                    author: '小潘',
                                    title: text,
                                    content: '<html><head></head><body>' + '<br/>' + aStr + wxConfig.bottomHtml + '</body></html>',
                                    digest: '市场本没有波动,做得人多了就有了波动!',
                                    show_cover_pic: '1',
                                }
                            });
                            redis.getAsync('articles').then((resss) => {
                                if (resss && resss.length > 5)
                                    articles = _.union(JSON.parse(resss), articles);
                                redis.setAsync('articles', JSON.stringify(articles), 'EX', 28800).then((rr) => {
                                    redis.setAsync(redisKey, '1', 'EX', 28800).then((r) => {
                                        // redis.getAsync(date).then((rr) => {console.log(rr)})
                                        console.log(redisKey + '====已处理')
                                    });
                                })
                            })
                        }
                    });
                }
            });
        }
    })
}
exports.downGold = function downGold() {
    this.getResult(url58, function (data) {
        let $ = cheerio.load(data.body);
        let li = $('div.news li').first();
        const date = li.find('span').first().text().replace('[', '').replace(']', '').trim();
        const href = li.find('a').first().attr('href');
        const text = li.find('a').first().text();
        if (this.dateFormat(new Date(), 'yyyy-MM-dd') == date) {
            let redisKey = date + 'Gold';
            redis.getAsync(redisKey).then((ress) => {
                if (!ress || ress != '1') {
                    this.getResult(url58 + href.substr(2), (da2) => {
                        let _$ = cheerio.load(da2.body);
                        let contents = _$('div.sub_con > p');
                        contents = _.initial(_.rest(contents));
                        let articles = [];
                        let aStr = '';
                        _.each(contents, (el, i, list) => {
                            aStr += $.html(el);
                        })
                        let reg = /src="([^"]+)/;
                        if (reg.test(aStr)) {
                            let src = RegExp.$1, imgPath = '/opt/html/GIF/' + currency['黄金'][0] + '.gif';
                            async.waterfall([(next) => (this.downImg({path:imgPath,src:src}, next)), (rst1, next) => api.uploadImage(rst1.path, (err, result) => {
                                if (err) {
                                    console.log('上传文件错误' + JSON.stringify(err))
                                } else {
                                    next(err, result);
                                }
                            })], (err, rst) => {
                                aStr = aStr.replace(src, rst.url);
                                redis.getAsync(currency['黄金'][0]).then((res) => {
                                    articles[articles.length] = {
                                        thumb_media_id: res,
                                        author: '小潘',
                                        title: text.split('—')[1],
                                        content: '<html><head></head><body>' + '<br/>' + aStr + wxConfig.bottomHtml + '</body></html>',
                                        digest: '市场本没有波动,做得人多了就有了波动!',
                                        show_cover_pic: '0',
                                    }
                                });
                                redis.getAsync('articles').then((resss) => {
                                    if (resss)
                                        articles = _.union(articles,JSON.parse(resss));
                                    redis.setAsync('articles', JSON.stringify(articles), 'EX', 28800).then((rr) => {
                                        redis.setAsync(redisKey, '1', 'EX', 28800).then((r) => {
                                            // redis.getAsync(date).then((rr) => {console.log(rr)})
                                            console.log(redisKey + '====已处理')
                                        });
                                    })
                                })
                            });
                        } else {
                            redis.getAsync(currency['黄金'][0]).then((res) => {
                                articles[articles.length] = {
                                    thumb_media_id: res,
                                    author: '小潘',
                                    title: text.split('—')[1],
                                    content: '<html><head></head><body>' + '<br/>' + aStr + wxConfig.bottomHtml + '</body></html>',
                                    digest: '市场本没有波动,做得人多了就有了波动!',
                                    show_cover_pic: '0',
                                }
                            });
                            redis.getAsync('articles').then((resss) => {
                                if (resss && resss.length > 5)
                                    articles = _.union(articles,JSON.parse(resss));
                                redis.setAsync('articles', JSON.stringify(articles), 'EX', 28800).then((rr) => {
                                    redis.setAsync(redisKey, '1', 'EX', 28800).then((r) => {
                                        // redis.getAsync(date).then((rr) => {console.log(rr)})
                                        console.log(redisKey + '====已处理')
                                    });
                                })
                            })
                        }
                    });
                }
            });
        }
    })
}

exports.sendNews = function sendNews() {
    /*    let inter = 0;
        inter = setInterval(function () {*/
    let date = this.dateFormat(new Date(), 'yyyy-MM-dd');
    redis.getAsync(date).then((ress) => {
        if (!ress || ress != '1') {
            redis.getAsync('articles').then((res) => {
                let articles = res ? JSON.parse(res) : [];
                if (articles.length < 5) return;
                api.uploadNews({articles: articles}, (err, result) => {
                    console.log(JSON.stringify(result));
                    /*                    api.previewNews('o9JfX0YUGrbpbcZFekCsDmjO-Xkw', result.media_id, (er, re) => {
                                            console.log(JSON.stringify(re));
                                        });*/
                    api.massSendNews(result.media_id, true, (er, re) => {
                        console.log(JSON.stringify(re));
                    })
                    //TODO:邮件,微信群发,存库.
                    redis.setAsync(date, '1', 'EX', 28800).then((r) => {
                        // redis.getAsync(date).then((rr) => {console.log(rr)})
                        console.log("今日数据已处理.")
                    });
                });
            })
        }
    });
    /*        clearInterval(inter);
        }, 500)*/
}

exports.uploadImg = function uploadImg() {
    _.each(currency, (val, key, list) => {
        redis.getAsync(val[0]).then((res) => {
            if (!res) {
                api.uploadMedia(val[1], 'thumb', (err, result) => {
                    if (err) {
                        console.log('上传文件错误' + JSON.stringify(err))
                    } else {
                        redis.setAsync(val[0], result.thumb_media_id, 'EX', 172800).then((r) => {
                            // redis.getAsync(date).then((rr) => {console.log(rr)})
                            console.log("缩略图已上传.")
                        });
                    }
                })
            }
        })
    })
}
/*
http.get('http://nodejs.org/dist/index.json', (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +   `Status Code: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
            `Expected application/json but received ${contentType}`);
    }
    if (error) {
        console.error(error.message);
        // consume response data to free up memory
        res.resume();
        return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
            console.log(parsedData);
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});*/

