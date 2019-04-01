<template>
  <v-dialog v-model="dialog" persistent max-width="290">
    <template v-slot:activator="{ on }">
      <v-btn color="#f82249" dark v-on="on">
        {{ $formatMessage({ id: 'recap_reservation_boutton_annuler' }) }}
        &nbsp;
        <v-icon>
          delete_forever
        </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-form
        class="u-full-width"
        :aria-disabled="disabled"
        :disabled="disabled"
        @submit.prevent="confirmReservationModif"
      >
        <v-card-title class="headline">
          Confirmer la modification
        </v-card-title>
        <v-card-text>
          Text Content
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="info"
            class="  u-flex  u-flex--center"
            outline
            :aria-disabled="disabled"
            :disabled="disabled"
            @click="dialog = false"
          >
            <v-icon>
              arrow_back_ios
            </v-icon>
            {{ $formatMessage({ id: 'recap_reservation_modal_annuler_boutton_retour' }) }}
          </v-btn>
          <v-btn
            color="error darken-1  u-flex  u-flex--center"
            :aria-disabled="disabled"
            :disabled="disabled"
            type="submit"
          >
            <span>
              {{ $formatMessage({ id: 'recap_reservation_modal_annuler_boutton_confirmer' }) }}
            </span>
            <v-icon>
              warning
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    confirmReservationModif: Function,
  },
  data () {
    return {
      dialog: false,
    }
  },
}
</script>
