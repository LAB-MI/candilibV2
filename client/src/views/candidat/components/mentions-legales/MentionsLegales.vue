<template>
  <v-card class="container">
    <v-btn
      fixed
      dark
      fab
      left
      color="home-link"
      @click="goBack"
      v-if="!me"
    >
      <v-icon>arrow_back</v-icon>
    </v-btn>
    <page-title>Mentions légales</page-title>
    <h3 class="date-info">Modifié le 21 décembre 2018</h3>
    <section class="mentions-legales">
      <div v-for="content in ArrayContent" :key="content.mainTitle">
        <mentions-legales-content
          :icon="content.icon"
          :mainTitle="content.mainTitle"
          :textContent="content.textContent"
          :listInfo="content.listInfo"
        />
      </div>
    </section>
  </v-card>
</template>

<script>

import MentionsLegalesContent from './MentionsLegalesContent.vue'
import PageTitle from '@/components/PageTitle.vue'
import { mentionsLegalesJson } from './MentionsLegalesJson'

export default {
  name: 'mentions-legales',
  components: {
    MentionsLegalesContent,
    PageTitle,
  },

  methods: {
    goBack () {
      this.$router.back()
    },
  },

  computed: {
    me () {
      return this.$store.state.candidat.me
    },
  },

  data () {
    return {
      ArrayContent: mentionsLegalesJson,
    }
  },
}
</script>

<style>
  .page-title {
    font-size: 36px;
    text-transform: uppercase;
    text-align: center;
    font-weight: 700;
    margin-bottom: 10px;
    font-family: "Raleway", sans-serif;
    color: #0e1b4d;
    padding: 0;
  }

  .date-info {
    text-align: center;
    padding: 0;
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: #9195a2;
  }

  .container {
    position: relative;
    height: auto;
    font-family: "Poppins", sans-serif;
    line-height: 1.5;
    color: #212529;
  }

  .mentions-legales {
    margin-top: 4em;
  }

  .section-header {
    position: relative;
    margin-bottom: 60px;
    padding-bottom: 20px;
  }
</style>
