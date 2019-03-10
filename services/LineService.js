const axios = require('axios');
const querystring = require('querystring');

const LineService = function () {};

LineService.prototype.setToken = function (token) {
    this.token = token;
};

LineService.prototype.notify = function (text) {
    // トークンチェック
    if (this.token == undefined || this.token == null) {
        return;
    }
    // 投稿
    axios({
            method: 'post',
            url: 'https://notify-api.line.me/api/notify',
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            // リクエストデータの生成にquerystringを使用
            data: querystring.stringify({
                message: text,
            }),
        })
        .then(function (res) {
            console.log(res.data);
        })
        .catch(function (error) {
            console.error(error);
        });
};

module.exports = LineService;