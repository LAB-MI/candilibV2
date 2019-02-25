<template>
  <div @click="showFaqContent">
    <a class="link-style">
      {{ item.title }}
        <i v-if="!status" class="material-icons i-style">
          {{ 'add_circle' }}
        </i>
        <i v-if="status" class="material-icons i-style" style="color: #f8234a;">
          {{ 'remove_circle' }}
        </i>
    </a>
    <transition name="fade">
      <div v-if="status" class="content-question-style">
        <div v-for="(elem, index) in item.content" :key="index">
          <h4 v-if="elem.subTitleContent" v-html="elem.subTitleContent">{{ elem.subTitleContent }}</h4> <br v-if="elem.subTitleContent">
          <p v-if="elem.textContent" v-html="elem.textContent">{{ elem.textContent }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'faq',
  props: {
    item: Object,
  },
  data () {
    return {
      status: false,
    }
  },
  computed: {
  },
  methods: {
    showFaqContent () {
      this.status = !this.status
    },
  },
}
</script>

<style>
  .link-style {
    border-bottom: 1px solid #ddd;
    float: right;
    width: 100%;
    color: #000;
    padding: 18px 0;
    padding-right: 0px;
    position: relative;
    font-family: "Raleway", sans-serif;
    font-size: 16px;
    line-height: 24px;
    font-weight: 600;
    padding-right: 20px;
    text-decoration: none;
    left: 5%;
  }
  .i-style {
    position: absolute;
    font-size: 24px;
    right: 0;
    top: 20px;
  }
  .content-question-style {
    width: 90%;
    color: #212529;
    margin-left: 25px;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity .4s;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
  /* link-in-text-style ce trouve dans le fichier Json */
  .link-in-text-style {
    text-decoration-line:none;
  }
</style>
