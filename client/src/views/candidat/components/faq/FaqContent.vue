<template>
  <div class="question">
    <h3
      class="question-title  u-flex  u-flex--space-between"
      :class="{ 'primary--text': active }"
      @click="toggleActive"
      v-ripple
    >
      <span>{{ question.title }}</span>
      <i class="material-icons  icon" :class="{ 'primary--text': active }">
        {{ active ? 'keyboard_arrow_up' : 'keyboard_arrow_down' }}
      </i>
    </h3>
    <div v-show="active" class="question-content">
      <div v-for="content in question.content" :key="content.textContent">
        <h4
          class="question-subtitle"
          v-if="content.subTitleContent"
          v-html="content.subTitleContent"
        />
        <p v-if="content.textContent" v-html="content.textContent"></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'faq',
  props: {
    question: Object,
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

<style lang="scss" scoped>
.question {
  border-bottom: 1px solid #ddd;

  &-title {
    padding: 1em 0;
    font-size: 16px;
    font-family: "Raleway", sans-serif;
    color: #000;
    cursor: pointer;
  }

  &-content {
    color: #212529;
  }

  &-subtitle {
    margin-bottom: 0.6em;
  }
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
