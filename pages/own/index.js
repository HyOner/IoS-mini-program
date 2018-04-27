let app = getApp();
let util = require('../../utils/util.js');
let okayapi = require('../../utils/okayapi.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    navLineMove: 13.125,
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

  onReady: function (options) {

  },

  onShow: function (options) {
    this.animation = wx.createAnimation({
      duration: 500,
      timingFunction: "linear"
    })

  },

  poccessData(e) {
    //遍历每个post数据的add_time,将它们转化成'几天前' 
    for (let i = 0, length = e.data.items.length; i < length; i++) {
      let date = e.data.items[i].add_time
      //调用时间处理函数进行相关类型转换
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
          navLineMove: 13.125,
          checkedTextIndex: 1
        })
        break;
      case 2:
        this.setData({
          navLineMove: 60,
          checkedTextIndex: 2

        })
        break;
      case 3:
        this.setData({
          navLineMove: 106.875,
          checkedTextIndex: 3
        })
        break;
    }
  },

  onTapDetail(e) {

    let that = this;
    let postid = e.currentTarget.dataset.postid;
    this.setData({ postid });

    //调用querySelector查询当前点击的帖子高度
    let id = this.data.postData[postid - 1].id;
    let queryid = `#content${id}`
    let query = wx.createSelectorQuery();
    query.select(queryid).boundingClientRect()
    //动态设定动画, 保证每个盒子展开正常
    query.exec(function (res) {
      that.setData({ height: res[0].height })
      let height = that.data.height + 299;
      that.animation.height(height).step()
      that.setData({
        animationData: that.animation.export()
      })
    })
  },

  onTapUp(e) {
    let postid = e.currentTarget.dataset.postid;
    this.setData({ postid });
    this.animation.height(76).step({
      duration: 500
    })
    this.setData({
      animationData: this.animation.export()
    })
    this.setData({ postid: null });
  }

})