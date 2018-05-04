let app = getApp();
let util = require('../../../utils/util.js');
let okayapi = require('../../../utils/okayapi.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    animationData: '',
    isDetailShow: true,
    poccessDataDone: false,
    userInfo: {}
  },


  onLoad: function (options) {},

  onReady: function (options) {

  },

  onShow: function (options) {
    this.animation = wx.createAnimation({
      duration: 500,
      timingFunction: "linear"
    })

    let userInfo = wx.getStorageSync('userInfo') || {
      nickName: 'Mr.Nobody',
      avatarUrl: '../../data/images/mine.png'
    }
    let openid = wx.getStorageSync('openid')
    this.setData({
      userInfo: userInfo,
      openid: openid
    })
    let datas = [];
    datas['key'] = openid
    datas['s'] = 'App.Main_Set.GetList'
    datas['sort'] = 2

    util.http(app.globalData.okayApiHost, 2, datas, this.poccessData);

  },

  refreshData() {
    let openid = wx.getStorageInfoSync('openid')
    wx.showNavigationBarLoading();

    let datas = [];
    datas['key'] = openid
    datas['s'] = 'App.Main_Set.GetList'
    datas['sort'] = 2
    util.http(app.globalData.okayApiHost, 2, datas, this.poccessData)

    wx.hideNavigationBarLoading();

  },

  poccessData(res) {
    //遍历每个post数据的add_time,将它们转化成'几天前' 
    for (let i = 0, length = res.data.items.length; i < length; i++) {
      let date = res.data.items[i].add_time
      //调用时间处理函数进行相关类型转换
      res.data.items[i].add_time = this.poccessDate(date);
      res.data.items[i]['postCollected'] = true
      //将url为空的imgSrc剔除出去
      let imgSrc = res.data.items[i].data.imgSrc
      for (let j = 0; j < imgSrc.length; j++) {
        if (!imgSrc[j]) { imgSrc.splice(j, 1) }
      }
      res.data.items[i].data.imgSrc = imgSrc

    }
    this.setData({
      postData: res.data.items,
      poccessDataDone: true
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

  collectPost(e) {
    let that = this;
    let postid = e.currentTarget.dataset.postid;
    let data = that.data.postData;
    let noteid = that.data.postData[postid].id;
    let postCollected = wx.getStorageSync('postCollected') //noteid是数据库后台帖子的唯一标识
    let userCollected = wx.getStorageSync('userCollected')
    let sourceid = null;
    that.setData({
      noteid: noteid
    })

    for (let key in userCollected) {
      if (userCollected[key] == noteid) {
        sourceid = Number(key)
      }
    }

    let collected_count = Number(data[postid].data.collected_count) - 1;
    data[postid].data.collected_count = collected_count;

    let datas = {
      s: 'App.Main_Set.Update',
      id: sourceid,
      data: JSON.stringify(data[postid].data)
    }

    let ownDatas = {
      s: 'App.Main_Set.Delete',
      id: Number(noteid)
    }
    util.http(app.globalData.okayApiHost, 2, ownDatas);
    util.http(app.globalData.okayApiHost, 2, datas);

    userCollected[sourceid] = undefined
    postCollected[sourceid] = false
    wx.setStorageSync('userCollected', userCollected)
    wx.setStorageSync('postCollected', postCollected)

    data.splice(postid,1)
    that.setData({postData:data})
  },

  onTapDetail(e) {
    let that = this;
    if (that.data.postid != null) {

      that.animation.height(76).step({
        duration: 500
      })
      that.setData({
        animationData: this.animation.export()
      })
      that.setData({
        postid: null
      });
    }
    let postid = e.currentTarget.dataset.postid;

    this.setData({
      postid: postid
    });

    //调用querySelector查询当前点击的帖子高度
    let id = Number(postid);
    let queryid = `#content${id}`
    let query = wx.createSelectorQuery();
    query.select(queryid).boundingClientRect()
    //动态设定动画, 保证每个盒子展开正常
    query.exec(function (res) {
      that.setData({
        height: res[0].height
      })
      let height
      if (that.data.postData[postid].data.imgSrc.length !== 0) {
        height = that.data.height + 299;
      } else {
        height = that.data.height + 149;
      }
      that.animation.height(height).step()
      that.setData({
        animationData: that.animation.export()
      })
    })
  },

  onTapUp(e) {
    let postid = e.currentTarget.dataset.postid;
    this.setData({
      postid
    });
    this.animation.height(76).step({
      duration: 500
    })
    this.setData({
      animationData: this.animation.export()
    })
    this.setData({
      postid: null
    });
  }

})