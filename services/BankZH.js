const cheerio = require('cheerio');
const http = require('http');
const rediz = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(rediz.RedisClient.prototype);
bluebird.promisifyAll(rediz.Multi.prototype);
const nodemailer = require('nodemailer');
const mysql = require('mysql');
const wechatApi = require('wechat-api');
const wxConfig = require('wxConfig');
var redis = rediz.createClient({host: '31.220.44.191', port: 6379, password: 'panrui~'});
const url57 = 'http://www.boc.cn/fimarkets/foreignx/';
const api = new wechatApi(wxConfig.appid, wxConfig.appSecret);

exports.getResult = function getResult(url, callback) {
    return http.get(url, (res) => {
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
exports.tes = function processData() {
    this.getResult(url57, function (data) {
        let $ = cheerio.load(data.body);
        let li = $('div.news li').first();
        const date = li.find('span').first().text().replace('[', '').replace(']', '').trim();
        const href = li.find('a').first().attr('href');
        const text = li.find('a').first().text();
        // if (this.dateFormat(new Date(),'yyyy-MM-dd')==date && '汇市观潮' == text.substr(0, 4)) {
        if ('汇市观潮' == text.substr(0, 4)) {
            redis.getAsync(date).then((ress) => {
                if (!ress || ress != '1') {
                    this.getResult(url57 + href.substr(2), (da2) => {
                        let _$ = cheerio.load(da2.body);
                        let contents = _$('div.sub_con'), b1 = contents.find('p[align]').eq(1),
                            b2 = contents.find('p[align]').eq(2), b3 = contents.find('p[align]').eq(3);
                            let articles=[];
                            [b1,b2,b3].forEach((val)=>{
                                let text=val.prev().text();
                                articles[articles.length]={
                                    thumb_media_id:'6knVxeY2v8rr_fIC_L3t5r-L5SV93fGtWlB6Nx1kkg4',
                                    author:'小潘',
                                    title:text.substring(3).replace(/元 /g,''),
                                    content:val.prev().html()+val.html()+val.next().html(),
                                    digest:'市场本没有波动,做得人多了就有了波动!',
                                    show_cover_pic:'1',
                                }

                            });
                        api.uploadNews({articles:articles},(err,result)=>{
                                console.log(JSON.stringify(result));
                                api.massSendNews(result.media_id,true,(er,re)=>{
                                    console.log(JSON.stringify(re));
                                })
                        });
                        articles
                        //TODO:邮件,微信群发,存库.
                        let html = `<html><head></head><body><p style="color: red;">${b1.prev().text()}</p><p style="color: green;">${b2.prev().text()}</p><p style="color: blue;">${b3.prev().text()}</p> </body>`
                        this.sendMail({html: html});
                        redis.setAsync(date, '1', 'EX', 28800).then((r) => {
                            // redis.getAsync(date).then((rr) => {console.log(rr)})
                            console.log("今日数据已处理.")
                        });
                    });
                }
            });
        }
    })
}

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
