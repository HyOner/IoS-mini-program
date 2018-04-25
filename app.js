let okayapi = require('./utils/okayapi.js');
let util = require('./utils/util.js');
App({
    onLaunch: function (o) {
        wx.login({
            success: (res) => {
                var code = res.code
                if (code) {
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
                             //util.http(this.globalData.okayApiHost, 2, datas, this.processData);

                            //绑定用户信息
    this.globalData.userInfo = msg.userInfo;
 wx.setStorageSync('userInfo', msg.userInfo )
                            
                        },
                        //若授权失败,调用重新获取授权的函数,让用户授权
                        fail: (res) => {
                            this.checkAuthorization(res);
                        }
                    })
                } else {
                    console.log(`登录失败:${res.errMsg}`);
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
    wx.setStorageSync('openid',data.data.openid)

        //获取到openid之后, 立马调用userInfoCreate函数将用户信息上传至后台储存
        //this.userInfoUpload();

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

    checkAuthorization: function (res) {
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
                                    success: (res) => {
                                        var userInfo = res.userInfo;
                                        this.globalData.userInfo = userInfo
                                    }
                                })
                            }
                        }
                    })
                }
            }
        })
    },

    globalData: {
        userInfo: null,
        openid: null,
        okayApiHost: 'https://hn2.api.okayapi.com',
        okayApiAppKey: 'CF4626A84A60BD59246201117ED75883',
        okayApiAppSecrect: 'NZMbvE81MLj976qNKdToBsiYfrJX7eSymxqCGJen7Qike6zLQEg4ZBk9rrrfvR0wD3N'
    }
})