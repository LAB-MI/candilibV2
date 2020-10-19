<template>
  <v-dialog
    v-model="updating"
    :width="!isArchivedUsers ? '800' : '500'"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        v-if="!isArchivedUsers"
        slot="activator"
        color="primary"
        class="t-btn-update"
        icon
        v-on="on"
      >
        <v-icon class="t-btn-update-icon">
          edit
        </v-icon>
      </v-btn>
      <v-btn
        v-else
        slot="activator"
        color="primary"
        icon
        v-on="on"
      >
        <v-icon class="t-archive-user-icon">
          restore_from_trash
        </v-icon>
      </v-btn>
    </template>

    <v-card v-if="!isArchivedUsers">
      <v-card-title
        class="t-title-update headline grey lighten-2"
        primary-title
      >
        Modification de {{ email }} {{ status }} {{ departements.join(', ') }}
      </v-card-title>

      <v-container class="u-flex  u-flex--between  u-full-width">
        <select-status
          class="t-select-update-status"
          :menu-props="{ minWidth: 150 }"
          @change-status="newStatus => status = newStatus"
        />

        <v-spacer />

        <select-departements
          multiple
          class="t-select-update-departements"
          :available-departements="availableDepartements"
          :default-departements="departements"
          :menu-props="{ minWidth: 150 }"
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
          @click="updateUser(false)"
        >
          Modifier
        </v-btn>
      </v-container>
    </v-card>
    <v-card v-else>
      <v-card-title
        class="t-title-user-archive headline  grey  lighten-2"
        primary-title
      >
        Reactiver {{ email }}
      </v-card-title>

      <v-card-text class="confirmation-text">
        Voulez-vous vraiment Reactiver ce <strong>{{ status }}</strong> ?
      </v-card-text>

      <v-divider />

      <v-card-actions right>
        <v-spacer />
        <v-btn
          color="#CD1338"
          tabindex="0"
          outlined
          @click="updating = false"
        >
          Annuler
        </v-btn>
        <v-btn
          class="t-archive-user-submit"
          type="submit"
          color="primary"
          :disabled=" isUpdatingUser"
          :aria-disabled="isUpdatingUser"
          @click="updateUser(true)"
        >
          Oui, Reactiver
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import SelectStatus from './SelectStatus'
import SelectDepartements from '../SelectDepartements'
import { FETCH_USER_LIST_REQUEST, UPDATE_USER_REQUEST, FETCH_ARCHIVED_USER_LIST_REQUEST } from '@/store'
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
    isArchivedUsers: {
      type: Boolean,
      default: false,
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
    async updateUser (isUnArchive) {
      const {
        email,
        status,
        departements,
      } = this
      try {
        await this.$store.dispatch(UPDATE_USER_REQUEST, { email, status, departements, isUnArchive })
        this.$store.dispatch(FETCH_USER_LIST_REQUEST)
        this.$store.dispatch(FETCH_ARCHIVED_USER_LIST_REQUEST)
      } catch (error) {
      }
      this.updating = false
    },
  },
}
</script>

<style lang="stylus" scoped>
.confirmation-text {
  font-size: 1.3em;
}
</style>
