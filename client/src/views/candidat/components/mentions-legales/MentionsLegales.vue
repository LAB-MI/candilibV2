<template>
  <v-card class="u-max-width">
    <v-card-title>
      <candidat-title title="Mentions légales" />
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
import CandidatTitle from '@/views/candidat/components/CandidatTitle.vue'
import MentionsLegalesContent from './MentionsLegalesContent.vue'
import { mentionsLegalesJson } from './MentionsLegalesJson'

export default {
  name: 'mentions-legales',
  components: {
    CandidatTitle,
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
