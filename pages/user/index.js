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
        wx.navigateTo({
          url: '../own/copyright/index',
          success: function (res) {}
        })
        break;
      case 4:

        break;

    }
  }
})