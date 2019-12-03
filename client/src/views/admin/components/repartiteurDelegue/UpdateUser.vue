<template>
 <v-dialog
    v-model="updating"
    width="800"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        class="t-btn-update"
        slot="activator"
        color="primary"
        v-on="on"
        icon
      >
      <v-icon>edit</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class=" t-title-update headline grey lighten-2"
        primary-title
      >
        Modification de {{ email }}
      </v-card-title>

    <v-container class="u-flex  u-flex--between  u-full-width">

      <select-status
        class="t-select-update-status"
        @change-status="newStatus => status = newStatus"
      />

      <v-spacer></v-spacer>

      <select-departements
        class="t-select-update-departements"
        @change-departements="newDep => departements = newDep"
      />

      <v-spacer></v-spacer>

      <v-btn
          class="t-btn-cancel-update"
          color="#CD1338"
          tabindex="0"
          outlined
          @click="updating = false"
        >
        Annuler
        </v-btn>
        <v-btn
          class="t-btn-update-confirm"
          color="primary"
          :disabled=" isUpdatingUser"
          :aria-disabled="isUpdatingUser"
          @click="updateUser"
        >
          Oui, modifier
        </v-btn>
    </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import SelectStatus from './SelectStatus'
import SelectDepartements from './SelectDepartements'
import { SHOW_SUCCESS, FETCH_USER_LIST_REQUEST, SHOW_ERROR, UPDATE_USER_REQUEST } from '../../../../store'

export default {
  components: {
    SelectStatus,
    SelectDepartements,
  },

  props: {
    email: String,
  },

  data () {
    return {
      departements: [],
      updating: false,
      status: 'repartiteur',
    }
  },

  computed: {
    isUpdatingUser () {
      return this.$store.state.users.isUpdating || false
    },
  },

  methods: {
    async updateUser () {
      const {
        email,
        status,
        departements,
      } = this
      try {
        await this.$store.dispatch(UPDATE_USER_REQUEST, { email, status, departements })
        this.$store.dispatch(SHOW_SUCCESS, `L'utilisateur a bien été modifié`)
        this.$store.dispatch(FETCH_USER_LIST_REQUEST)
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
      this.updating = false
    },
  },
}
</script>
