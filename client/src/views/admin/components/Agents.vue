<template>
  <div>
    <candilib-users />
    <candilib-archived-users v-if="isCurrentUserCanUnarchivedOtherUsers" />
    <candilib-ipcsr />
  </div>
</template>

<script>
import CandilibUsers from './repartiteurDelegue/Users.vue'
import CandilibArchivedUsers from './repartiteurDelegue/ArchivedUsers.vue'
import CandilibIpcsr from './ipcsr/Ipcsr.vue'
import { mapState } from 'vuex'

export default {
  name: 'Agents',

  components: {
    CandilibUsers,
    CandilibArchivedUsers,
    CandilibIpcsr,
  },
  computed: {
    ...mapState({
      isCurrentUserCanUnarchivedOtherUsers: state => state.admin.features.includes('unarchive-candidat'),
    }),
  },
}
</script>
