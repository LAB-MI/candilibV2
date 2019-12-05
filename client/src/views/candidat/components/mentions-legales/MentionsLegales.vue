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

    <page-title>Mentions légales</page-title>

    <h3 class="date-info">
      Modifié le 21 décembre 2018
    </h3>

    <section class="mentions-legales">
      <div
        v-for="content in ArrayContent"
        :key="content.mainTitle"
      >
        <mentions-legales-content
          :icon="content.icon"
          :main-title="content.mainTitle"
          :text-content="content.textContent"
          :list-info="content.listInfo"
        />
      </div>
    </section>
  </v-card>
</template>

<script>
import MentionsLegalesContent from './MentionsLegalesContent.vue'
import { mentionsLegalesJson } from './MentionsLegalesJson'

export default {
  name: 'MentionsLegales',
  components: {
    MentionsLegalesContent,
  },

  data () {
    return {
      ArrayContent: mentionsLegalesJson,
    }
  },

  computed: {
    me () {
      return this.$store.state.candidat.me
    },
  },

  methods: {
    goBack () {
      this.$router.back()
    },
  },
}
</script>

<style scoped>
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
    padding-top: 0;
  }

  .mentions-legales {
    padding: 0 1em;
  }

  .section-header {
    position: relative;
    margin-bottom: 60px;
    padding-bottom: 20px;
  }
</style>
