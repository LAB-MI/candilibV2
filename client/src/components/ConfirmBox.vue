<template>
  <div class="with-margin">
    <div
      class="u-full-width  u-flex  u-flex--column  u-flex--center"
    >
      <slot />
      <div>
        <v-btn
          outlined
          color="info"
          :aria-disabled="disabled"
          :disabled="disabled"
          @click="closeAction"
        >
          <v-icon>
            arrow_back_ios
          </v-icon>
          {{ cancelButtonText }}
        </v-btn>
        <v-btn
          :color="okButtonColor"
          :aria-disabled="disabled"
          :disabled="disabled || disabledOk"
          @click="submitAction"
        >
          {{ okButtonText }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    closeAction: {
      type: Function,
      default () {},
    },
    submitAction: {
      type: Function,
      default () {},
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    cancelButtonText: {
      type: String,
      default: 'Retour',
    },
    okButtonText: {
      type: String,
      default: 'Valider',
    },
    okButtonColor: {
      type: String,
      default: 'success',
    },
    disabledOk: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="stylus">
.with-margin {
  margin: 1em;
}
</style>
