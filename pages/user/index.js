let app = getApp();

Page({
  data: {
    userInfo: {},
  },
  onLoad: function (options) {
    this.setData({
      userInfo: app.globalData.userInfo,

    })

  },
  onReady: function () {

  },
  onShow: function () {
    if (wx.getStorageSync('editData')) {
      wx.removeStorageSync('editData')
    }

  },

  onTapDetail(e) {
    let id = +e.currentTarget.dataset.id;
    
    switch (id) {
      case 1:
        wx.navigateTo({
          url: '../own/collection/index',
          success: function (res) {}
        })
        break;
      case 2:
        wx.navigateTo({
          url: '../own/release/index',
          success: function (res) {}
        })
        break;
      case 3:
        // wx.navigateTo({
        //   url: '../own/copyright/index',
        //   success: function (res) {}
        // })

        wx.showModal({
          title: 'Welcome',
          content: 'IoS(Idle of School)是专注于校园的社区类交易平台，专注于营造一个和谐简约, 方便快捷的校园交易社区。通过IoS，你可以发布出售闲置物品的信息, 可以发布转赠各类活动门票的信息, 还可以向学长学姐求助, 借书, 采购资料等等, 你甚至可以获得校园内的兼职信息. 我们力图打造一个清爽的社区体验, 借助微信小程序的生态优势, 你不用进行繁琐的个人认证, 也不用烦恼麻烦的快递邮寄, 双方直接通过微信或者电话联系, 在校园内完成交易, 简单方便, 安全快捷. ',
          showCancel:false,
          confirmText:'明白了'
        })
        break;
      case 4:

        break;

    }
  }
})