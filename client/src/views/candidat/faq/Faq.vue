<template>
<div>
  <h2>
    FAQ
  </h2>
  <ul>
   <li v-for="(item, index) in arrayContent" :key="index">
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
  }
}
</script>

<style>

</style>
