<template>
  <div>
    <v-simple-table class="u-centered text-uppercase">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-center">
              Email
            </th>
            <th class="text-center">
              Statut
            </th>
            <th class="text-center">
              Départements
            </th>
            <th class="text-center">
              Supprimer
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.email"
            class="t-list"
          >
            <td class="t-list-email">
              {{ user.email }}
            </td>
            <td>{{ user.status }}</td>
            <td>{{ user.departements.join(', ') }}</td>
            <td class="text--center">
              <delete-user
                :email="user.email"
              />
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script>

import { FETCH_USER_LIST_REQUEST } from '@/store'
import deleteUser from './DeleteUser'

export default {
  components: {
    deleteUser,
  },

  computed: {
    users () {
      return this.$store.state.users.list || []
    },
  },

  mounted () {
    this.$store.dispatch(FETCH_USER_LIST_REQUEST)
  },
}
</script>

<style lang="stylus" scoped>

table {
  margin-top: 30px;
  width: 90%;
  border-collapse: collapse;
}

thead {
  border: 1px solid;
  background-color: #b3d4fc;
}

td {
  padding: 10px;
  border: 1px solid grey;
}

</style>
