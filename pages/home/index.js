let app = getApp();
let util = require('../../utils/util.js');
let okayapi = require('../../utils/okayapi.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    navLineMove: 3.5,
    checkedTextIndex: 1,
    isDetailShow: false,
    animationData: '',

    userInfo: {}
  },


  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo')
    this.setData({
      userInfo: userInfo
    })
    let datas = [];
    datas['key'] = 'postList'
    datas['s'] = 'App.Main_Set.GetList'

    util.http(app.globalData.okayApiHost, 2, datas, this.poccessData);

  },

  onShow: function (options) {
    this.animation = wx.createAnimation({
      duration: 800,
      timingFunction: "ease-out"
    })

  },

  poccessData(e) {
    for (let i = 0, length = e.data.items.length; i < length; i++) {
      let date = e.data.items[i].add_time
      e.data.items[i].add_time = this.poccessDate(date)
    }

    this.setData({
      postData: e.data.items
    })

  },
  poccessDate(date) {
    if ((typeof date) === 'string') {
      //将字符串日期转换为日期格式
      let newDate = new Date(Date.parse(date.replace(/-/g, "/")))
      //将日期格式转换为时间戳
      let fDate = newDate.getTime()
      //调用时间格式化函数, 返回时间显示为'几天前'
      return util.dateStr(fDate)
    }
  },

  
  onInput: function (event) {
    this.setData({
      placeholderShow: false


    })
  },

  onTapNav(event) {
    var navid = +event.currentTarget.dataset.navid;
    switch (navid) {
      case 1:
        this.setData({
          navLineMove: 3.5,
          checkedTextIndex: 1
        })
        break;
      case 2:
        this.setData({
          navLineMove: 16,
          checkedTextIndex: 2

        })
        break;
      case 3:
        this.setData({
          navLineMove: 28.5,
          checkedTextIndex: 3
        })
        break;
    }
  },

  onTapDetail(e) {

    this.animation.height(350).step()
    this.setData({
      animationData: this.animation.export()
    })
  },

  onTapUp(e) {
    this.animation.height(82).step({
      duration: 500
    })
    this.setData({
      animationData: this.animation.export()
    })
  }

})