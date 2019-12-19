<template>
  <div>
    <CandilibUsers />
    <CandilibIpcsr />
  </div>
</template>

<script>
import CandilibUsers from './repartiteurDelegue/Users.vue'
import CandilibIpcsr from './ipcsr/Ipcsr.vue'

export default {
  components: {
    CandilibUsers,
    CandilibIpcsr,
  },
}
</script>
