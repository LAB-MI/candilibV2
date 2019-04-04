<template>
  <v-dialog v-model="dialog" persistent max-width="290">
    <template v-slot:activator="{ on }">
      <v-btn
        dark
        v-on="on"
        :aria-disabled="disabled"
        :disabled="disabled"
        :color="colorButton"
      >
        {{ $formatMessage({ id: idButtonName }) }}
        &nbsp;
        <v-icon>
            {{ iconName }}
        </v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-form
        class="u-full-width"
        :aria-disabled="disabled"
        :disabled="disabled"
        @submit.prevent="formAction"
      >
        <v-card-title class="headline">
          {{ titleModal }}
        </v-card-title>
        <v-card-text>
        <cancel-reservation-message
          v-if="dateCurrentResservation"
          class="confirm-suppr-text-content"
          :idFormatMessage="idReservationMessage"
          :dateCurrentResa="dateCurrentResservation"
          :nbOfDaysBeforeDate="String(numberOfDaysBeforeDate)"
          :penaltyNb="String(penaltyDaysNumber)"
          :canBookSinceOf="canBookSinceOf"
        />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :color="colorButtonRetour"
            class="u-flex  u-flex--center"
            outline
            :aria-disabled="disabled"
            :disabled="disabled"
            @click="dialog = false"
          >
            <v-icon>
              arrow_back_ios
            </v-icon>
            {{ $formatMessage({ id: idMessageButtonRetour }) }}
          </v-btn>
          <v-btn
            :color="colorButtonConfirmer"
            :aria-disabled="disabled"
            :disabled="disabled"
            type="submit"
          >
            <span>
              {{ $formatMessage({ id: idMessageButtonConfirmer }) }}
            </span>
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import CancelReservationMessage from './CancelReservationMessage'

export default {
  components: {
    CancelReservationMessage,
  },

  props: {
    formAction: Function,
    penaltyDaysNumber: Number,
    numberOfDaysBeforeDate: Number,
    dateCurrentResservation: String,
    isPenaltyActive: Boolean,
    canBookSinceOf: String,
    idReservationMessage: String,
    idButtonName: String,
    titleModal: String,
    colorButton: String,
    iconName: String,
    idMessageButtonRetour: String,
    idMessageButtonConfirmer: String,
    colorButtonConfirmer: String,
    colorButtonRetour: String,
    disabled: Boolean,
  },

  data () {
    return {
      dialog: false,
    }
  },
}
</script>
