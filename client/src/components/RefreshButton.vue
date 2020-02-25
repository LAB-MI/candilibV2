<template>
  <div class="refresh-btn">
    <v-btn
      icon
      :raised="raised"
      :color="colorBtn"
      :disabled="isLoading"
      @click="onClick"
    >
      <v-progress-circular
        v-show="isLoading"
        indeterminate
        :color="isLoading ? 'primary' : 'white'"
      />
      <v-icon v-show="!isLoading">
        replay
      </v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  props: {
    colorBtn: {
      type: String,
      default: 'primary',
    },
    isLoading: Boolean,
    bgColor: {
      type: String,
      default: 'primary',
    },
    raised: {
      type: Boolean,
      default: true,
    },
  },

  methods: {
    onClick () {
      this.$emit('click')
    },
  },
}
</script>
