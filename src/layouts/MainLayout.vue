<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-grey-9" bordered>
      <q-toolbar class="constrain">
        <q-btn
          icon="fa-solid fa-camera"
          flat
          round
          to="/camera"
          class="large-screen-only"
        />
        <q-separator vertical spaced class="large-screen-only" />
        <q-toolbar-title class="font-grand-hotel text-bold">
          Finstagram
        </q-toolbar-title>
        <q-btn
          icon="fa-solid fa-house"
          flat
          round
          to="/"
          class="large-screen-only"
        />
      </q-toolbar>
    </q-header>

    <q-footer class="bg-white small-screen-only" bordered>
      <q-tabs
        class="text-grey-9"
        active-color="primary"
        indicator-color="transparent"
      >
        <q-route-tab to="/" icon="fa-solid fa-house" />
        <q-route-tab to="/camera" icon="fa-solid fa-camera" />
      </q-tabs>
    </q-footer>

    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "MainLayout",

  components: {},
});
</script>

<style lang="sass">
.q-toolbar
  @media (min-width: $breakpoint-sm-min)
    height: 75px
.q-toolbar__title
  font-size: 2rem
  @media (max-width: $breakpoint-xs-max)
    text-align: center
</style>
