let okayapi = require('./utils/okayapi.js');
let util = require('./utils/util.js');
App({
    onLaunch: function () {
        if (!(wx.getStorageSync('userAuthorization'))) {
            let userAuthorization = false;
            wx.setStorageSync('userAuthorization', userAuthorization);
        }
        wx.login({
            success: (res) => {
                var code = res.code
                this.globalData.code = code;
                if (code) {
                    this.getUserInfo(code);
                }
            }
        })



    },
    onShow: function () {

    },
    onHide: function () {

    },
    onError: function (msg) {

    },

    processData(data) {
        this.globalData.openid = data.data.openid;
        wx.setStorageSync('openid', data.data.openid)

    },

    userInfoUpload() {
        let data = {
            avatarUrl: this.globalData.userInfo.avatarUrl,
            city: this.globalData.userInfo.city,
            gender: this.globalData.userInfo.gender,
            nickName: this.globalData.userInfo.nickName,
            openid: this.globalData.openid,
            province: this.globalData.userInfo.province
        };
        let datas = {
            data: JSON.stringify(data),
            model_name: 'userInfo',
            s: 'App.Table.Create'
        };

        util.http(this.globalData.okayApiHost, 2, datas);

    },

    getUserInfo(code, callback) {
        wx.getUserInfo({
            success: (msg) => {

                var encryptedData = msg.encryptedData,
                    iv = msg.iv;
                var datas = {
                    s: 'App.Weixin.GetWeixinInfoMini',
                    iv: iv,
                    code: code,
                    encryptedData: encryptedData,
                };

                //调用http函数, 发送请求获取openid
                if (!wx.getStorageSync('openid')) {
                    util.http(this.globalData.okayApiHost, 2, datas, this.processData);
                }

                //绑定用户信息
                this.globalData.userInfo = msg.userInfo;
                wx.setStorageSync('userInfo', msg.userInfo)
                // return true;
            },
            //若授权失败,调用重新获取授权的函数,让用户授权
            fail: (res) => {
                console.log(res);
                // return false;
                // this.checkAuthorization(res);
            }
        })
    },

    globalData: {
        userInfo: null,
        openid: null,
        code: null,
        okayApiHost: 'https://hn2.api.okayapi.com',
        okayApiAppKey: 'CF4626A84A60BD59246201117ED75883',
        okayApiAppSecrect: 'NZMbvE81MLj976qNKdToBsiYfrJX7eSymxqCGJen7Qike6zLQEg4ZBk9rrrfvR0wD3N'
    }
})



//接口弃用
/* checkAuthorization: function (res) {
    wx.showModal({
        title: "温馨提示",
        content: "未授权将无法正常使用相关服务,请点击确定重新获取授权",
        showCancel: false,
        success: (res) => {
            if (res.confirm) {
                wx.openSetting({
                    success: (res) => {
                        if (res.authSetting["scope.userInfo"]) {
                            wx.getUserInfo({
                                success: (msg) => {

                                    var encryptedData = msg.encryptedData,
                                        iv = msg.iv;
                                    var datas = {
                                        s: 'App.Weixin.GetWeixinInfoMini',
                                        iv: iv,
                                        code: this.globalData.code,
                                        encryptedData: encryptedData,
                                    };

                                    //调用http函数, 发送请求获取openid
                                    if (!wx.getStorageSync('openid')) {
                                        util.http(this.globalData.okayApiHost, 2, datas, this.processData);
                                    }

                                    //绑定用户信息
                                    this.globalData.userInfo = msg.userInfo;
                                    wx.setStorageSync('userInfo', msg.userInfo)
                                }
                            })
                        }
                    }
                })
            }
        }
    })
}, */