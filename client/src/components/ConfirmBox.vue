<template>
  <div class= "test">
    <div
      class="u-full-width  u-flex  u-flex--column  u-flex--center"
    >
      <slot/>
      <div d-flex>
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
          Retour
        </v-btn>
        <v-btn
          color="success"
          @click="submitAction"
          :aria-disabled="disabled"
          :disabled="disabled"
        >
          Valider
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
  },
}
</script>

<style lang="stylus">

.test {
  margin: 1em;
}

</style>
