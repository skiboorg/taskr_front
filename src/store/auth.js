import { api } from 'boot/axios'
import { Cookies } from 'quasar'
import { Notify } from 'quasar'



const state = () => ({
  user:{},
  notifications_count:[],
  loggedIn:false,
  socket:null

})

const mutations = {
  updateUser(state,data){
    state.user = data
  },
  updateUserStatus(state,data){
    state.loggedIn = data
  },
  updateSocket(state,data){
    state.socket = data
  },

}

const actions = {


  loginUser({dispatch},data){
    api.post('/auth/token/login/',data)
      .then(response=>{
        Cookies.set('auth_token',response.data.auth_token)
        api.defaults.headers.common['Authorization'] = 'Token ' + response.data.auth_token
        dispatch('getUser',true)
      })
      .catch(function (error) {
        Notify.create(
          {
            message: Cookies.get('lang') === 'ru' ? 'Пользователь не найден':'User not found',
            position:'top-right',
            color: 'red'
          }
        )
      })

  },
  async getUser ({commit,dispatch},redirect) {
    console.log('getting user')

    const response = await api.get('/api/user/me/')
    //console.log('getUser', response.data)
    commit('updateUser', response.data)
    commit('updateUserStatus', true)
    if (redirect){
        await this.$router.push('/projects')

    }
  },

  logoutUser({commit}){
   commit('updateUser', {})
    commit('updateUserStatus', false)
  }
}

export const getters = {
  isLoggedIn: (state) => state.loggedIn,
  user: (state) => state.user,
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
