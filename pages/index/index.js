//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    markers:[],
    hasMarkers:false //添加这个变量是为了防止map只再初始化渲染一次的bug
  },
  createMarkers: function (iterable) {
    var markers = []
    for (var i = 0; i < iterable.length; i++) {
      var marker = {
        iconPath: '../images/markers.png',
        id: i,
        latitude: iterable[i].lat,
        longitude: iterable[i].lng,
        width: 5,
        height: 5
      }
      markers.push(marker)
    };
    return markers;
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    //这里读取完用户信息之后完成醉酒json文件的载入
    const jsonJs = require("./json.js")
    var dataArray = jsonJs.data.alcohol_data
    this.setData({
      alcohol_data: dataArray
    })
    var markers = this.createMarkers(this.data.alcohol_data)
    this.setData({
       markers:markers,
       hasMarkers:true
      })
  },

  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})