<template>
  <v-card>
    <v-btn
      v-if="!me"
      fixed
      dark
      fab
      left
      @click="goBack"
    >
      <v-icon>arrow_back</v-icon>
    </v-btn>

    <page-title>
      F.A.Q
    </page-title>

    <h3 class="subtitle">
      Foire aux questions
    </h3>
    <ul class="list-faq">
      <li class="question-wrapper">
        <faq-covid-message />
      </li>
      <li
        v-for="question in faqQuestions"
        :key="question.title"
        class="question-wrapper"
      >
        <faq-content :question="question" />
      </li>
    </ul>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

import { FETCH_CONFIG_REQUEST, FETCH_DEPARTEMENTS_REQUEST, FETCH_PARIS_CENTERS_REQUEST } from '@/store'
import FaqContent from './FaqContent.vue'
import { faqJson } from './FaqJson'
import FaqCovidMessage from './FaqCOVIDMessage'
export default {
  name: 'Faq',
  components: {
    FaqContent,
    FaqCovidMessage,
  },

  data () {
    return {
    }
  },

  computed: {
    ...mapState({
      lineDelay (state) { return state.config.lineDelay },
      departements (state) { return state.departements.list },
      parisCenters (state) { return state.parisCenters.list },
      me (state) { return state.candidat.me },
    }),

    faqQuestions () {
      return faqJson(this.lineDelay, this.departements, this.parisCenters)
    },
  },

  mounted () {
    this.$store.dispatch(FETCH_CONFIG_REQUEST)
    this.$store.dispatch(FETCH_DEPARTEMENTS_REQUEST)
    this.$store.dispatch(FETCH_PARIS_CENTERS_REQUEST)
  },

  methods: {
    goBack () {
      this.$router.back()
    },
  },
}
</script>

<style lang="stylus" scoped>
  .section-header {
    margin-top: 5%;
    margin-bottom: 0;
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

  .list-faq {
    padding: 0 1em;
  }

  .question-wrapper {
    list-style: none;
  }
</style>
