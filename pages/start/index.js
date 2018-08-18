
var app = getApp();
Page({
    data: {
        year: 2018,
        // userInfo: {},
        userAuthorization: false,
        remind:1
    },

    onLoad: function () {
        this.setData({
            year: new Date().getFullYear()
        });
    },
    onShow: function () {
        let userInfo = wx.getStorageSync('userInfo') || {};
        if (wx.getStorageSync('userAuthorization')){
        this.setData({
            userInfo:userInfo,
            userAuthorization: true
        })
    }
        
    },
    onReady: function () {
        let that = this;
        setTimeout(function () {
            that.setData({
                remind: ''
            });
        }, 1000);
    },

    goToIndex: function () {
        wx.switchTab({
            url: '/pages/home/index',
        });
    },

    getUserInfo(){
        let code = app.globalData.code;
        let getUserInfo = app.getUserInfo;
        wx.getSetting({
            success:(res)=>{
                if(res.authSetting["scope.userInfo"]){
                   this.setData({
                      remind:1 
                   })
                     getUserInfo(code);
                   
                    setTimeout(() => {
                        let userInfo = wx.getStorageSync('userInfo') || {};
                        var userAuthorization = true;
                        wx.setStorageSync('userAuthorization', userAuthorization);

                        this.setData({
                            userInfo: userInfo,
                            userAuthorization: userAuthorization,
                            remind: 0
                        })        
                    }, 500); 
                }      
            }
        })   
    },

});