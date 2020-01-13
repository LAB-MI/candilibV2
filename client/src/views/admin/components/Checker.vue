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
  props: {
    valid: Boolean,
    text: {
      type: String,
      default: '',
    },
  },
}
</script>

<style lang="stylus" scoped>
.expand-transition-leave {
  transition-duration: 1s;
}

.valid {
  color: green;
}
</style>
