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
    isCloseShow: false,
    isDetailShow: true,
    animationData: '',
    poccessDataDone: false,
    userInfo: {}
  },


  onLoad: function (options) {
   
    let datas = [];
    datas['key'] = 'postList'
    datas['s'] = 'App.Main_Set.GetList'
    datas['sort'] = 2

    util.http(app.globalData.okayApiHost, 2, datas, this.poccessData);
  },

  onReady: function (options) {
    
  },

  onShow: function (options) {

    if (wx.getStorageSync('editData')) {
      wx.removeStorageSync('editData')
    } 

    this.animation = wx.createAnimation({
      duration: 500,
      timingFunction: "linear"
    })
      
    let datas = [];
    datas['key'] = 'postList'
    datas['s'] = 'App.Main_Set.GetList'
    datas['sort'] = 2
    util.http(app.globalData.okayApiHost, 2, datas, this.poccessData)

  },

  onHide:function (options) {
    //重置动画效果
    if (this.data.postid != null) {

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
    
  },

  onPullDownRefresh() {

    wx.showNavigationBarLoading();

    let datas = [];
    datas['key'] = 'postList'
    datas['s'] = 'App.Main_Set.GetList'
    datas['sort'] = 2
    util.http(app.globalData.okayApiHost, 2, datas, this.poccessData)

    let foo = 1
    while (foo) {
      if(this.data.poccessDataDone){
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
      foo = 0
    }}
    this.setData({
      poccessDataDone: false
    });
  },
  onReachBottom() {

  },
  poccessData(res) {
    //数据处理函数:改变时间显示格式, 添加item收藏状态数据 
    let postCollected = wx.getStorageSync('postCollected') || {}
    //将用户本地缓存中对各帖子收藏状态记录的id取出来放到一个数组中, 以便之后拿来判断
    let collectedArray = []
    for (let key in postCollected) {
      collectedArray.push(Number(key))
    }

    //遍历每个post数据的add_time,将它们转化成'几天前' 
    for (let i = 0, length = res.data.items.length; i < length; i++) {
      let date = res.data.items[i].update_time || res.data.items[i].add_time
      //调用时间处理函数进行相关类型转换
      res.data.items[i].add_time = this.poccessDate(date);

      //收藏相关逻辑, 先获取缓存里面postCollected各帖子的收藏状态, 然后进行数据绑定与预置
      if (collectedArray.indexOf(Number(res.data.items[i].id)) > 0) {
        let collectedid = res.data.items[i].id
        if (postCollected[collectedid]) {
          res.data.items[i]['postCollected'] = true;
        } else { res.data.items[i]['postCollected'] = false}
      } else res.data.items[i]['postCollected'] = false

      //将url为空的imgSrc剔除出去
      let imgSrc = res.data.items[i].data.imgSrc
      for(let j=0;j<imgSrc.length;j++){
        if (!imgSrc[j]) {imgSrc.splice(j,1)}
      }
      res.data.items[i].data.imgSrc = imgSrc

    }

    wx.setStorageSync('postData', res.data.items)

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
      let fixedDate = newDate.getTime()
      //调用时间格式化函数, 返回时间显示为'几天前'
      return util.dateStr(fixedDate)

    }
  },

  collectPost(e) {
    let that = this;
    let postid = e.currentTarget.dataset.postid;
    let noteid = that.data.postData[postid].id;
    let postCollected = wx.getStorageSync('postCollected') || {} //noteid是数据库后台帖子的唯一标识
    that.setData({
      noteid: noteid
    })

    //判断用户的收藏状态, 未收藏就让收藏数加1, 已收藏减1, 返回后台数据
    let data = that.data.postData[postid].data;
    let collected = that.data.postData[postid].postCollected
    let collected_count = that.data.postData[postid].data.collected_count

    //点击收藏后,将收藏状态取反,并存入页面data中 
    collected = !collected;
    that.data.postData[postid].postCollected = collected
    postCollected[noteid] = collected;
    wx.setStorageSync('postCollected', postCollected)
    //用户未收藏该篇post
    if (collected) {

      let collected_count = Number(data.collected_count) + 1;
      that.data.postData[postid].data.collected_count = collected_count;

      let datas = {
        s: 'App.Main_Set.Update',
        id: that.data.postData[postid].id,
        data: JSON.stringify(data)
      }
      let ownDatas = {
        s: 'App.Main_Set.Add',
        key: data.userid,
        data: JSON.stringify(data)
      }
      util.http(app.globalData.okayApiHost, 2, datas);
      util.http(app.globalData.okayApiHost, 2, ownDatas, this.saveReturnCollectedPostid);

      //用户已收藏该篇post
    } else {
      let collected_count = Number(data.collected_count) - 1;
      that.data.postData[postid].data.collected_count = collected_count;
      let userCollected = wx.getStorageSync('userCollected')

      let datas = {
        s: 'App.Main_Set.Update',
        id: that.data.postData[postid].id,
        data: JSON.stringify(data)
      }

      let ownDatas = {
        s: 'App.Main_Set.Delete',
        id: Number(userCollected[noteid])
      }
      util.http(app.globalData.okayApiHost, 2, datas);
      util.http(app.globalData.okayApiHost, 2, ownDatas);

      userCollected[noteid] = undefined
      wx.setStorageSync('userCollected', userCollected)
    }

    that.setData({
      postData: that.data.postData
    })
  },

  // 回调函数接收收藏返回的记录帖id
  saveReturnCollectedPostid(e) {
    let returnid = e.data.id; //returnid 用户收藏后, 后台返回的收藏帖子数据的id, 不同用户此id不同.
    this.connectCollectedPostid(returnid);
  },
  //将帖子的noteid与用户收藏id绑定在一起, 结构是noteid:returnid
  connectCollectedPostid(returnid) {
    let userCollected = wx.getStorageSync('userCollected') || {};
    let postCollected = wx.getStorageSync('postCollected');
    let tieid = this.data.noteid //tieid 写入缓存里与returnid绑定的noteid, 唯一标识
    userCollected[tieid] = returnid
    wx.setStorageSync('userCollected', userCollected)
  },

  onInput: function (event) {
    this.setData({
      isCloseShow: true,
      isDetailShow: false
    })
  },

  searchPost(e) {
    let keyword = e.detail.value;
    let datas = {
      s: 'App.Main_Set.Query',
      key: 'postList',
      keyword: keyword,
      sort: 2,
    }
    util.http(app.globalData.okayApiHost, 2, datas, this.returnPostData);

  },
  returnPostData(res) {
    if (res.data.items.length != 0) {
      //数据处理函数:改变时间显示格式, 添加item收藏状态数据
      let postCollected = wx.getStorageSync('postCollected') || []
      //遍历每个post数据的add_time,将它们转化成'几天前' 
      for (let i = 0, length = res.data.items.length; i < length; i++) {
        let date = res.data.items[i].add_time
        //调用时间处理函数进行相关类型转换
        res.data.items[i].add_time = this.poccessDate(date);
        if (postCollected[i] && postCollected[i].thisCollected) {
          res.data.items[i]['postCollected'] = postCollected[i]['thisCollected'];
        } else res.data.items[i]['postCollected'] = false
      }
      this.setData({
        postData: res.data.items,
        isDetailShow: true
      })
    } else {
      this.showTopTips('没有搜索到相关条目, 请换个关键词', 2500)
    }
  },

  closeSearch(e) {
    let postData = wx.getStorageSync('postData')
    this.setData({
      isCloseShow: false,
      isDetailShow: true,
      inputValue: '',
      postData: postData
    })
  },

  filterPost(navid) {
    let newPostData = {};
    let postData = wx.getStorageSync('postData')

    if (navid != 1) {
      if (navid == 2) {
        for (let i = 0, j = 0; i < postData.length; i++) {
          if (Number(postData[i].data.category) % 2 == 1) {
            newPostData[j++] = postData[i]
          }
        }
      } else {
        for (let i = 0, j = 0; i < postData.length; i++) {
          if (Number(postData[i].data.category) % 2 == 0) {
            newPostData[j++] = postData[i]
          }
        }
      }
      this.setData({
        postData: newPostData
      })
    } else {
      this.setData({
        postData: postData
      })
    }




  },


  onTapNav(event) {
    var navid = +event.currentTarget.dataset.navid;
    switch (navid) {
      case 1:
        this.filterPost(navid)
        this.setData({
          navLineMove: 13.125,
          checkedTextIndex: 1
        })
        break;
      case 2:
        this.filterPost(navid)
        this.setData({
          navLineMove: 60,
          checkedTextIndex: 2

        })
        break;
      case 3:
        this.filterPost(navid)
        this.setData({
          navLineMove: 106.875,
          checkedTextIndex: 3
        })
        break;
    }
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
      postid: postid
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
  },

  showTopTips(content = '', options = {}, color = undefined) {
    let topTips = this.data.topTips || {};
    // 如果已经有一个计时器在了，就清理掉先
    if (topTips.timer) {
      clearTimeout(topTips.timer);
      topTips.timer = 0;
    }

    if (typeof options === 'number') {
      options = {
        duration: options
      };
    }

    // options参数默认参数扩展
    options = Object.assign({
      duration: 3000
    }, options);

    // 设置定时器，定时关闭topTips
    let timer = setTimeout(() => {
      this.setData({
        'topTips.show': false,
        'topTips.timer': 0
      });
    }, options.duration);

    // 展示出topTips
    this.setData({
      topTips: {
        show: true,
        color,
        content,
        options,
        timer
      }
    });
  }
})