let app = getApp();
let util = require('../../../utils/util.js');
let okayapi = require('../../../utils/okayapi.js');
Page({

  data: {
  
  },

  onLoad(ops){
    let noteid = ops.id;
    
    let datas ={
      s: 'App.Main_Set.GetItem',
      id: Number(noteid)
    }

    util.http(app.globalData.okayApiHost, 2, datas, this.poccessData);
  },

  poccessData(res) {
    //数据处理函数:改变时间显示格式, 添加item收藏状态数据 
    let postCollected = wx.getStorageSync('postCollected') || {}
    //将用户本地缓存中对各帖子收藏状态记录的id取出来放到一个数组中, 以便之后拿来判断
    let collectedArray = []
    for (let key in postCollected) {
      collectedArray.push(Number(key))
    }

    //数据的add_time,将它转化成'几天前' 
      let date = res.data.update_time || res.data.add_time
      //调用时间处理函数进行相关类型转换
      res.data.add_time = this.poccessDate(date);

      //将url为空的imgSrc剔除出去
      let imgSrc = res.data.data.imgSrc
      for (let j = 0; j < imgSrc.length; j++) {
        if (!imgSrc[j]) { imgSrc.splice(j, 1) }
      }
      res.data.data.imgSrc = imgSrc
  
    this.setData({
      postData: res.data,
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

  goHome(){
    wx.reLaunch({
      url: '../../home/index',
    })
  }

})