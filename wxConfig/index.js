module.exports = {
    token: 'banking',
    encodingAESKey: 'cCo0AZHxlAzr3W6zvIfcjYmxBkpQdITVIFThylD3C78',
    appid: 'wx9b59487f2d9c540a',
    appSecret: '6557cd57c50981b4e2a501fdbde54c25',
    checkSignature: false,
    wxVerify: require('./lib/wechatAuth'),
    qrCode: {
        media_id: "6knVxeY2v8rr_fIC_L3t5lLCDpGoySN74qZ_-i1v4Ts",
        url: "http://mmbiz.qpic.cn/mmbiz_jpg/z54ftfNIn4G7ciblkbX9n9ibLelNs001eYC1mbMhRlEVH8j4dLUIhfgHiaqp3JAicgP4MySG7shY5QXxVdkLgMUPyA/0?wx_fmt=jpeg"
    },
    bottom: {
        media_id: "6knVxeY2v8rr_fIC_L3t5qgHcluCI3pzy6Hgc5ndg74",
        url: "http://mmbiz.qpic.cn/mmbiz_gif/z54ftfNIn4G7ciblkbX9n9ibLelNs001eYcn5n3CsxVGiaGHjSriaKc2SttFHRflQfiafaJ2oFd29jq9cUIm5XKhasQ/0?wx_fmt=gif"
    },
    bottomHtml:'<div align="center"><p style="padding-left:30px;padding-right:30px;color: #90371a">市场本没有波动,参与的人多了就有了波动.当别人把肉吃完了,你再去就只能挨刀了....</p>\n' +
    '  <div style="display:flex;justify-content:center">\n' +
    '    <p> <img src="http://mmbiz.qpic.cn/mmbiz_jpg/z54ftfNIn4G7ciblkbX9n9ibLelNs001eYC1mbMhRlEVH8j4dLUIhfgHiaqp3JAicgP4MySG7shY5QXxVdkLgMUPyA/0?wx_fmt=jpeg"/></p>\n' +
    '    <p><img src="http://mmbiz.qpic.cn/mmbiz_gif/z54ftfNIn4G7ciblkbX9n9ibLelNs001eYcn5n3CsxVGiaGHjSriaKc2SttFHRflQfiafaJ2oFd29jq9cUIm5XKhasQ/0?wx_fmt=gif"/></p>\n' +
    '  </div>\n' +
    '  </div>'
};