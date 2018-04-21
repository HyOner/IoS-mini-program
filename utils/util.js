const okayapi = require('./okayapi.js');
const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function http(url, type, datas, callBack) {
    wx.request({
        url: url,
        data: okayapi.enryptData(datas),
        method: (type === 1) ? 'GET' : 'POST',
        header: (type === 1) ? {
            'content-type': 'application/json'
        } : {
            'content-type': 'application/x-www-form-urlencoded'
        },
        success: (wxRes) => {
            let res = wxRes.data;
            if (res.data && res.data.err_code == 0) {
                // console.log('ok', res.data);
                if(callBack!=null){callBack(res);}
            } else {
                console.log('fail:', res);
            }
        },
        fail: (wxRes) => {
            wx.showModal({
                title: `登录失败:${wxRes.errMsg}`,
                icon: none
            });
        }

    })
}

module.exports = {
    formatTime: formatTime,
    http: http
}