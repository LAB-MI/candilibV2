<template>
  <div class="t-update-candidat-phone-number">
    <div
      v-if="!isOnEdit"
      class="u-flex u-flex--v-center t-update-candidat-phone-number-read"
    >
      <strong class="label">{{ title }} :</strong>
      <span

        class="value"
      >{{ phoneNumber }}</span>
      <v-btn
        v-show="!isOnEdit"
        color="success"
        icon
        class="btn-label t-update-candidat-phone-number-edit"
        @click="isOnEdit=true"
      >
        <v-icon>create</v-icon>
      </v-btn>
    </div>
    <confirm-box
      v-else
      :close-action="onCancel"
      :submit-action="updateCandidatPhoneNumber"
      :disabled-ok="!isValidPhoneNumber"
      cancel-button-text="Annuler"
    >
      <v-text-field
        v-model="phoneNumber"
        label="Saisir le nouveau numéro de mobile"
        :rules="phoneNumberRules"
        class="u-full-width t-update-candidat-phone-number-write"
      />
    </confirm-box>
  </div>
</template>

<script>
import { phone as phoneRegex } from '@/util'
import {
  FETCH_UPDATE_CANDIDAT_PHONE_NUMBER_REQUEST,
} from '@/store'
import ConfirmBox from '@/components/ConfirmBox.vue'

export default {
  name: 'FicheCandidatPhoneNumber',
  components: {
    ConfirmBox,
  },
  props: {
    info: {
      type: Object,
      default: () => {},
    },
    title: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      phoneNumber: this.info.phoneNumber,
      isOnEdit: false,
      phoneNumberRules: [
        v => phoneRegex.test(v) || 'Le numéro de mobile doit être valide',
      ],
    }
  },
  computed: {
    isValidPhoneNumber () {
      return this.phoneNumberRules[0](this.phoneNumber) === true
    },
  },
  methods: {
    onCancel () {
      this.isOnEdit = false
      this.phoneNumber = this.info.phoneNumber
    },
    async updateCandidatPhoneNumber () {
      try {
        await this.$store.dispatch(FETCH_UPDATE_CANDIDAT_PHONE_NUMBER_REQUEST, this.phoneNumber)
        this.isOnEdit = false
      } catch (error) {
      }
    },
  },
}
</script>

<style scoped>
.btn-label {
  height: 1em;
}

.label {
  line-height: 1.5em;
  flex-basis: 15rem;
}

.value {
  flex-shrink: 1;
}
</style>
