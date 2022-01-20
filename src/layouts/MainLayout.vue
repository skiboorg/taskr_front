<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="header 2 q-py-md">
      <div class="container">
          <q-toolbar class="flex items-center justify-between no-padding">
        <q-avatar rounded size="56px">
          <img src="~assets/logo.svg" alt="">
        </q-avatar>

            <div class="flex items-center justify-between">
              <p class="q-mb-none q-mr-lg text-dark fs-16">Lorem ipsum.</p>
              <q-btn label="Выйти" class="text-weight-bold q-px-lg " size="18px" no-caps unelevated rounded text-color="primary" color="grey-3"/>
            </div>

        <q-btn
          class="lt-sm"
          flat
          dense
          round
          text-color="dark"
          icon="menu"
          aria-label="Menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        />


      </q-toolbar>
      </div>

    </q-header>

    <q-drawer
      v-model="mobileMenuOpen"

      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>


      </q-list>
    </q-drawer>

    <q-page-container>
      <div class="container">
          <router-view />
      </div>

    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  preFetch ({ store, currentRoute, previousRoute, redirect, ssrContext, urlPath, publicPath }) {

    if (!store.state.auth.loggedIn ) {
      redirect({ path: '/' })
    }


  },
  data(){
    return{
      mobileMenuOpen:false
    }
  }
}
</script>
<style lang="sass">
body
  background: #fdfdfd

.header
  background: #fdfdfd
</style>
