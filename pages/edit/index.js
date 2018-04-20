Page({


  data: {
      items: [{
          name: 'USA',
          value: '求助'
        },
        {
          name: 'CHN',
          value: '闲置',
          checked: 'true'
        },
        {
          name: 'BRA',
          value: '转赠'
        },
        {
          name: 'JPN',
          value: '兼职'
        }
      ],
      radioCheckVal:''

  },


  onLoad: function (options) {

  },


  onReady: function () {

  },

  radioChange(e) {
    this.setData({
      radioCheckVal: e.detail.value
    })
//  console.log(e, this.data.radioCheckVal);
  }
})