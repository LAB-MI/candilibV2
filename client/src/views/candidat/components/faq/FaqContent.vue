<template>
  <div @click="showFaqContent">
    <a class="link-style" :style="{ color: colorTitle }">
      {{ item.title }}
        <i v-if="!status" class="material-icons icon-style">
          {{ 'add_circle' }}
        </i>
        <i v-if="status" class="material-icons icon-style" style="color: #f8234a;">
          {{ 'remove_circle' }}
        </i>
    </a>
    <div v-if="status" class="content-question-style">
      <div v-for="(elem, index) in item.content" :key="index">
        <h4 v-if="elem.subTitleContent" v-html="elem.subTitleContent">{{ elem.subTitleContent }}</h4> <br v-if="elem.subTitleContent">
        <p v-if="elem.textContent" v-html="elem.textContent">{{ elem.textContent }}</p>
      </div>
    </div>
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
      colorTitle: '',
    }
  },
  methods: {
    showFaqContent () {
      this.status = !this.status
      this.status ? this.colorTitle = '#f8234a' : this.colorTitle = ''
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
    position: relative;
    font-family: "Raleway", sans-serif;
    font-size: 16px;
    line-height: 24px;
    font-weight: 600;
    padding-right: 20px;
    text-decoration: none;
    left: 5%;
  }

  .icon-style {
    position: absolute;
    font-size: 24px;
    right: 0;
    top: 20px;
    color: #000;
  }

  .content-question-style {
    width: 90%;
    color: #212529;
    margin-left: 5%;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.4s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

  .link-in-text-style {
    text-decoration-line: none;
  }
</style>
