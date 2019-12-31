<template>
  <v-dialog
    v-model="updating"
    width="800"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        slot="activator"
        class="t-btn-update"
        color="primary"
        icon
        v-on="on"
      >
        <v-icon>edit</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class=" t-title-update headline grey lighten-2"
        primary-title
      >
        Modification de {{ email }} {{ status }} {{ departements.join(', ') }}
      </v-card-title>

      <v-container class="u-flex  u-flex--between  u-full-width">
        <select-status
          class="t-select-update-status"
          @change-status="newStatus => status = newStatus"
        />

        <v-spacer />

        <select-departements
          multiple
          class="t-select-update-departements"
          :available-departements="availableDepartements"
          :default-departements="departements"
          @change-departements="newDep => departements = newDep"
        />

        <v-spacer />

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
          Modifier
        </v-btn>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import SelectStatus from './SelectStatus'
import SelectDepartements from '../SelectDepartements'
import { FETCH_USER_LIST_REQUEST, UPDATE_USER_REQUEST } from '@/store'
import { mapState } from 'vuex'

export default {
  components: {
    SelectStatus,
    SelectDepartements,
  },

  props: {
    defaultDepartements: {
      type: Array,
      default () {
        return []
      },
    },
    defaultStatus: {
      type: String,
      default: 'repartiteur',
    },
    email: {
      type: String,
      default: 'repartiteur@example.com',
    },
  },

  data () {
    return {
      updating: false,
      departements: this.defaultDepartements,
      status: this.defaultStatus,
    }
  },

  computed: {
    ...mapState({
      availableDepartements: state => state.admin.departements.list,
    }),

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
        this.$store.dispatch(FETCH_USER_LIST_REQUEST)
      } catch (error) {
      }
      this.updating = false
    },
  },
}
</script>
