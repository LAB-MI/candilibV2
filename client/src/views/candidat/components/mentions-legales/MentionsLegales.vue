<template>
  <div class="conrainer">
  <div class="section-header">
    <h2 class="page-title">Mentions légales</h2>
    <p class="date-info">Modifié le 21 décembre 2018</p>
  </div>
    <div v-for="(item, index) in ArrayContent" :key="index">
      <mentions-legales-content
        :icon="item.icon"
        :mainTitle="item.mainTitle"
        :textContent="item.textContent"
        :listInfo="item.listInfo"
      />
    </div>
  </div>
</template>

<script>

import MentionsLegalesContent from './MentionsLegalesContent.vue'
import { mentionsLegalesJson } from './MentionsLegalesJson'

export default {
  name: 'mentions-legales',
  components: {
    MentionsLegalesContent,
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

  .conrainer {
    position: relative;
    width: 100%;
    height: auto;
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
    max-width: 740px;
    font-family: "Poppins", sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    text-align: left;
  }

  .section-header {
    position: relative;
    margin-bottom: 60px;
    padding-bottom: 20px;
  }
</style>
