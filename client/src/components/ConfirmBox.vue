<template>
  <div class="with-margin">
    <div
      class="u-full-width  u-flex  u-flex--column  u-flex--center"
    >
      <slot/>
      <div>
        <v-btn
          outline
          color="info"
          @click="closeAction"
          :aria-disabled="disabled"
          :disabled="disabled"
        >
          <v-icon>
            arrow_back_ios
          </v-icon>
          {{cancelButtonText}}
        </v-btn>
        <v-btn
          :color="okButtonColor"
          @click="submitAction"
          :aria-disabled="disabled"
          :disabled="disabled"
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
    closeAction: Function,
    submitAction: Function,
    disabled: Boolean,
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
  },
}
</script>

<style lang="stylus">

.with-margin {
  margin: 1em;
}

</style>
