<template>
  <div>
    <h2>
      Liste blanche
    </h2>
    <v-card :style="{ padding: '1em 0' }">
      <v-list>
        <p ref="testp" v-if="whitelist.isFetching">Chargement...</p>
        <v-list-tile
          v-for="whitelisted in whitelist.list"
          :key="whitelisted._id"
          @click="true"
        >
          <v-list-tile-action v-if="whitelisted !== 'new'" @click="removeFromWhitelist(whitelisted._id)">
            <v-btn icon>
              <v-icon color="#17a2b8">delete</v-icon>
            </v-btn>
          </v-list-tile-action>

          <v-list-tile-content>
            <v-list-tile-title v-text="whitelisted.email"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <v-form v-model="valid" @submit.prevent="addToWhitelist">
          <v-list-tile v-show="adding">

            <v-list-tile-action>
              <v-btn icon>
                <v-icon color="#17a2b8">save</v-icon>
              </v-btn>
            </v-list-tile-action>

            <v-list-tile-action @click="hideForm">
              <v-btn icon>
                <v-icon color="#17a2b8">close</v-icon>
              </v-btn>
            </v-list-tile-action>

            <v-text-field
              v-if="adding"
              v-model="newEmail"
              :autofocus="adding"
              :rules="emailRules"
              color="#17a2b8"
              @keyup.escape="hideForm"
            >
            </v-text-field>
          </v-list-tile>
        </v-form>
      </v-list>
      <v-btn icon v-if="!adding" @click="showForm">
        <v-icon color="#17a2b8">
          add_circle
        </v-icon>
      </v-btn>
    </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { email as emailRegex } from '@/util'

import { FETCH_WHITELIST_REQUEST, DELETE_EMAIL_REQUEST, SAVE_EMAIL_REQUEST, SHOW_ERROR } from '@/store'

export default {
  data () {
    return {
      adding: false,
      newEmail: '',
      emailRules: [
        v => !!v || 'Veuillez renseigner votre email',
        v => emailRegex.test(v) || 'L\'email doit être valide',
      ],
      valid: false,
    }
  },

  mounted () {
    this.$store.dispatch(FETCH_WHITELIST_REQUEST)
  },

  computed: {
    ...mapState(['whitelist']),
  },

  methods: {
    async addToWhitelist () {
      if (!this.valid) {
        const message = `L'email n'est pas valide (${this.newEmail})`
        this.showError(message)
        return
      }
      await this.$store.dispatch(SAVE_EMAIL_REQUEST, this.newEmail)
      this.hideForm()
    },

    async removeFromWhitelist (id) {
      await this.$store.dispatch(DELETE_EMAIL_REQUEST, id)
    },

    hideForm () {
      this.newEmail = ''
      this.adding = false
    },

    showForm () {
      this.adding = true
    },

    showError (content) {
      this.$store.dispatch(SHOW_ERROR, content)
    },
  },
}
</script>
