<template>
  <v-card class="u-max-width">
    <v-btn
      fab
      left
      dark
      color="#169DB2"
      @click="goBack"
      class="back-button"
    >
      <v-icon>arrow_back</v-icon>
    </v-btn>
    <v-card-title style="margin-top: -60px;">
      <section class="u-max-width">
        <header class="candidat-section-header">
          <h2 class="candidat-section-header__title">
            Mentions légales
          </h2>
        </header>
      </section>
    </v-card-title>
    <p class="date-info">Modifié le 21 décembre 2018</p>
    <div class="list">
      <div v-for="(item, index) in ArrayContent" :key="index">
        <mentions-legales-content
          :icon="item.icon"
          :mainTitle="item.mainTitle"
          :textContent="item.textContent"
          :listInfo="item.listInfo"
        />
      </div>
    </div>
  </v-card>
</template>

<script>

import MentionsLegalesContent from './MentionsLegalesContent.vue'
import { mentionsLegalesJson } from './MentionsLegalesJson'

export default {
  name: 'mentions-legales',
  components: {
    MentionsLegalesContent,
  },

  methods: {
    goBack () {
      this.$router.back()
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
  .back-button {
    height: 42px;
    width: 42px;
    position: fixed;
    position: sticky;
    top: 90px;
    transform: translateX(100%);
    z-index: 4;

    @media (max-width: 639px) {
      transform: none;
    }
  }

  .list {
    padding: 0 2em;
  }

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

  .section-header {
    position: relative;
    margin-bottom: 60px;
    padding-bottom: 20px;
  }
</style>
