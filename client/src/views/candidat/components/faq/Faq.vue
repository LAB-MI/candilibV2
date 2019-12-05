<template>
  <v-card>
    <v-btn
      fixed
      dark
      fab
      left
      @click="goBack"
      v-if="!me"
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
      <li
        class="question-wrapper"
        v-for="question in arrayContent"
        :key="question.title"
      >
        <faq-content :question="question" />
      </li>
    </ul>
  </v-card>
</template>

<script>
import FaqContent from './FaqContent.vue'
import { faqJson } from './FaqJson'

export default {
  name: 'Faq',
  components: {
    FaqContent,
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
      arrayContent: faqJson,
    }
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
