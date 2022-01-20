import { boot } from 'quasar/wrappers'
import {Cookies} from "quasar";
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

const api = axios.create({ baseURL: process.env.API })
export default boot(({ app, ssrContext }) => {
  const cookies = process.env.SERVER
    ? Cookies.parseSSR(ssrContext)
    : Cookies
  let token = cookies.get('auth_token')
  if (token) {
    console.log('Token exists')
    api.defaults.headers.common['Authorization'] = 'Token ' + token
  }else{
    console.log('Token not exists')
  }
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
