Page({
  /**
   * 页面的初始数据
   */
  data: {
    placeholderShow: true,
    searchImgMove: 290,
    navLineMove: 13,
    checkedTextIndex:1,
    isDetailShow: false,
    animationData: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  onShow: function (options) {
    this.animation = wx.createAnimation({
      duration: 800,
      timingFunction: "ease-out"
    })

  },

  packDown: function () {
  },
  onInput: function (event) {
    this.setData({
      placeholderShow: false
      
      
    })
  },
  
  onTapSearch: function (event) {
    this.setData({
      searchImgMove: 48,
      
    })
    
  },
  
  onLoseFocus: function (event) {
    this.setData({
      searchImgShow: true,
      searchImgMove: 300
    })
  },
  onTapNav(event) {
    var navid = +event.currentTarget.dataset.navid;
    switch (navid) {
      case 1:
      this.setData({
        navLineMove: 13,
        checkedTextIndex:1
      })
      break;
      case 2:
      this.setData({
        navLineMove: 46.5,
        checkedTextIndex: 2

      })
      break;
      case 3:
      this.setData({
        navLineMove: 80,
        checkedTextIndex: 3
      })
      break;
    }
  },
  
  onTapDetail(e) {
    console.log('ok');
    
    this.animation.height(466).step()
    this.setData({
      animationData: this.animation.export()
    })
  },
  
  onTapUp(e) {
    // this.setData({
    //   isDetailShow: !this.data.isDetailShow,
    // })
    this.animation.height(100).step({duration:500})
    this.setData({
      animationData: this.animation.export()
    })
  }

})