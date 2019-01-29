<template>
  <div>
    <div class="presignup">
      <div class="presignup-form">
        <h1 class="presignup-form-title">
          CANDILIB
        </h1>
        <h2 class="presignup-form-subtitle">
          Réservez votre place d'examen
        </h2>
        <hr class="u-separator" />
        <v-form dark v-model="valid" ref="presignupForm" class="presignup-form" @submit.prevent="presignup">
          <div class="form-input">
            <v-text-field
              label="NEPH (obligatoire) *"
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
              prepend-icon="account_box"
              dark
              color="#fff"
              @focus="setNomPlaceholder"
              @blur="removeNomPlaceholder"
              :placeholder="nomPlaceholder"
              aria-placeholder="Dupont"
              hint="ex. : Dupont"
              label="Nom de naissance (obligatoire) *"
              required
              tabindex="2"
              v-model="nomNaissance"
            ></v-text-field>
          </div>
          <div class="form-input">
            <v-text-field
              prepend-icon="perm_identity"
              dark
              color="#fff"
              @focus="setPrenomPlaceholder"
              @blur="removePrenomPlaceholder"
              :placeholder="prenomPlaceholder"
              aria-placeholder="Jean"
              hint="ex. : Jean"
              label="Prénom"
              required
              tabindex="3"
              v-model="prenom"
            ></v-text-field>
          </div>
          <div class="form-input">
            <v-text-field
              prepend-icon="email"
              dark
              color="#fff"
              @focus="setEmailPlaceholder"
              @blur="removeEmailPlaceholder"
              :placeholder="emailPlaceholder"
              aria-placeholder="jean@dupont.fr"
              hint="ex. : jean@dupont.fr"
              label="Courriel (obligatoire) *"
              required
              :rules="emailRules"
              tabindex="4"
              v-model="email"
            ></v-text-field>
          </div>
          <div class="form-input">
            <v-text-field
              prepend-icon="smartphone"
              dark
              color="#fff"
              @focus="setPortablePlaceholder"
              @blur="removePortablePlaceholder"
              :placeholder="portablePlaceholder"
              aria-placeholder="Jean"
              hint="ex. : 0612345678"
              label="Portable (obligatoire) *"
              required
              tabindex="5"
              :rules="portableRules"
              v-model="portable"
            ></v-text-field>
          </div>
          <div class="form-input">
            <v-autocomplete
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
              label="Adresse (obligatoire) *"
              prepend-icon="location_city"
              tabindex="6"
              no-filter
              :search-input.sync="searchAdresses"
            >
            </v-autocomplete>
          </div>
          <div class="form-input">
            <v-btn type="submit" class="submit-button" dark tabindex="7" color="#28a745">
              <div class="submit-label">Pré-inscription</div>
            </v-btn>
          </div>
          <div class="form-input  form-input-group">
            <v-btn flat color="#fff" tag="a" :to="{ name: 'legal' }" tabindex="9">
              Mentions légales
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
                Déjà inscrit ?
              </v-btn>

              <v-card>
                <v-card-title
                  class="headline grey lighten-2"
                  primary-title
                >
                  Recevez un magic link dans votre boîte email
                </v-card-title>

                <v-form v-model="magicLinkValid" @submit.prevent="sendMagicLink">
                  <div class="u-flex  u-flex--center">
                    <div class="form-input">
                      <v-text-field
                        prepend-icon="email"
                        @focus="setEmailPlaceholder"
                        @blur="removeEmailPlaceholder"
                        :placeholder="emailPlaceholder"
                        aria-placeholder="jean@dupont.fr"
                        :autofocus="showDialog"
                        hint="ex. : jean@dupont.fr"
                        label="Courriel (obligatoire) *"
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
                    <v-btn dark type="submit" tabindex="2" color="#28a745">
                      <div class="submit-label">Envoyer le magic link</div>
                    </v-btn>
                  </v-card-actions>
                </v-form>
              </v-card>
            </v-dialog>
            <v-btn flat color="#fff" tag="a" :to="{ name: 'faq' }" tabindex="10">
              Une question ?
            </v-btn>
          </div>
        </v-form>
        <hr class="u-separator" />
        <div class="u-flex  u-flex--center  u-flex--space-between" style="width: 80%">
          <a href="https://www.interieur.gouv.fr/">
            <img :src="logoMI">
          </a>
          <img :src="logoLabMI">
          <a href="http://www.securite-routiere.gouv.fr/">
            <img :src="logoSR">
          </a>
        </div>
      </div>
    </div>
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
import logoMI from '@/assets/images/logo_mi_40x50.png'
import logoLabMI from '@/assets/images/lab_100.png'
import logoSR from '@/assets/images/securite_routiere_70x27.png'

