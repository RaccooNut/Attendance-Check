import Vue from 'vue'
import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.prototype.$http = axios

// 創建 axios 實例
const service = axios.create({
  // url 基礎地址, 解決不同數據源 url 變化問題
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 10000
  // => 跨域時, 如果要發送 cookies, 把這打開
  // withCredentials: true
})

// 請求攔截
service.interceptors.request.use(
  config => {
    // can do someting
    if (store.getters.token) {
      // RFC 6750 的規範
      config.headers.Authorization = 'Bearer ' + getToken()
    }
    NProgress.start()
    return config
  },
  error => {
    // 請求錯誤處理
    // console.log(error)
    return Promise.reject(error)
  }
)

/**
 * customize code number:
 * @1 成功
 */

service.interceptors.response.use(
  response => {
    NProgress.done()
    console.log(response)
    // 數據拿著
    const res = response.data

    // 通過自定義 code 來判斷響應狀態
    // 此外也可以通過 HTTP status 來判斷, 缺點是狀態碼信息量有限
    if (res.code !== 1) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 1 * 1000
      })
      /*
      應該問HOW哥, 如果Token 有問題是給多少, 他現在Token 有問題是直接 status 500
      */
      // 返回錯誤訊息
      return Promise.reject(new Error(res.message || 'error'))
    } else {
      // 返回數據
      return res
    }
  },
  error => {
    console.log('響應錯誤:', error.response)
    Message({
      message: error.message,
      type: 'error',
      duration: 1000
    })
    return Promise.reject(error)
  }
)

export default service
