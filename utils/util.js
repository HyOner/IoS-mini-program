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
            if (res.data && res.data.err_code === 0) {
                // console.log('ok', res.data);
                if(callBack!=null){callBack(res);}
            } else {
                console.log('fail:', res);
                // console.log(okayapi.enryptData(datas));
                
            }
        },
        fail: (wxRes) => {
        
            wx.showToast({
                title: `error:${wxRes.errMsg}`,
                 icon: 'none'
            });
        }

    })
}

function dateStr(date) {
    //获取js 时间戳
    var time = new Date().getTime();
    //去掉 js 时间戳后三位，与php 时间戳保持一致  
    time = parseInt(((time - time % 1000) - date) / 1000);
    //存储转换值 
    var s;
    if (time < 60 * 10) { //十分钟内
        return '刚刚';
    } else if ((time < 60 * 60) && (time >= 60 * 10)) {
        //超过十分钟少于1小时
        s = Math.floor(time / 60);
        return s + "分钟前";
    } else if ((time < 60 * 60 * 24) && (time >= 60 * 60)) {
        //超过1小时少于24小时
        s = Math.floor(time / 60 / 60);
        return s + "小时前";
    } else if ((time < 60 * 60 * 24 * 3) && (time >= 60 * 60 * 24)) {
        //超过1天少于3天内
        s = Math.floor(time / 60 / 60 / 24);
        return s + "天前";
    } else {
        //超过3天
        var date = new Date(parseInt(date));
        return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
    }
}


module.exports = {
    formatTime: formatTime,
    http: http,
    dateStr: dateStr
}