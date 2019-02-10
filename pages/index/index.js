//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    //markers:[],
    count:0,
    hasMarkers:false, //添加这个变量是为了防止map只再初始化渲染一次的bug
    sub_count: 0,
    magnifier: false
  },
  //查询点是否在面内
  isPointInPolygon:function(iterable,latitude,longitude){
    var iSum, iCount, iIndex;
    var dLon1 = 0, dLon2 = 0, dLat1 = 0, dLat2 = 0, dLon;
    var ALat = latitude;
    var ALon = longitude;
    if (iterable.length < 3) {
      return false;
    }
    iSum = 0;
    iCount = iterable.length;
    
    //List <BPoint> ps = mapSheet.BPoints;
    for (iIndex = 0; iIndex < iCount; iIndex++) {
      if (iIndex == iCount - 1) {
        dLon1 = iterable[iIndex].longitude;
        dLat1 = iterable[iIndex].latitude;
        dLon2 = iterable[0].longitude;
        dLat2 = iterable[0].latitude;
      }
      else {
        dLon1 = iterable[iIndex].longitude;
        dLat1 = iterable[iIndex].latitude;
        dLon2 = iterable[iIndex + 1].longitude;
        dLat2 = iterable[iIndex + 1].latitude;
      }
      // 以下语句判断A点是否在边的两端点的水平平行线之间，在则可能有交点，开始判断交点是否在左射线上  
      if (((ALat >= dLat1) && (ALat < dLat2)) || ((ALat >= dLat2) && (ALat < dLat1))) {
        if (Math.abs(dLat1 - dLat2) > 0) {
          //得到 A点向左射线与边的交点的x坐标： 
          //dLon = ((ALon - dLon1) * (dLon2 - dLon1) * (dLat1 - dLat2) + (dLat1 - dLat2) * (dLat1 - dLat2) * ALat + (dLon2 - dLon1) * (dLon2 - dLon1) * dLat1) / ((dLat1 - dLat2) * (dLat1 - dLat2) + (dLon2 - dLon1) * (dLon2 - dLon1));
          dLon = dLon1 - ((dLon1 - dLon2) * (dLat1 - ALat)) / (dLat1 - dLat2);
          // 如果交点在A点左侧，则射线与边的全部交点数加一：  
          if (dLon < ALon) {
            iSum++;
          }
        }
      }
    }
    if ((iSum % 2) != 0) {
      return true;
    }
    return false;
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
  magnifierChange: function (e) {
    if (e.detail.value) {
      //开启放大镜功能
      this.setData({
        magnifier: true
      });
    } else {
      this.setData({
        magnifier: false,
        sub_polygons: [],
        sub_count: 0,
        sub_markers: []
      });
    }

  },
  markertap:function(res){
    if (!this.data.magnifier) {
      return;
    }
    var sub_markers = [];
    //console.log(res);
    var lat = ''; // 获取点击的markers经纬度
    var lon = ''; // 获取点击的markers经纬度
    var markerId = res.markerId;// 获取点击的markers id
    var latdiffer = 0.01; //纬差
    var londiffer = 0.01; //经差
    const jsonJs = require("./json.js")
    var dataArray = jsonJs.data.alcohol_data
    this.setData({
      alcohol_data: dataArray
    })
    var markers = this.createMarkers(this.data.alcohol_data)
    for (var item of markers) {
      if (item.id === markerId) {
        lat = item.latitude;
        lon = item.longitude;
        console.log(item);
      }
    }
    lat = parseFloat(lat);
    lon = parseFloat(lon);
    var points = [{ latitude: lat - latdiffer, longitude: lon - londiffer }, { latitude: lat - latdiffer, longitude: lon + londiffer }, { latitude: lat + latdiffer, longitude: lon + londiffer }, { latitude: lat + latdiffer, longitude: lon - londiffer}];
    this.setData({
      sub_polygons: [{
        points: points
      }]
    });
    for (var item of markers) {
        if(this.isPointInPolygon(points,item.latitude,item.longitude)){
          sub_markers.push(item);
        }
    }
    this.setData({
      sub_markers: sub_markers,
      sub_count: sub_markers.length
    })
    console.log(sub_markers);
    console.log(points);
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
      //这个地方设置markers属性值，不管前面是否定义markers，markers已经有了
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