const getAdresses = pDebounce((query) => {
  return api.util.searchAdresses(query)
}, 300)

export default {
  props: {
    toggleForm: Function,
  },
  data: function () {
    return {
      logoMI,
      logoLabMI,
      logoSR,
      magicLinkValid: false,
      nephPlaceholder: '',
      codeNeph: '',
      nephRules: [
        v => nephRegex.test(v) || 'Le code neph n\'est pas valide',
      ],
      nomPlaceholder: '',
      nomNaissance: '',
      prenomPlaceholder: '',
      prenom: '',
      emailPlaceholder: '',
      email: '',
      emailRules: [
        v => v !== '' || 'Veuillez renseigner votre adresse courriel',
        v => emailRegex.test(v) || 'L\'adresse courriel doit être valide',
      ],
      portablePlaceholder: '',
      portable: '',
      portableRules: [
        v => phoneRegex.test(v) || 'Le numéro de téléphone doit être valide',
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

  watch: {
    searchAdresses (val) {
      val && val !== this.select && this.fetchMatchingAdresses(val)
    },
  },

  methods: {
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
        return this.$store.dispatch(SHOW_ERROR, 'Veuillez remplir le formulaire')
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
        await this.$store.dispatch(PRESIGNUP_REQUEST, {
          codeNeph,
          nomNaissance,
          prenom,
          email,
          portable,
          adresse,
        })
        this.$store.dispatch(SHOW_SUCCESS, 'Votre demande d’inscription est en cours de vérification, vous recevrez une information sous 48h hors week-end et jours fériés.')
        this.$refs.presignupForm.reset()
      } catch (error) {

      }
    },

    async sendMagicLink () {
      if (!this.magicLinkValid) {
        return this.$store.dispatch(SHOW_ERROR, 'Veuillez fournir votre adresse courriel')
      }
      try {
        await this.$store.dispatch(SEND_MAGIC_LINK_REQUEST, this.email)
        this.$refs.presignupForm.reset()
        this.$store.dispatch(SHOW_SUCCESS, 'Un lien de connexion vous a été envoyé. Veuillez consulter votre boîte courriel')
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
.presignup {
  width: 40em;
  padding: 1em;
  background: linear-gradient(to bottom, #17a2b8, #063852);
  border-radius: 1em;
  box-shadow: 0.05em 0.1em 0.1em 0.3em #fff;

  @media (max-width: 599px) {
    width: 24em;
  }

  &-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;

    &-title {
      margin: 0.2em 0;
      line-height: 1;
      font-family: 'Poppins-Regular';
      font-size: 60px;
      letter-spacing: 5px;
      color: #fff;
      text-align: center;
      text-transform: uppercase;
      text-shadow: 3px 3px 0px #000;
      text-shadow: 8px 8px 12px #333;
    }

    &-subtitle {
      padding: 5px 0 15px 0;
      line-height: 1;
      font-family: 'Poppins-Medium';
      font-size: 18px;
      color: #fff;
      letter-spacing: 3px;
      text-align: center;
      text-transform: uppercase;
      text-shadow: 8px 8px 12px #333;
    }
  }
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
