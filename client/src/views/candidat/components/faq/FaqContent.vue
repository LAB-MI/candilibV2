<template>
  <div class="" @click="toggleActive">
    <h3 class="link  u-flex  u-flex--space-between" :class="{ active }">
      <span>{{ item.title }}</span>
      <i class="material-icons  icon" :class="{ active }">
        {{ active ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}
      </i>
    </h3>
    <div v-show="active" class="content-question">
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
      active: false,
    }
  },
  methods: {
    toggleActive () {
      this.active = !this.active
    },
  },
}
</script>

<style>
  .link {
    border-bottom: 1px solid #ddd;
    width: 100%;
    padding: 1em 0;
    font-size: 16px;
    line-height: 24px;
    font-family: "Raleway", sans-serif;
    font-weight: 600;
    color: #000;
    text-decoration: none;
    cursor: pointer;
  }

  .icon.active,
  .active {
    color: #169db2;
  }

  .icon {
    font-size: 24px;
    color: #000;
  }

  .content-question {
    color: #212529;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.4s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

  .link-in-text {
    text-decoration-line: none;
  }
</style>
