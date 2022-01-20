<template>
  <q-page class="login-page flex column items-center justify-evenly">
    <img src="~assets/logo.svg" alt="">
    <q-card flat class="card">

        <p class="fs-30 q-mb-sm text-weight-bold text-center">Вход для сотрудников</p>
        <p class="fs-18 text-center text-grey-blue q-mb-xl">Введите ваши данные для авторизации</p>
        <q-form class="q-mb-xl" @submit="userLoginAction">
           <q-input class="q-mb-lg" rounded outlined  v-model="userLogin.email" label="Email" />
           <q-input class="q-mb-lg" rounded outlined  v-model="userLogin.password" label="Пароль" />
          <q-btn :ripple="false"  color="primary" type="submit" unelevated rounded no-caps size="18px" class="full-width text-bold q-py-md" label="Войти"/>
        </q-form>


    </q-card>
      <p class="no-margin fs-18 text-grey-blue text-weight-medium">Забыли пароль? <span class="text-primary cursor-pointer link">Восстановить пароль</span></p>
  </q-page>
</template>
<script>

import { mapActions } from 'vuex'
export default {

  data () {
    return {
      is_password_recover:false,
      is_loading:false,
      isPwd:true,
      userLogin:{
        email:null,
        password:null,
        is_social_register:false,
      },
      recover_email:null,
      email_re:/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

    }
  },
  methods:{
    ... mapActions('auth',['loginUser']),

    userLoginAction() {
      this.is_loading = true
      this.loginUser(this.userLogin)
      this.is_loading = false
    },

  }
}
</script>
<style lang="sass" >
.login-page
  background: #f2f6ff
.card
  padding: 54px
  border-radius: 30px
  width: 640px


</style>
