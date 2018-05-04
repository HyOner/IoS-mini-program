let util = require('../../utils/util.js');
let okayapi = require('../../utils/okayapi.js');
let app = getApp();

Page({


  data: {
    items: [{
      name: '1',
      value: '闲置'
    }, {
      name: '2',
      value: '求助'
    }, {
      name: '3',
      value: '转赠'
    }, {
      name: '4',
      value: '兼职'
    }],

    radioCheckVal: '',
    isEdit: false,

    files: [{
      filePaths: '',
      isFileReal: false
    }],

  },


  onLoad: function (options) {
    let userInfo = wx.getStorageSync('userInfo') || {
      nickName: 'Mr.Nobody',
      avatarUrl: '../../data/images/mine.png'
    }
    this.setData({
      userInfo: userInfo,
    })

  },


  onShow: function () {
    let editData = wx.getStorageSync('editData')
    let files = this.data.files;


    if (editData) {
      if (editData.data.imgSrc.length) {
        for (let i = editData.data.imgSrc.length - 1; i >= 0; i--) {
          files[i] = {
            filePaths: editData.data.imgSrc[i],
            imgSrc: editData.data.imgSrc[i],
            isFileReal: true,
          }
        }
        //判断一个对象数组中是否存在某个对象, 可将他们都转为string, 用indexof来检测
        if (JSON.stringify(files).indexOf(JSON.stringify({
            filePaths: '',
            isFileReal: false
          })) === -1) {
          files.push({
            filePaths: '',
            isFileReal: false
          })
        }

      }

      this.setData({
        editData: editData.data,
        isEdit: true,
        files: files
      })
    } 
   
  },

  onHide: function () {

  },

  onUnload: function () {

  },

  imgUpload(e) {
    let that = this;
    let files = that.data.files;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let filePaths = res.tempFilePaths;
        let uploadImg = res.tempFiles[0];
        
        if (files.length < 6) {
          if (files.length === 5) {
            files[4] = {
              filePaths: filePaths[0],
              isFileReal: true
            }
          } else {
            files.unshift({
              filePaths: filePaths[0],
              isFileReal: true
            })
          }
        }

          if (wx.getStorageSync('editData')) {
            let editData = wx.getStorageSync('editData')
            let imgSrc = editData.data.imgSrc || []
            imgSrc.unshift(filePaths[0]);
            wx.setStorageSync('editData', editData)
          } 

        let data = {
          s: 'App.CDN.UploadImg' 
        }
        let datas = okayapi.enryptData(data);   
        
        let url = app.globalData.okayApiHost + '/?s=App.CDN.UploadImg'

        wx.uploadFile({
          url: url,
          filePath: filePaths[0],
          name: 'file',
          header: {
            'content-type': 'multipart/form-data'
          },
          formData: datas,
          success: function (wxRes) {
            let res = JSON.parse(wxRes.data);
            if (res.data && res.data.err_code === 0) {
              // 将上传接口返回的图片url存到files中
              let newFiles = files;
              newFiles[0]['imgSrc'] = res.data.url
              that.setData({
                files: newFiles
              })
              
            } else {
              console.log('上传失败', res);
            }
          }
        })

      },

      fail: function () {

      }
    })
  },
/* 更新帖子有两点bug待解决: 1.不能先输文字信息, 只能先更换图片, 不然输的文字信息会被onshow函数重置; 2.收藏状态不能更新 */
  submitData(e) {
    let data = e.detail.value;
    let imgSrc = [];
    data['userid'] = wx.getStorageSync('openid');
    data['user'] = this.data.userInfo.nickName;
    data['collected_count'] = 0;
    let files = this.data.files

    if (files.length > 1) {
      let databaseImgSRCLength
      if (this.data.editData && this.data.editData.imgSrc){
       databaseImgSRCLength = this.data.editData.imgSrc.length}
      else {  databaseImgSRCLength = 0}
      for (let i = 0; i < files.length; i++) {
        if (files[i].imgSrc) {
          imgSrc.push(files[i].imgSrc)
        }}
      if (imgSrc.length < databaseImgSRCLength) {
        for (let j = imgSrc.length; j < databaseImgSRCLength; j++){
          imgSrc[j] = "";
        }}
      data['imgSrc'] = imgSrc
    } else {
      data['imgSrc'] = ''
    }

    //发布前先检空
    if (this.checkEmpty(data)) {
      //如果是发布不是更新
      if (!this.data.isEdit) {
        let datas = {
          data: JSON.stringify(data),
          key: 'postList',
          keyword: String(data.title + data.userid),
          s: 'App.Main_Set.Add'
        };

        util.http(app.globalData.okayApiHost, 2, datas, this.submitSuccess);

      } //如果是更新
      else {
        let updateData = data;
        let editData = wx.getStorageSync('editData')
        updateData.collected_count = editData.data.collected_count || 0;
        if (!updateData.category){
          updateData.category = editData.data.category
        }
        let datas = {
          s: 'App.Main_Set.Update',
          id: editData.id,
          data: JSON.stringify(updateData)
        }
        this.setData({
          isEdit: false
        })

        util.http(app.globalData.okayApiHost, 2, datas, this.submitSuccess);
      }
    }

    if (wx.getStorageSync('editData')) {
      wx.removeStorageSync('editData')
    }

  },


  checkEmpty(e) {
    let title = e.title.trim();
    let contact = e.contact.trim();

    if (contact === '') {
      if (title === '') {
        this.showTopTips('至少写上标题吧', 2500)
      } else {
        this.showTopTips('为了诚意,请留下联系方式', 2500)
      }
    } else {
      if (title === '') {
        this.showTopTips('标题写点什么说明下你的想法吧', 2500)
      } else {
        return true
      }
    }

  },

  radioChange(e) {
    this.setData({
      radioCheckVal: e.detail.value

    })
  },

  submitSuccess() {
    this.showTopTips('发布成功, 您可以继续发布或者前去查看', 2600, 'blue')

  },

  deleteUploadImg(e) {
    let files = this.data.files
    let id = e.currentTarget.dataset.imgid

    if (id < 4) {
      files.splice(id, 1);
    } else {
      files[id] = {
        filePaths: '',
        isFileReal: false
      }
    }
    this.setData({
      files: files
    })

    if (wx.getStorageSync('editData')) {
      let editData = wx.getStorageSync('editData')
      editData.data.imgSrc.splice(id, 1);
      wx.setStorageSync('editData', editData)
    }

  },

  //toptips弹出框
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