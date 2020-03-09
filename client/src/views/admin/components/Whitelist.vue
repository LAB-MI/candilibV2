<template>
  <div>
    <page-title :title="'Liste blanche'" />

    <v-container>
      <v-card
        :style="{ padding: '1em 0', position: 'relative' }"
        :class="{'drag-over': isDragginOverWhitelist}"
        @drop="dropHandler"
        @dragover="dragOverHandler"
        @dragexit="isDragginOverWhitelist = false"
        @dragenter="isDragginOverWhitelist = true"
      >
        <span
          v-if="whitelist.isFetching"
          class="loading-indicator"
        >
          <v-progress-circular
            v-show="whitelist.isFetching"
            indeterminate
            color="primary"
          />
        </span>

        <search-email />

        <v-list
          v-show="matchingList && matchingList.length"
          class="u-flex  u-flex--column  u-flex--center"
        >
          <h4 class="text-xs-center">
            Adresses correspondant à la recherche (max 5)
          </h4>

          <div>
            <whitelisted
              v-for="whitelisted in matchingList"
              :key="whitelisted._id"
              class="t-whitelist-search"
              :whitelisted="whitelisted"
              :remove-from-whitelist="removeFromWhitelist"
              @delete="onDelete"
              @dblclick="copyEmailInPaperclip"
            />
          </div>
        </v-list>
      </v-card>

      <v-card
        :style="{ padding: '1em 0' }"
        :class="{'drag-over': isDragginOverWhitelist}"
        @drop="dropHandler"
        @dragover="dragOverHandler"
        @dragexit="isDragginOverWhitelist = false"
        @dragenter="isDragginOverWhitelist = true"
      >
        <v-list
          class="u-flex  u-flex--column  u-flex--center  u-max-width"
        >
          <h3 class="text-xs-center">
            Dernières adresses enregistrées
          </h3>

          <div
            class="u-flex"
          >
            <v-btn
              class="u-flex"
              :color="oneColumn ? 'primary' : ''"
              @click="oneColumn = true"
            >
              <span>
                Vue 1 seule colonne
              </span>
              &nbsp;
              <v-icon>
                view_headline
              </v-icon>
            </v-btn>

            <v-btn
              :color="oneColumn ? '' : 'primary'"
              @click="oneColumn = false"
            >
              <span>
                Vue plusieurs colonnes
              </span>
              &nbsp;
              <v-icon>
                view_module
              </v-icon>
            </v-btn>
          </div>

          <div
            class="whitelist-grid"
            :class="{'one-column': oneColumn}"
          >
            <whitelisted
              v-for="whitelisted in whitelist.lastCreatedList"
              :key="whitelisted._id"
              :whitelisted="whitelisted"
              :remove-from-whitelist="removeFromWhitelist"
              @delete="onDelete"
              @dblclick="copyEmailInPaperclip"
            />
          </div>
        </v-list>

        <v-list>
          <v-form
            v-model="valid"
            @submit.prevent="addToWhitelist"
          >
            <v-list-item v-show="adding">
              <v-list-item-action>
                <v-btn
                  type="submit"
                  icon
                  :aria-disabled="whitelist.isUpdating"
                  :disabled="whitelist.isUpdating"
                >
                  <v-icon color="#17a2b8">
                    save
                  </v-icon>
                </v-btn>
              </v-list-item-action>

              <v-list-item-action @click="hideForm">
                <v-btn icon>
                  <v-icon color="#17a2b8">
                    close
                  </v-icon>
                </v-btn>
              </v-list-item-action>

              <v-text-field
                v-if="adding"
                v-model="newEmail"
                class="t-add-one-whitelist"
                placeholder="jean@dupont.fr"
                aria-placeholder="jean@dupont.fr"
                :autofocus="adding"
                :rules="emailRules"
                color="#17a2b8"
                :aria-disabled="whitelist.isUpdating"
                :disabled="whitelist.isUpdating"
                @keyup.escape="hideForm"
              />
            </v-list-item>
          </v-form>

          <v-dialog
            v-model="deleting"
            width="500"
          >
            <v-card
              v-if="toDelete"
            >
              <v-card-title
                class="headline grey lighten-2"
                primary-title
              >
                Suppression de
                <strong> {{ toDelete.email }}</strong>
              </v-card-title>

              <v-card-text>
                Voulez-vous vraiment supprimer l'adresse <strong>{{ toDelete.email }}</strong> de la whitelist ?
              </v-card-text>

              <v-divider />

              <v-card-actions right>
                <v-spacer />
                <v-btn
                  color="primary"
                  outlined
                  @click="deleting = false"
                >
                  Annuler
                </v-btn>
                <v-btn
                  color="primary"
                  @click="remove"
                >
                  Oui, supprimer
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-list>

        <v-divider />

        <v-list>
          <v-list-item
            v-if="!adding"
            @click="showForm"
          >
            <v-list-item-action>
              <v-btn icon>
                <v-icon color="#17a2b8">
                  add_circle
                </v-icon>
              </v-btn>
            </v-list-item-action>
            <span
              class="grey--text  text--darken-1"
            >
              Ajouter une adresse courriel
            </span>
          </v-list-item>

          <v-divider />

          <v-list-item
            v-show="!addingBatch"
            @click="showBatchForm"
          >
            <v-list-item-action>
              <v-btn icon>
                <v-icon color="#17a2b8">
                  playlist_add
                </v-icon>
              </v-btn>
            </v-list-item-action>
            <span
              class="grey--text  text--darken-1"
            >
              Ajouter un lot d'adresse courriel
            </span>
          </v-list-item>

          <v-form
            v-show="addingBatch"
            v-model="validBatch"
            class="u-pr"
            @submit.prevent="addBatchToWhitelist"
          >
            <big-loading-indicator :is-loading="whitelist.isUpdating" />
            <v-container>
              <v-textarea
                v-if="addingBatch"
                id="whitelist-batch-textarea"
                v-model="newEmails"
                :autofocus="addingBatch"
                :aria-disabled="whitelist.isUpdating"
                :disabled="whitelist.isUpdating"
                :placeholder="'adresse1@examble.com\nadresse2@example.com\nadresse3@example.com'"
                :aria-placeholder="'adresse1@examble.com\nadresse2@example.com\nadresse3@example.com'"
                rows="10"
                @keyup.escape="hideBatchForm"
              />
            </v-container>

            <v-list-item
              v-show="addingBatch"
              style="padding-bottom: 2em;"
            >
              <v-spacer />

              <v-list-item-action>
                <v-btn
                  id="save-batch-email"
                  ref="saveBatchEmail"
                  v-ripple
                  color="primary"
                  text
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
                <input
                  id="batch-email-file"
                  ref="batchEmailFile"
                  type="file"
                  style="width: 1px; height: 1px; opacity: 0;"
                  @change="loadHandler"
                >
                <label
                  for="batch-email-file"
                  @click="() => this.$refs.batchEmailFile.click()"
                >
                  <v-btn
                    v-ripple
                    color="primary"
                    text
                    style="padding-right: 1em; padding-left: 1em;"
                  >
                    <span style="padding-right: 1em;">
                      Importer des listes
                    </span>
                    <v-icon>cloud_upload</v-icon>
                  </v-btn>
                </label>
              </v-list-item-action>

              <v-list-item-action @click="hideBatchForm">
                <v-btn icon>
                  <v-icon color="#17a2b8">
                    close
                  </v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-form>
        </v-list>
      </v-card>

      <v-card v-show="whitelist.updateResult && whitelist.updateResult.length">
        <h3>Résultat de l'opération d'ajout par lot</h3>
        <v-list class="t-whitelist-batch-result">
          <v-list-item
            v-for="result in whitelist.updateResult"
            :key="result.email"
          >
            <v-icon
              :color="result.code === 201 ? 'success' : 'error'"
            >
              {{ result.code === 201 ? 'check' : 'close' }}
            </v-icon>
            <span
              :class="{
                'result-email': true,
                'result-email--ok': result.code === 201,
                'result-email--nok': result.code !== 201
              }"
            >
              {{ result.email }}
            </span>

            <span class="result-message">
              {{ codeMessageDictionary[result.code] }}
            </span>
          </v-list-item>
        </v-list>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { email as emailRegex } from '@/util'

