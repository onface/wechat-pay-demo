// https://github.com/onface/wechat-pay-demo
var request = require('request')
var path = require('path')
var fs = require('fs')
const { toXML } = require('jstoxml')
var md5 = require('md5')
var config = require('./config.example.js')

if (fs.existsSync('./config.js')) {
    config = require('./config.js')
}
// 企业付款 https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=14_2
var data = {
    mch_appid: config.mch_appid,
    mchid: config.mchid,
    nonce_str: `${new Date().getTime()*parseInt(Math.random()*100)}`,
    partner_trade_no: md5(`${Math.random()}`),
    openid: config.openid,
    amount: 1,
    // 还有需要添加一个场景id @2244137744@qq.com 记得看完加上去
    check_name: 'NO_CHECK',
    spbill_create_ip: '192.168.0.1',
    desc: '测试发钱'
}
// 签名算法 https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=4_3
var sortKey = []
for(key in data) {
    sortKey.push(key)
}
sortKey = sortKey.sort(function (a, b) {
    return a.charCodeAt() - b.charCodeAt()
})
let queryString = []
sortKey.forEach(function (key) {
    queryString.push(`${key}=${data[key]}`)
})

queryString = queryString.join('&') + `&key=` + config.mch_secret_key
var sign = md5(queryString).toUpperCase()
data.sign = sign

console.log('requestData', data)

var body = `<xml>${toXML(data)}</xml>`
// 账户中心>安全中心>API安全>下载证书
var certFile = path.resolve(__dirname, 'cert/apiclient_cert.pem')
var keyFile = path.resolve(__dirname, 'cert/apiclient_key.pem')

if (!fs.existsSync(certFile)) {
    throw new Error('你需要下载安全证书 账户中心>安全中心>API安全>下载证书 https://pay.weixin.qq.com/index.php/core/cert/api_cert')
}
if (!fs.existsSync(keyFile)) {
    throw new Error('你需要下载安全证书  账户中心>安全中心>API安全>下载证书 https://pay.weixin.qq.com/index.php/core/cert/api_cert')
}
request({
    uri: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers',
    agentOptions: {
        cert: fs.readFileSync(certFile),
        key: fs.readFileSync(keyFile),
    },
    method: 'POST',
    body: body,
    headers: {
        'Content-Type': 'application/xml'
    }
},
function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
})
