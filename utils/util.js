import api from './api.js'

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const request = (url, data = {}, method = 'GET') => {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': 'application/json',
        "Authorization": "Bearer " + wx.getStorageSync('token')
      },
      success: function (res) {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          if (res.statusCode === 401) {
             wechatLogin().then((res) => {
               var code = res.code;
               request(api.getOpenApiByJs, {
                 AppId: 'wxdeb9a8a2cb0cadca',
                 Code: code
               }, 'POST').then(function (res) {
                 var token = res.result
                 wx.setStorageSync('token', token);
                 return request(url, data, method)
               })
             })
          } else {
            reject(res.data)
          }
        }
      },
      fail: function(err) {
        reject(err)
      }
    })
  })
}


const checkWeChatSession = () => {
  return new Promise(function (resolve, reject) {
    wx.checkSession({
      success: function () {
        resolve(true);
      },
      fail: function () {
        reject(false);
      }
    })
  })
}

const wechatLogin = () => {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        if (res.code) {
          // 登录远程服务器
          // console.log('微信登陆成功', res)
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  })
}

const getWechatUserInfo = () => {
  return new Promise(function (resolve, reject) {
    // 查看button是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            withCredentials: true,
            success: function (res) {
              // console.log('获取用户信息成功', res);
              resolve(res);
            },
            fail: function (err) {
              // console.log('获取用户信息失败', err);
              reject(err);
            }
          })
        } else { // 没有授权
          // console.log('但获取用户信息失败，未同意button授权');
        }
      }
    })
  });
}

module.exports = {
  formatTime: formatTime,
  request: request,
  checkWeChatSession: checkWeChatSession,
  wechatLogin: wechatLogin,
  getWechatUserInfo: getWechatUserInfo
}
