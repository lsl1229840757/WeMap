//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    markers: [],
    sub_count: 0,
    magnifier: false,
    hasMarkers: false, //添加这个变量是为了防止map只再初始化渲染一次的bug
    circles: [{
      latitude: 30.600861,
      longitude: 114.262947,
      radius: 3000
    }]
  },
  magnifierTap: function(e) {
    if (!this.data.magnifier) {
      return;
    }
    for (var item of this.data.markers) {
      if (item.id == e.markerId) {
        this.isInCircle({
          latitude: item.latitude,
          longitude: item.longitude,
          radius: 3000
        }, this.data.markers)
      }
    }
  },

  rad: function(d) {
    return d * Math.PI / 180.0;
  },
  GetDistance: function(lat1, lng1, lat2, lng2) {
    var EARTH_RADIUS = 6378.137; //地球半径
    var radLat1 = this.rad(lat1);
    var radLat2 = this.rad(lat2);
    var a = radLat1 - radLat2;
    var b = this.rad(lng1) - this.rad(lng2);
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * EARTH_RADIUS;
    return s;
  },
  isInCircle: function(cirlce, datas) {
    var sub_markers = []
    var count = 0;
    for (var data of datas) {
      var distance = this.GetDistance(data.latitude, data.longitude, cirlce.latitude, cirlce.longitude)
      if (distance <= 3) {
        if (distance == 0) {
          this.setData({
            sub_circles: [{
              latitude: data.latitude,
              longitude: data.longitude,
              radius: 3000
            }],
            sub_circles_lat: data.latitude,
            sub_circles_lng: data.longitude
          })
        }
        sub_markers.push(data)
      }      
    }
    var density = sub_markers.length / (Math.PI * 3 * 3)
    this.setData({
      sub_markers: sub_markers,
      sub_count: sub_markers.length,
      density:density.toFixed(2),
    })
  },
  magnifierChange: function(e) {
    if (e.detail.value) {
      //开启放大镜功能
      this.setData({
        magnifier: true
      });
    } else {
      this.setData({
        magnifier: false,
        sub_circles: [],
        sub_count: 0,
        sub_markers: []
      });
    }
  },
  clearMarker:function(e){
      this.setData({
        sub_circles: [],
        sub_count: 0,
        sub_markers: []
      })
  },
  createMarkers: function(iterable) {
    var markers = []
    for (var i = 0; i < iterable.length; i++) {
      var marker = {
        iconPath: '../images/markers.png',
        id: i,
        latitude: iterable[i].lat,
        longitude: iterable[i].lng,
        width: 8,
        height: 8
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
    var markers = this.createMarkers(jsonJs.data.alcohol_data)
    this.setData({
      markers: markers,
      hasMarkers: true
    })
  },

  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})