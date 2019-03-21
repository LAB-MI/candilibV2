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
            F.A.Q
          </h2>
        </header>
      </section>
    </v-card-title>
    <p class="subtitle">
      Foire aux questions
    </p>
    <ul class="list-faq">
      <li class="question" v-for="(item, index) in arrayContent" :key="index">
        <faq-content :item="item"/>
      </li>
    </ul>
  </v-card>
</template>

<script>
import FaqContent from './FaqContent.vue'
import { faqJson } from './FaqJson'

export default {
  name: 'faq',
  components: {
    FaqContent,
  },

  methods: {
    goBack () {
      this.$router.back()
    },
  },

  data () {
    return {
      arrayContent: faqJson,
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

  .section-header {
    margin-top: -1em;
    margin-bottom: 0;
  }

  .list-faq {
    padding: 0 2em;
  }

  .title {
    font-size: 36px;
    text-transform: uppercase;
    text-align: center;
    font-weight: 700;
    margin-bottom: 10px;
    padding: 0;
    color: #0e1b4d;
    font-family: "Raleway", sans-serif;
  }

  .subtitle {
    text-align: center;
    padding: 0;
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: #9195a2;
  }

  .question {
    list-style: none;
  }

  .no-padding {
    padding: 0;
  }
</style>
