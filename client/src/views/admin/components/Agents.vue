<template>
  <div>
    <candilib-users />
    <candilib-archived-users v-if="isCurrentUserCanUnarchivedOtherUsers" />
    <candilib-ipcsr />
    <technical-users v-if="isCanManageTechUsers" />
  </div>
</template>

<script>
import CandilibUsers from './repartiteurDelegue/Users.vue'
import CandilibArchivedUsers from './repartiteurDelegue/ArchivedUsers.vue'
import CandilibIpcsr from './ipcsr/Ipcsr.vue'
import { mapState } from 'vuex'
import TechnicalUsers from './technicalUser/TechnicalUsers.vue'

export default {
  name: 'Agents',

  components: {
    CandilibUsers,
    CandilibArchivedUsers,
    CandilibIpcsr,
    TechnicalUsers,
  },
  computed: {
    ...mapState({
      isCurrentUserCanUnarchivedOtherUsers: state => state.admin.features.includes('unarchive-candidat'),
      isCanManageTechUsers: state => state.admin.status === 'admin',
    }),
  },
}
</script>
