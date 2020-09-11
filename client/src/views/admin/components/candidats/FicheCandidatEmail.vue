<template>
  <div class="t-update-candidat-email">
    <div
      v-if="!isOnEdit"
      class="u-flex u-flex--v-center t-update-candidat-email-read"
    >
      <strong class="label">{{ title }} :</strong>
      <span

        class="value"
      >{{ email }}</span>
      <v-btn
        v-show="!isOnEdit"
        color="success"
        icon
        class="btn-label t-update-candidat-email-edit"
        @click="isOnEdit=true"
      >
        <v-icon>create</v-icon>
      </v-btn>
    </div>
    <confirm-box
      v-else
      :close-action="onCancel"
      :submit-action="updateCandidatEmail"
      :disabled-ok="!isValidEmail"
    >
      <v-text-field
        v-model="email"
        label="Saisir la nouvelle adresse courriel"
        :rules="emailRules"
        class="u-full-width t-update-candidat-email-write"
      />
    </confirm-box>
  </div>
</template>

<script>

import { email as emailRegex } from '@/util'
import {
  FETCH_UPDATE_CANDIDAT_EMAIL_REQUEST,
} from '@/store'
import ConfirmBox from '@/components/ConfirmBox.vue'

export default {
  name: 'FicheCandidatEmail',
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
      email: this.info.email,
      isOnEdit: false,
      emailRules: [
        v => emailRegex.test(v) || "L'adresse courriel doit être valide",
      ],
    }
  },
  computed: {
    isValidEmail () {
      return this.emailRules[0](this.email) === true
    },
  },
  methods: {
    onCancel () {
      this.isOnEdit = false
      this.email = this.info.email
    },
    async updateCandidatEmail () {
      if (!this.isValidEmail) { return }
      try {
        await this.$store.dispatch(FETCH_UPDATE_CANDIDAT_EMAIL_REQUEST, this.email)
        this.isOnEdit = false
      } catch (error) {
      }
    },
  },
}
</script>

<style  lang="stylus" scoped>
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
