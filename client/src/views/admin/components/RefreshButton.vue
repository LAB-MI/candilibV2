<template>
  <div class="text-xs-center">
    <refresh-button
      :is-loading="!!isLoading"
      @click="reloadWeekMonitor"
    />
  </div>
</template>

<script>
import { FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST } from '@/store'
import { RefreshButton } from '@/components'

export default {
  components: {
    RefreshButton,
  },

  computed: {
    isLoading () {
      return this.$store.state.admin.places.isFetching
    },
  },

  methods: {
    async reloadWeekMonitor () {
      await this.$store.dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST)
    },
  },
}
</script>
