<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="290"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        dark
        :aria-disabled="disabled"
        :disabled="disabled"
        :color="colorButton"
        v-on="on"
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
            v-if="currentReservationDateTime"
            class="confirm-suppr-text-content t-confirm-suppr-text-content"
            :id-format-message="idReservationMessage"
            :date-current-resa="currentReservationDateTime"
            :nb-of-days-before-date="String(numberOfDaysBeforeDate)"
            :penalty-nb="String(penaltyDaysNumber)"
            :can-book-from="canBookFrom"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            :color="colorButtonRetour"
            class="u-flex  u-flex--center"
            outlined
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
    formAction: {
      type: Function,
      default () {},
    },
    penaltyDaysNumber: {
      type: Number,
      default: 7,
    },
    numberOfDaysBeforeDate: {
      type: Number,
      default: 7,
    },
    currentReservationDateTime: {
      type: String,
      default: '',
    },
    isPenaltyActive: Boolean,
    canBookFrom: {
      type: String,
      default: '',
    },
    idReservationMessage: {
      type: String,
      default: '',
    },
    idButtonName: {
      type: String,
      default: '',
    },
    titleModal: {
      type: String,
      default: '',
    },
    colorButton: {
      type: String,
      default: '',
    },
    iconName: {
      type: String,
      default: '',
    },
    idMessageButtonRetour: {
      type: String,
      default: '',
    },
    idMessageButtonConfirmer: {
      type: String,
      default: '',
    },
    colorButtonConfirmer: {
      type: String,
      default: '',
    },
    colorButtonRetour: {
      type: String,
      default: '',
    },
    disabled: Boolean,
  },

  data () {
    return {
      dialog: false,
    }
  },
}
</script>
