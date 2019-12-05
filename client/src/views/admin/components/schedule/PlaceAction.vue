<template>
  <div>
    <div
      class="u-flex  u-flex--center  u-flex--column  u-full-width"
    >
      <v-btn
        v-if="activeTextContent"
        class="white--text"
        :color="colorSubmitButton"
        :loading="isLoading"
        :aria-disabled="isLoading"
        :disabled="isLoading"
        @click="submitDial"
      >
        <v-icon
          :color="colorIcon"
          large
        >
          {{ icon }}
        </v-icon>
        &nbsp;
        {{ textContent }}
      </v-btn>
      <slot name="title" />
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    activeTextContent: {
      type: Boolean,
      default: true,
    },
    closeDialog: {
      type: Function,
      default () {},
    },
    colorIcon: {
      type: String,
      default: '',
    },
    colorSubmitButton: {
      type: String,
      default: '',
    },
    colorAlert: {
      type: String,
      default: '',
    },
    content: {
      type: Object,
      default () {},
    },
    icon: {
      type: String,
      default: '',
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    textButtonCancel: {
      type: String,
      default: '',
    },
    textContent: {
      type: String,
      default: '',
    },
  },

  methods: {
    submitDial () {
      this.$emit('click')
    },
  },
}
</script>
