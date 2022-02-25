<template>
  <v-expand-transition>
    <li>
      <v-icon
        small
        :class="{valid}"
      >
        {{ valid ? "check" : "close" }}
      </v-icon>
      <span :class="{valid}">{{ text }}</span>
    </li>
  </v-expand-transition>
</template>

<script>
export default {
  name: 'CandilibChecker',
  props: {
    valid: Boolean,
    text: {
      type: String,
      default: '',
    },
  },
}
</script>

<style scoped>
.expand-transition-leave {
  transition-duration: 1s;
}

.valid {
  color: green;
}
</style>
