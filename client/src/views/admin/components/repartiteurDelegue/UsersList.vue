<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="users"
      :items-per-page="10"
      :class="`elevation-1 ${isArchivedUsers ? 't-list-archive-users' : 't-list-users'}`"
    >
      <template v-slot:[`item.action`]="{ item }">
        <update-user
          :is-archived-users="isArchivedUsers"
          :email="item.email"
          :default-status="item.status"
          :default-departements="item.departements"
        />
        <delete-user
          v-if="!isArchivedUsers"
          :email="item.email"
        />
      </template>
    </v-data-table>
  </div>
</template>

<script>
import DeleteUser from './DeleteUser'
import UpdateUser from './UpdateUser'
export default {
  name: 'UsersList',

  components: {
    DeleteUser,
    UpdateUser,
  },

  props: {
    users: {
      type: Array,
      default: () => [],
    },
    isArchivedUsers: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      headers: [
        { text: 'Adresse courriel', value: 'email', class: 'text-uppercase' },
        { text: 'Statut', value: 'status', class: 'text-uppercase' },
        { text: 'Départements', value: 'departementsAsString', class: 'text-uppercase' },
        { text: 'Actions', value: 'action', align: 'center', class: 'text-uppercase' },
      ],
      editedUser: {},
    }
  },
}
</script>
