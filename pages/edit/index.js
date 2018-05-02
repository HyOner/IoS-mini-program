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

    files: [{
      filePaths: '',
      isFileReal: false
    }],

  },


  onLoad: function (options) {

  },


  onReady: function () {

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
          that.setData({
            files: files
          })
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
          header: { 'content-type': 'multipart/form-data'},
          formData:datas,
          success: function (wxRes) {           
            let res = JSON.parse(wxRes.data);
            if (res.data && res.data.err_code === 0) {
              // 将上传接口返回的图片url存到files中
              let newFiles = that.data.files;
              newFiles[0]['imgSrc'] = res.data.url
              that.setData({files:newFiles})
            }
            else {console.log('上传失败', res);}
          }
        }) 
        
      },
      
      fail: function () {
        
      }
    })
  },

  submitData(e) {
    let data = e.detail.value;
    let imgSrc = [];
    data['userid'] = wx.getStorageSync('openid');
    data['collected_count'] = 0;
    let files = this.data.files
    for (let i = 0; i < files.length; i++){
      if (files[i].imgSrc) {
        imgSrc.push(files[i].imgSrc)
      }
    }      
    data['imgSrc'] = imgSrc


    if (this.checkEmpty(data)) {

      let datas = {
        data: JSON.stringify(data),
        key: 'postList',
        keyword: String(data.title+data.userid),
        s: 'App.Main_Set.Add'
      };

      util.http(app.globalData.okayApiHost, 2, datas, this.submitSuccess);

    }

  },


  checkEmpty(e) {
    let content = e.content.trim();
    let contact = e.contact.trim();

    if (contact === '') {
      if (content === '') {
        this.showTopTips('至少说一下你的想法吧', 2500)
      } else {
        this.showTopTips('为了诚意,请留下联系方式', 2500)
      }
    } else {
      if (content === '') {
        this.showTopTips('写点什么表达下你的想法吧', 2500)
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
    this.showTopTips('发布成功, 您可以继续发布或者前去查看', 2600,'blue')
 
  },

  deleteUploadImg(e) {
    let files = this.data.files
    let id = e.currentTarget.dataset.imgid


    if (id !== 4) {
      if(files.length>2){
      files.pop(files[id + 1]);
      files[id] = {
        filePaths: '',
        isFileReal: false,
      } 
      } else { files.pop(files[id]); } 
    }
    else {
      files[id] = {
        filePaths: '',
        isFileReal: false
      }
    }
    this.setData({
      files: files
    })
    
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