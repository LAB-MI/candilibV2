<template>
  <div class="presignup-form">
    <v-form dark v-model="valid" ref="presignupForm" class="presignup-form" @submit.prevent="presignup">
      <div class="form-input">
        <v-text-field
          :label="`${getMsg('preinscription_neph')} *`"
          prepend-icon="assignment"
          dark
          color="#fff"
          @focus="setNephPlaceholder"
          @blur="removeNephPlaceholder"
          :placeholder="nephPlaceholder"
          aria-placeholder="012345678912"
          :autofocus="!showDialog"
          hint="ex. : 0123456789"
          required
          :rules="nephRules"
          tabindex="1"
          v-model="codeNeph"
        ></v-text-field>
      </div>
      <div class="form-input">
        <v-text-field
          :label="`${getMsg('preinscription_nom_naissance')} *`"
          prepend-icon="account_box"
          dark
          color="#fff"
          @focus="setNomPlaceholder"
          @blur="removeNomPlaceholder"
          :placeholder="nomPlaceholder"
          aria-placeholder="Dupont"
          hint="ex. : Dupont"
          required
          tabindex="2"
          v-model="nomNaissance"
        ></v-text-field>
      </div>
      <div class="form-input">
        <v-text-field
          :label="getMsg('preinscription_prenom')"
          prepend-icon="perm_identity"
          dark
          color="#fff"
          @focus="setPrenomPlaceholder"
          @blur="removePrenomPlaceholder"
          :placeholder="prenomPlaceholder"
          aria-placeholder="Jean"
          hint="ex. : Jean"
          required
          tabindex="3"
          v-model="prenom"
        ></v-text-field>
      </div>
      <div class="form-input">
        <v-text-field
          :label="`${getMsg('preinscription_email')} *`"
          prepend-icon="email"
          dark
          color="#fff"
          @focus="setEmailPlaceholder"
          @blur="removeEmailPlaceholder"
          :placeholder="emailPlaceholder"
          aria-placeholder="jean@dupont.fr"
          hint="ex. : jean@dupont.fr"
          required
          :rules="emailRules"
          tabindex="4"
          v-model="email"
        ></v-text-field>
      </div>
      <div class="form-input">
        <v-text-field
          :label="`${getMsg('preinscription_mobile')} *`"
          prepend-icon="smartphone"
          dark
          color="#fff"
          @focus="setPortablePlaceholder"
          @blur="removePortablePlaceholder"
          :placeholder="portablePlaceholder"
          aria-placeholder="Jean"
          hint="ex. : 0612345678"
          required
          tabindex="5"
          :rules="portableRules"
          v-model="portable"
        ></v-text-field>
      </div>
      <div class="form-input">
        <v-autocomplete
          :label="`${getMsg('preinscription_adresse')} *`"
          dark
          color="#fff"
          @focus="setAdressePlaceholder"
          @blur="removeAdressePlaceholder"
          :placeholder="adressePlaceholder"
          aria-placeholder="Jean"
          :loading="isFetchingMatchingAdresses"
          v-model="adresse"
          hint="ex. : 10 avenue du général Leclerc Villepinte 93420"
          :items="adresses"
          prepend-icon="location_city"
          tabindex="6"
          no-filter
          :search-input.sync="searchAdresses"
        >
        </v-autocomplete>
      </div>
      <div class="form-input">
        <v-btn
          type="submit"
          :disabled="isSendingPresignup"
          :aria-disabled="isSendingPresignup"
          class="submit-button"
          dark
          tabindex="7"
          color="#28a745">
          <div class="submit-label">{{getMsg('preinscription_bouton_submit')}}</div>
        </v-btn>
      </div>
      <div class="form-input  form-input-group">
        <v-btn flat color="#fff" tag="a" :to="{ name: 'mentions-legales' }" tabindex="9">
          {{getMsg('preinscription_bouton_mentions_legales') }}
        </v-btn>
        <v-dialog
          v-model="showDialog"
          width="500"
          class="already-signed-up"
        >
          <v-btn
            slot="activator"
            depressed
            color="#fff"
            tabindex="8"
          >
            {{getMsg('preinscription_bouton_deja_inscrit') }}
          </v-btn>

          <v-card>
            <v-card-title
              class="headline grey lighten-2"
              primary-title
            >
              {{getMsg('preinscription_magic_link_title') }}
            </v-card-title>

            <v-form v-model="magicLinkValid" @submit.prevent="sendMagicLink">
              <div class="u-flex  u-flex--center">
                <div class="form-input">
                  <v-text-field
                    :label="`${getMsg('preinscription_email')}`"
                    prepend-icon="email"
                    @focus="setEmailPlaceholder"
                    @blur="removeEmailPlaceholder"
                    :placeholder="emailPlaceholder"
                    aria-placeholder="jean@dupont.fr"
                    :autofocus="showDialog"
                    hint="ex. : jean@dupont.fr"
                    required
                    :rules="emailRules"
                    tabindex="1"
                    v-model="email"
                  ></v-text-field>
                </div>
              </div>

              <v-divider></v-divider>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                dark
                type="submit"
                :disabled="isSendingMagicLink"
                :aria-disabled="isSendingMagicLink"
                tabindex="2"
                color="#28a745">
                  <div class="submit-label">
                    {{getMsg('preinscription_bouton_magic_link') }}
                  </div>
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-dialog>
        <v-btn flat color="#fff" tag="a" :to="{ name: 'faq' }" tabindex="10">
          {{getMsg('preinscription_bouton_faq') }}
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import pDebounce from 'p-debounce'

