<template>
  <div>
    <h2>
      Liste blanche
    </h2>
    <v-card :style="{ padding: '1em 0' }"
      @drop="dropHandler"
      @dragover="dragOverHandler"
    >
      <v-list>
        <p v-if="whitelist.isFetching">Chargement...</p>

        <whitelisted
          v-for="whitelisted in whitelist.list"
          :key="whitelisted._id"
          :whitelisted="whitelisted"
          :remove-from-whitelist="removeFromWhitelist"
        />

        <v-form v-model="valid" @submit.prevent="addToWhitelist">
          <v-list-tile v-show="adding">

            <v-list-tile-action>
              <v-btn
                type="submit"
                icon
                :aria-disabled="whitelist.isUpdating"
                :disabled="whitelist.isUpdating"
              >
                <v-icon color="#17a2b8">save</v-icon>
              </v-btn>
            </v-list-tile-action>

            <v-list-tile-action @click="hideForm">
              <v-btn icon>
                <v-icon color="#17a2b8">close</v-icon>
              </v-btn>
            </v-list-tile-action>

            <v-text-field
              placeholder="jean@dupont.fr"
              aria-placeholder="jean@dupont.fr"
              v-if="adding"
              v-model="newEmail"
              :autofocus="adding"
              :rules="emailRules"
              color="#17a2b8"
              @keyup.escape="hideForm"
              :aria-disabled="whitelist.isUpdating"
              :disabled="whitelist.isUpdating"
            >
            </v-text-field>
          </v-list-tile>
        </v-form>

        <v-divider></v-divider>

        <v-list-tile v-if="!adding" @click="showForm">
          <v-list-tile-action>
            <v-btn icon >
              <v-icon color="#17a2b8">
                add_circle
              </v-icon>
            </v-btn>
          </v-list-tile-action>
          <span
            class="grey--text  text--darken-1"
          >
            Ajouter une adresse courriel
          </span>
        </v-list-tile>

        <v-divider></v-divider>

        <v-list-tile
          v-show="!addingBatch"
          @click="showBatchForm"
        >
          <v-list-tile-action>
            <v-btn icon >
              <v-icon color="#17a2b8">
                playlist_add
              </v-icon>
            </v-btn>
          </v-list-tile-action>
          <span
            class="grey--text  text--darken-1"
          >
            Ajouter un lot d'adresse courriel
          </span>
        </v-list-tile>

        <v-form
          v-model="validBatch"
          v-show="addingBatch"
          @submit.prevent="addBatchToWhitelist"
        >
          <v-container>
            <v-textarea
              v-if="addingBatch"
              v-model="newEmails"
              @keyup.escape="hideBatchForm"
              :autofocus="addingBatch"
              :aria-disabled="whitelist.isUpdating"
              :disabled="whitelist.isUpdating"
              :placeholder="'adresse1@examble.com\nadresse2@example.com\nadresse3@example.com'"
              :aria-placeholder="'adresse1@examble.com\nadresse2@example.com\nadresse3@example.com'"
              rows="10"
            >
            </v-textarea>
          </v-container>

          <v-list-tile v-show="addingBatch">
            <v-spacer></v-spacer>
            <input
              type="file"
              ref="batchEmailFile"
              id="batch-email-file"
              @change="loadHandler"
              style="width: 1px; height: 1px; opacity: 0;"
            />
            <v-list-tile-action>
              <label for="batch-email-file" @click="() => this.$refs.batchEmailFile.click()">
                <v-btn
                  color="primary"
                  v-ripple
                  flat
                  style="padding-right: 1em; padding-left: 1em;"
                >
                  <span style="padding-right: 1em;">
                    Importer des listes
                  </span>
                  <v-icon>cloud_upload</v-icon>
                </v-btn>
              </label>
            </v-list-tile-action>
            <v-list-tile-action>
              <v-btn
                ref="saveBatchEmail"
                id="save-batch-email"
                color="primary"
                v-ripple
                flat
                :aria-disabled="whitelist.isUpdating"
                :disabled="whitelist.isUpdating"
                type="submit"
                style="padding-right: 1em; padding-left: 1em;"
              >
                <span style="padding-right: 1em;">
                  Enregistrer ces adresses
                </span>
                <v-icon>save</v-icon>
              </v-btn>
            </v-list-tile-action>

            <v-list-tile-action @click="hideBatchForm">
              <v-btn icon>
                <v-icon color="#17a2b8">close</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-form>

      </v-list>
    </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { email as emailRegex } from '@/util'

import Whitelisted from './Whitelisted.vue'
import {
  DELETE_EMAIL_REQUEST,
  FETCH_WHITELIST_REQUEST,
  SAVE_EMAIL_BATCH_REQUEST,
  SAVE_EMAIL_REQUEST,
  SHOW_ERROR,
} from '@/store'

export default {
  name: 'whitelist',
  components: {
    Whitelisted,
  },
  data () {
    return {
      dialog: false,
      adding: false,
      addingBatch: false,
      newEmail: '',
      newEmails: '',
      emailRules: [
        v => !!v || 'Veuillez renseigner une adresse courriel',
        v => emailRegex.test(v) || 'L\'adresse courriel doit être valide',
      ],
      valid: false,
      validBatch: false,
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
        const message = `L'adresse courriel n'est pas valide (${this.newEmail})`
        this.showError(message)
        return
      }
      await this.$store.dispatch(SAVE_EMAIL_REQUEST, this.newEmail)
      this.hideForm()
      setTimeout(this.showForm, 10)
    },

    async addBatchToWhitelist () {
      const emails = this.newEmails.split(/\n/)
      await this.$store.dispatch(SAVE_EMAIL_BATCH_REQUEST, emails)
      this.hideBatchForm()
    },

    async removeFromWhitelist (id) {
      try {
        await this.$store.dispatch(DELETE_EMAIL_REQUEST, id)
      } catch (error) {
        if (error.auth === false) {
          this.$router.push({ name: 'admin-login', nextPath: this.$route.fullPath })
        }
      }
    },

    dragOverHandler (event) {
      event.preventDefault()
    },

    dropHandler (event) {
      event.preventDefault()
      if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        return
      }
      const files = Array.from(event.dataTransfer.items || event.dataTransfer.files)
        .map(file => file.getAsFile ? file.getAsFile() : file)

      this.processFiles(files)
    },

    loadHandler (e) {
      return this.processFiles(e.target.files)
    },

    processFiles (files) {
      try {
        this.newEmails = ''

        for (const file of files) {
          const reader = new FileReader()
          reader.onload = (e) => { this.newEmails += e.target.result }
          reader.readAsText(file)
        }
        this.showBatchForm()
        setTimeout(() => this.$scrollTo(`#save-batch-email`, 500), 10)
      } catch (error) {
        console.error(error)
      }
    },

    hideBatchForm () {
      this.newEmails = ''
      this.addingBatch = false
    },

    hideForm () {
      this.newEmail = ''
      this.adding = false
    },

    showBatchForm () {
      this.addingBatch = true
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
