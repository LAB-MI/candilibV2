<template>
<div>
  <h4>
    {{ $formatMessage({ id: 'recap_reservation_confirmée' }) }}
    &nbsp;
    <v-icon color="success">
      check
    </v-icon>
  </h4>
  <h4>
    {{ $formatMessage({ id: 'recap_reservation_email_confirmée' }) }}
    <span color="primary">{{ candidat ? candidat.email : '' }}</span>
    &nbsp;
    <v-icon color="success">
      check
    </v-icon>
  </h4>
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
        @submit.prevent="deleteConfirm"
      >
        <v-card-title class="headline">
          Confirmer la suppression
        </v-card-title>
        <v-card-text>
          <div class="confirm-suppr-text-content">
            <p>{{ $formatMessage({ id: 'recap_reservation_modal_annuler_text_body' }) }}</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" flat @click="dialog = false">
            {{ $formatMessage({ id: 'recap_reservation_modal_annuler_boutton_retour' }) }}
          </v-btn>
          <v-btn
            color="success darken-1"
            flat
            :aria-disabled="disabled"
            :disabled="disabled"
            type="submit"
          >
            {{ $formatMessage({ id: 'recap_reservation_modal_annuler_boutton_confirmer' }) }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
  <router-link :to="{ name: 'selection-centre' }">
    <v-btn color="primary">
      {{ $formatMessage({ id: 'recap_reservation_boutton_modifier' }) }}
      &nbsp;
      <v-icon>
        edit
      </v-icon>
    </v-btn>
  </router-link>
  <v-btn
    color="success"
    @click="resendEmailConfrimation"
  >
      {{ $formatMessage({ id: 'recap_reservation_boutton_renvoyer_email' }) }}
      &nbsp;
      <v-icon>
        mail
      </v-icon>
  </v-btn>
</div>
</template>

<script>
import { mapState } from 'vuex'
import {
  DELETE_CANDIDAT_RESERVATION_REQUEST,
  SHOW_ERROR,
  SEND_EMAIL_CANDIDAT_RESERVATION_REQUEST,
} from '@/store'

export default {
  data () {
    return {
      selectedCheckBox: [],
      dialog: false,
    }
  },

  computed: {
    ...mapState(['center', 'timeSlots', 'candidat', 'reservation']),
    disabled () {
      return this.$store.state.reservation.isDeleting
    },
  },

  methods: {
    async deleteConfirm () {
      try {
        await this.$store.dispatch(DELETE_CANDIDAT_RESERVATION_REQUEST)
        this.dialog = false
        this.$router.push({ name: 'candidat-home' })
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },

    async resendEmailConfrimation () {
      try {
        await this.$store.dispatch(SEND_EMAIL_CANDIDAT_RESERVATION_REQUEST)
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },
  },

}
</script>

<style lang="postcss" scoped>
  h4 {
    padding-bottom: 2em;
    text-transform: uppercase;
  }

  .redirectTextColor {
    color: blue;
  }

  .confirm-suppr-text-content {
    height: 200px;
    overflow-y: scroll;
  }
</style>
