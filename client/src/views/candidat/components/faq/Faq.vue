<template>
<div>
  <div class="section-header">
  <h2 class="title">
    F.A.Q
  </h2>
  <p class="p-style">Foire aux questions</p>
  </div>
  <ul class="ul-style">
    <li class="li-style" v-for="(item, index) in arrayContent" :key="index">
    <FaqContent :item="item"/>
    </li>
  </ul>
</div>
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
  },
  data () {
    return {
      arrayContent: faqJson,
    }
  },
}
</script>

<style>
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

  .p-style {
    text-align: center;
    padding: 0;
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: #9195a2;
  }

  .li-style {
    width: 80%;
    list-style: none;
  }
</style>
