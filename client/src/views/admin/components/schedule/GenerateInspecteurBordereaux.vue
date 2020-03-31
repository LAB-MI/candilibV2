<template>
  <v-layout
    row
    justify-center
  >
    <v-btn
      color="info"
      dark
      @click.stop="showDialog"
    >
      <span>
        {{ messageButton }}
        <strong>
          {{ activeDepartement }}
        </strong>
      </span>
      &nbsp;
      <v-icon>
        {{ iconButton }}
      </v-icon>
    </v-btn>
    <v-dialog
      v-model="dialog"
      max-width="580"
      scrollable
    >
      <v-card>
        <v-card-title
          class="headline"
        >
          {{ titleModal }}
          &nbsp;
          <strong>
            {{ `${activeDepartement}` }}
          </strong>
          <div v-if="!isForInspecteurs">
            {{ $formatMessage({ id: 'sur_ladresse_courriel' }) }}
            &nbsp;
            <strong>
              {{ emailDepartementActive }}
            </strong>
          </div>
        </v-card-title>
        <div>
          <v-card-title class="headline">
            <div
              class="u-full-width  u-flex  u-flex--row  u-flex--center"
            >
              <candilib-autocomplete
                style="width: 100%;"
                :fetch-autocomplete-action="fetchAutocompleteAction"
                :items="matchingInspecteurs"
                :clearable="true"
                :autofocus="true"
                placeholder="Recherche par nom, matricule ou adresse courriel"
                @selection="selection"
              />
            </div>
          </v-card-title>

          <div
            v-if="!(inspecteursOfCurrentDpt && inspecteursOfCurrentDpt.length)"
            class="headline"
          >
            {{ $formatMessage({ id: 'no_inspecteurs_at_this_date'}) }}
          </div>

          <v-form v-else>
            <v-card-text>
              <v-list>
                <v-list-item>
                  <v-list-item-content class="label-select-all">
                    {{ $formatMessage({ id: 'tous'}) }}
                  </v-list-item-content>

                  <v-list-item-action>
                    <v-checkbox
                      v-model="isAllChecked"
                      class="t-check-all"
                      :color="isPartiallyChecked ? 'grey' : 'info'"
                    />
                  </v-list-item-action>
                </v-list-item>
              </v-list>

              <v-list
                class="wrapper-list"
              >
                <inspecteur-list-bordereaux-content
                  v-for="item in inspecteursOfCurrentDpt"
                  :key="item.inspecteur._id"
                  :centre="item.centre"
                  :inspecteur="item.inspecteur"
                  :inspecteur-list-to-send-bordereaux="inspecteurListToSendBordereaux"
                  @set-inspecteur-list="setInspecteurList"
                />
              </v-list>
            </v-card-text>
          </v-form>
        </div>

        <v-card-actions>
          <v-spacer />

          <v-btn
            outlined
            color="info"
            :disabled="isGenerating"
            :aria-disabled="isGenerating"
            @click="dialog = false"
          >
            {{ cancelDialMsg }}
          </v-btn>

          <v-btn
            :aria-disabled="isAbleToSendBordereaux()"
            :disabled="isAbleToSendBordereaux()"
            type="submit"
            color="primary"
            @click="generateBordereaux"
          >
            {{ submitDialMsg }}
            &nbsp;
            <v-icon>
              {{ iconButton }}
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import {
  FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST,
  GENERATE_INSPECTOR_BORDEREAUX_REQUEST,
  MATCH_INSPECTEURS_IN_LIST_REQUEST,
  SHOW_ERROR,
  SHOW_SUCCESS,
} from '@/store'
import CandilibAutocomplete from '../CandilibAutocomplete'
import InspecteurListBordereauxContent from './InspecteurListBordereauxContent'

import {
  getFrenchLuxonFromSql,
} from '@/util'

import messageAdmin from '@/admin'

