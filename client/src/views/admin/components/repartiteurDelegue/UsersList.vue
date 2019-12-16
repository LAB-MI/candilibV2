<template>
  <div>
    <v-simple-table class="u-centered text-uppercase">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-center  text-white">
              Email
            </th>
            <th class="text-center  text-white">
              Statut
            </th>
            <th class="text-center  text-white">
              Départements
            </th>
            <th class="text-center  text-white">
              Actions
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
            <td>
              {{ user.status }}
            </td>
            <td>{{ user.departements.join(', ') }}</td>
            <td class="text--center">
              <update-user
                :email="user.email"
                :default-status="user.status"
                :default-departements="user.departements"
              />
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
import DeleteUser from './DeleteUser'
import UpdateUser from './UpdateUser'
export default {
  components: {
    DeleteUser,
    UpdateUser,
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
  background-color: #4eb5c5;
}

td {
  padding: 10px;
  border: 1px solid grey;
}

.text-white {
  color: white !important;
}
</style>
