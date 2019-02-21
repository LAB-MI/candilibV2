<template>
  <v-card color="#169DB2" class="white--text">
    <v-card-title primary-title class="u-border-bottom">
      <h3 class="headline white--text">Mes informations</h3>
    </v-card-title>
    <div class="u-flex  u-flex--column  info-container">
      <div class="u-flex  u-flex--center">
        <v-progress-circular
          v-if="isFetchingProfile"
          indeterminate
          color="primary"
        ></v-progress-circular>
      </div>
      <profile-info
        v-for="info in profileInfo"
        :label="info.label"
        :value="info.value"
        :key="info.label"
      />
    </div>
  </v-card>
</template>

<script>
import ProfileInfo from './ProfileInfo'
import { FETCH_MY_PROFILE_REQUEST } from '@/store'

const labelDictionary = {
  email: 'Courriel',
  adresse: 'Adresse',
  codeNeph: 'NEPH',
  nomNaissance: 'Nom de naissance',
  portable: 'Portable',
  prenom: 'Prénom',
}

export default {
  name: 'my-profile',
  components: {
    ProfileInfo,
  },

  computed: {
    isFetchingProfile () {
      return this.$store.state.candidat.isFetchingProfile
    },
    profileInfo () {
      const me = this.$store.state.candidat.me
      return me && Object.entries(me).map(([key, value]) => ({
        label: labelDictionary[key],
        value,
      }))
    },
  },

  mounted () {
    this.$store.dispatch(FETCH_MY_PROFILE_REQUEST)
  },
}
</script>

<style lang="postcss" scoped>
.u-border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.info-container {
  padding: 1em;
}
</style>
