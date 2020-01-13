<template>
  <div class="u-max-width">
    <page-title :title="'Liste des inspecteurs'" />

    <create-ipcsr class="elevation-1  mt-4  white  t-create-ipcsr-form" />

    <list-ipcsr class="mt-4  mb-8" />
  </div>
</template>

<script>
import { FETCH_IPCSR_LIST_REQUEST } from '@/store'

import ListIpcsr from './ListIpcsr'
import CreateIpcsr from './CreateIpcsr'

export default {
  components: {
    CreateIpcsr,
    ListIpcsr,
  },

  mounted () {
    this.$store.dispatch(FETCH_IPCSR_LIST_REQUEST)
  },
}
</script>
