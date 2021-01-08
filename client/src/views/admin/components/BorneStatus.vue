<template>
  <div class="u-flex  u-flex--center  u-flex--v-start mt-2">
    <v-card
      color="info"
      text-color="white"
    >
      <v-card-title>
        Informations des groupes
        <v-avatar
          right
          class="pa-5"
        >
          <refresh-button
            :is-loading="isFetching"
            color-btn="white"
            @click="reloadLastInfosBorneStatus"
          />
        </v-avatar>
      </v-card-title>
      <span>
        <v-card-text
          v-for="data in borneStatus.infos.borneByStatus "
          :key="data.status"
        >
          Groupe <strong>{{ Number(data.status) + 1 }}</strong>
          Date plus ancienne: <strong>{{ data.infos.olderDate }}</strong> et Date plus récente: <strong>{{ data.infos.newerDate }}</strong>.
        </v-card-text>
      </span>
    </v-card>
  </div>
</template>

<script>
import { FETCH_INFOS_BORNE_STATUS_REQUEST } from '@/store'
import { RefreshButton } from '@/components'

export default {
  name: 'BorneStatus',
  components: {
    RefreshButton,
  },
  computed: {
    borneStatus () {
      return this.$store.state.adminBorneStatus
    },
    isFetching () {
      return this.$store.state.adminBorneStatus.isFetchingInfosBorneStatus
    },
  },
  mounted () {
    this.getLastInfosBorneStatus()
  },
  methods: {
    getLastInfosBorneStatus () {
      this.$store.dispatch(FETCH_INFOS_BORNE_STATUS_REQUEST)
    },
    reloadLastInfosBorneStatus () {
      this.getLastInfosBorneStatus()
    },
  },
}
</script>
