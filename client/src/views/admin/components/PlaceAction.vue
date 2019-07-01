<template>
  <div
  >
    <div
      class="u-flex  u-flex--center  u-flex--column  u-full-width"
    >
      <v-btn
        v-if="activeTextContent" class="white--text"
        :color="colorSubmitButton"
        :loading="isLoading"
        @click="submitDial"
      >
        <v-icon :color="colorIcon" large>
          {{ icon }}
        </v-icon>
        &nbsp;
        {{ textContent }}
      </v-btn>
      <slot name="title"/>
      <slot/>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    textContent: String,
    activeTextContent: {
      type: Boolean,
      default: true,
    },
    textButtonCancel: String,
    closeDialog: Function,
    content: Object,
    icon: String,
    colorIcon: String,
    colorSubmitButton: String,
    colorAlert: String,
    isLoading: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    submitDial () {
      this.$emit('click')
    },
  },
}
</script>