import Whitelisted from './Whitelisted.vue'
import SearchEmail from './SearchEmail'
import { BigLoadingIndicator } from '@/components'
import {
  DELETE_EMAIL_REQUEST,
  FETCH_WHITELIST_REQUEST,
  SAVE_EMAIL_BATCH_REQUEST,
  SAVE_EMAIL_REQUEST,
  SHOW_ERROR,
  SHOW_SUCCESS,
} from '@/store'

const codeMessageDictionary = {
  409: 'Adresse courriel existante',
  400: 'Adresse invalide',
  500: 'Erreur inconnue',
  201: 'Adresse enregistrée',
}

export default {
  name: 'Whitelist',
  components: {
    Whitelisted,
    SearchEmail,
    BigLoadingIndicator,
  },

  data () {
    return {
      adding: false,
      addingBatch: false,
      codeMessageDictionary,
      deleting: false,
      isDragginOverWhitelist: false,
      dialog: false,
      emailRules: [
        v => !!v || 'Veuillez renseigner une adresse courriel',
        v => emailRegex.test(v) || 'L\'adresse courriel doit être valide',
      ],
      newEmail: '',
      newEmails: '',
      oneColumn: false,
      textToCopyToClipboard: '',
      valid: false,
      validBatch: false,
      toDelete: undefined,
    }
  },

  computed: {
    ...mapState(['whitelist']),

    matchingList () {
      return this.whitelist.matchingList.slice(0, 6)
    },

    departement () {
      return this.$store.state.admin.departements.active
    },
  },

  watch: {
    departement (newValue, oldValue) {
      if (newValue !== oldValue) {
        this.$store.dispatch(FETCH_WHITELIST_REQUEST, this.departement)
      }
    },
  },

  mounted () {
    if (this.departement) {
      this.$store.dispatch(FETCH_WHITELIST_REQUEST, this.departement)
    }
  },

  methods: {
    async addToWhitelist () {
      if (!this.valid) {
        const message = `L'adresse courriel n'est pas valide (${this.newEmail})`
        this.showError(message)
        return
      }
      await this.$store.dispatch(SAVE_EMAIL_REQUEST, { emailToAdd: this.newEmail, departement: this.departement })
      this.hideForm()
      setTimeout(this.showForm, 10)
    },

    async addBatchToWhitelist () {
      const emails = this.newEmails.split(/\n/)
      await this.$store.dispatch(SAVE_EMAIL_BATCH_REQUEST, { emailsToAdd: emails, departement: this.departement })
      this.hideBatchForm()
    },

    copyEmailInPaperclip (email) {
      const success = this.$clipboard(email)
      if (success) {
        this.$store.dispatch(SHOW_SUCCESS, `L'email ${email} a été copié dans le presse-papier`)
      }
    },

    dragOverHandler (event) {
      event.preventDefault()
    },

    dropHandler (event) {
      event.preventDefault()
      this.isDragginOverWhitelist = false
      if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        return
      }
      const files = Array.from(event.dataTransfer.items || event.dataTransfer.files)
        .map(file => file.getAsFile ? file.getAsFile() : file)

      this.processFiles(files)
    },

    loadHandler (e) {
      const files = Array.from(e.target.files)
      return this.processFiles(files)
    },

    processFiles (files) {
      try {
        this.newEmails = ''

        files.forEach(file => {
          const reader = new FileReader()
          reader.onload = (e) => { this.newEmails += e.target.result }
          reader.readAsText(file)
        })
        this.showBatchForm(true)
        setTimeout(() => this.$scrollTo('#whitelist-batch-textarea', 500), 5)
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

    onDelete (whitelisted) {
      this.toDelete = whitelisted
      this.deleting = true
    },

    async remove () {
      await this.removeFromWhitelist(this.toDelete._id)
      this.deleting = false
      this.toDelete = undefined
    },

    async removeFromWhitelist (id) {
      try {
        await this.$store.dispatch(DELETE_EMAIL_REQUEST, { email: id, departement: this.departement })
      } catch (error) {
        if (error.auth === false) {
          this.$router.push({ name: 'admin-login', nextPath: this.$route.fullPath })
        }
      }
    },

    showBatchForm (noScroll) {
      this.addingBatch = true
      if (!noScroll) {
        setTimeout(() => this.$scrollTo('#save-batch-email', 1000), 10)
      }
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

<style lang="postcss" scoped>
.container {
  max-width: 100vw;
}

.loading-indicator {
  position: absolute;
  top: 1em;
  right: 1em;
}

.drag-over {
  outline: 5px dashed rgba(23, 162, 184, 0.5);
}

.whitelist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  width: 100%;

  &.one-column {
    width: auto;
    grid-template-columns: 1fr;
  }
}

h3 {
  padding: 1em;
}

.result-email {
  display: inline-block;
  padding: 0 1em;
  color: grey;

  &--ok {
    font-weight: bold;
  }

  &--nok {
    font-style: italic;
  }
}
</style>