export default {
  components: {
    CandilibAutocomplete,
    InspecteurListBordereauxContent,
  },

  props: {
    date: {
      type: String,
      default: '',
    },
    isForInspecteurs: Boolean,
  },

  data () {
    return {
      dialog: false,
      messageButton: '',
      iconButton: '',
      isAllChecked: false,
      isPartiallyChecked: false,
      titleModal: '',
      modalText: '',
      submitDialMsg: this.isForInspecteurs ? messageAdmin.envoyer : messageAdmin.recevoir,
      cancelDialMsg: messageAdmin.annuler,
      inspecteurListToSendBordereaux: [],
      fetchAutocompleteAction: MATCH_INSPECTEURS_IN_LIST_REQUEST,

      isAbleToSendBordereaux: () => {
        if (this.isGenerating) {
          return true
        }
        if (this.inspecteurListToSendBordereaux.length) {
          return false
        }
        return true
      },
    }
  },

  computed: {
    ...mapState({
      emailUser: state => state.admin.email,
      activeDepartement: state => state.admin.departements.active,
      isGenerating: state => state.adminBordereaux.isGenerating,
      inspecteursOfCurrentDpt: state => state.adminBordereaux.inspecteursOfCurrentDpt.list,
      matchingInspecteurs: state => state.adminBordereaux.matchInspecteurList.list.map(
        ({ inspecteur, centre }) => ({
          text: `${inspecteur.prenom} ${inspecteur.nom} - ${inspecteur.matricule} - ${centre.nom}`,
          value: inspecteur._id,
        }),
      ),
    }),
    ...mapGetters(['emailDepartementActive']),
    beginDate () {
      return getFrenchLuxonFromSql(this.date).startOf('day').toISO()
    },
  },

  watch: {
    isAllChecked () {
      this.selectAllInspecteurs()
    },

    inspecteurListToSendBordereaux (newValue) {
      if (this.inspecteursOfCurrentDpt && newValue &&
        newValue.length < this.inspecteursOfCurrentDpt.length) {
        this.isPartiallyChecked = true
        if (newValue.length === 0) {
          this.isAllChecked = false
        }
        return
      }
      this.isAllChecked = true
      this.isPartiallyChecked = false
    },

    dialog (newValue) {
      if (newValue && this.inspecteursOfCurrentDpt && this.inspecteursOfCurrentDpt.length) {
        this.inspecteurListToSendBordereaux = this.inspecteursOfCurrentDpt.map(el => `${el.inspecteur._id}`)
      }
    },
  },

  mounted () {
    if (this.isForInspecteurs) {
      this.messageButton = messageAdmin.send_bordereaux
      this.iconButton = 'contact_mail'
      this.titleModal = messageAdmin.send_bordereaux
    } else {
      this.messageButton = messageAdmin.recevoir_les_bordereaux_inspecteurs
      this.iconButton = 'email'
      this.titleModal = messageAdmin.recevoir_les_bordereaux_inspecteurs
    }
  },

  methods: {
    selection (newSelection) {
      if (newSelection && !this.inspecteurListToSendBordereaux.find(el => el === newSelection.value)) {
        const inspecteurId = newSelection.value
        this.inspecteurListToSendBordereaux = [
          ...this.inspecteurListToSendBordereaux,
          inspecteurId,
        ]
        this.$store.dispatch(SHOW_SUCCESS, 'L\'IPCSR a bien été sélectionné·e')
        return
      }

      if (newSelection && this.inspecteurListToSendBordereaux.find(el => el === newSelection.value)) {
        this.$store.dispatch(SHOW_ERROR, 'L\'IPCSR est déjà sélectionné·e')
      }
    },

    async showDialog () {
      await this.$store.dispatch(FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST, this.beginDate)
      this.dialog = true
    },

    selectAllInspecteurs () {
      if (!this.isAllChecked) {
        this.inspecteurListToSendBordereaux = []
        return
      }
      this.inspecteurListToSendBordereaux = this.inspecteursOfCurrentDpt.map(el => `${el.inspecteur._id}`)
    },

    setInspecteurList ({ isChecked, inspecteurId }) {
      if (isChecked) {
        this.inspecteurListToSendBordereaux = [
          ...this.inspecteurListToSendBordereaux,
          inspecteurId,
        ]
        return
      }
      this.inspecteurListToSendBordereaux = this.inspecteurListToSendBordereaux.filter(el => el !== `${inspecteurId}`)
    },

    async generateBordereaux () {
      await this.$store.dispatch(GENERATE_INSPECTOR_BORDEREAUX_REQUEST, {
        departement: this.activeDepartement,
        date: getFrenchLuxonFromSql(this.date).toISO(),
        isForInspecteurs: this.isForInspecteurs,
        inspecteurIdListe: this.inspecteurListToSendBordereaux || undefined,
      })
      this.dialog = false
    },
  },
}
</script>

<style scoped>
.label-select-all {
  font-style: italic;
  color: grey;
}

.wrapper-list {
  overflow: auto;
  height: 300px;
}

::-webkit-scrollbar {
  display: none;
}
</style>
