const ApiRootUrl = 'http://localhost:5000/'

const api = {
  // 使用util的request方法，字符串变量即可
  // 微信登录
  getOpenApiByJs: ApiRootUrl + 'api/token/login',
}

export default api