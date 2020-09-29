<template>
  <div>
    <CandilibUsers />
    <CandilibArchivedUsers />
    <CandilibIpcsr />
  </div>
</template>

<script>
import CandilibUsers from './repartiteurDelegue/Users.vue'
import CandilibArchivedUsers from './repartiteurDelegue/ArchivedUsers.vue'
import CandilibIpcsr from './ipcsr/Ipcsr.vue'

export default {
  name: 'Agents',

  components: {
    CandilibUsers,
    CandilibArchivedUsers,
    CandilibIpcsr,
  },
}
</script>