import { email as emailRegex, neph as nephRegex, phone as phoneRegex } from '@/util'
import {
  PRESIGNUP_REQUEST,
  SEND_MAGIC_LINK_REQUEST,
  SHOW_ERROR,
  SHOW_SUCCESS,
} from '@/store'

import api from '@/api'

const getAdresses = pDebounce((query) => {
  return api.util.searchAdresses(query)
}, 300)

export default {
  name: 'signup-form',
  props: {
    toggleForm: Function,
  },
  data: function () {
    return {
      magicLinkValid: false,
      nephPlaceholder: '',
      codeNeph: '',
      nephRules: [
        v => nephRegex.test(v) || this.getMsg('preinscription_neph_erreur'),
      ],
      nomPlaceholder: '',
      nomNaissance: '',
      prenomPlaceholder: '',
      prenom: '',
      emailPlaceholder: '',
      email: '',
      emailRules: [
        v => v !== '' || this.getMsg('preinscription_email_vide'),
        v => emailRegex.test(v) || this.getMsg('preinscription_email_erreur'),
      ],
      portablePlaceholder: '',
      portable: '',
      portableRules: [
        v => phoneRegex.test(v) || this.getMsg('preinscription_mobile_erreur'),
      ],
      adressePlaceholder: '',
      adresse: '',
      valid: false,
      showDialog: false,
      adresses: [],
      searchAdresses: null,
      isFetchingMatchingAdresses: false,
    }
  },

  computed: {
    isSendingPresignup () {
      return this.$store.state.candidat.isSendingPresignup
    },
    isSendingMagicLink () {
      return this.$store.state.candidat.isSendingMagicLink
    },
  },

  watch: {
    searchAdresses (val) {
      val && val !== this.select && this.fetchMatchingAdresses(val)
    },
  },

  methods: {
    getMsg (id) {
      return this.$formatMessage({ id })
    },
    async setEmailPlaceholder () {
      this.emailPlaceholder = 'jean@dupont.fr'
    },
    async removeEmailPlaceholder () {
      this.emailPlaceholder = ''
    },
    async setNephPlaceholder () {
      this.nephPlaceholder = '012345678912'
    },
    async removeNephPlaceholder () {
      this.nephPlaceholder = ''
    },
    async setNomPlaceholder () {
      this.nomPlaceholder = 'Dupont'
    },
    async removeNomPlaceholder () {
      this.nomPlaceholder = ''
    },
    async setPrenomPlaceholder () {
      this.prenomPlaceholder = 'Jean'
    },
    async removePrenomPlaceholder () {
      this.prenomPlaceholder = ''
    },
    async setPortablePlaceholder () {
      this.portablePlaceholder = '0612345678'
    },
    async removePortablePlaceholder () {
      this.portablePlaceholder = ''
    },
    async setAdressePlaceholder () {
      this.adressePlaceholder = '10 avenue du général Leclerc Villepinte 93420'
    },
    async removeAdressePlaceholder () {
      this.adressePlaceholder = ''
    },
    async presignup () {
      if (!this.valid) {
        return this.$store.dispatch(SHOW_ERROR, this.getMsg('preinscription_formulaire_invalide'))
      }
      const {
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        adresse,
      } = this

      try {
        const response = await this.$store.dispatch(PRESIGNUP_REQUEST, {
          codeNeph,
          nomNaissance,
          prenom,
          email,
          portable,
          adresse,
        })
        this.$refs.presignupForm.reset()
        this.$router.push({ name: 'email-validation', params: { response } })
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },

    async sendMagicLink () {
      if (!this.magicLinkValid) {
        return this.$store.dispatch(SHOW_ERROR, this.getMsg('preinscription_magic_link_invalide'))
      }
      try {
        await this.$store.dispatch(SEND_MAGIC_LINK_REQUEST, this.email)
        this.$refs.presignupForm.reset()
        this.$store.dispatch(SHOW_SUCCESS, this.getMsg('preinscription_magic_link_envoyé'))
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
      this.showDialog = false
    },

    async fetchMatchingAdresses (val) {
      this.isFetchingMatchingAdresses = true
      try {
        const adresses = await getAdresses(val)
        this.adresses = (adresses.features && adresses.features.length)
          ? adresses.features
            .filter(adr => adr.properties.type.includes('housenumber'))
            .map(feature => feature.properties.label)
          : []
      } catch (error) {
      }
      this.isFetchingMatchingAdresses = false
    },
  },
}
</script>

<style lang="postcss" scoped>
.presignup-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.form-input {
  width: 90%;
  text-align: center;
  display: flex;
  justify-content: center;

  @media (max-width: 599px) {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }
}

.already-signed-up {
  @media (max-width: 599px) {
    order: -1;
  }
}

.submit-button {
  width: 100%;
}
</style>
