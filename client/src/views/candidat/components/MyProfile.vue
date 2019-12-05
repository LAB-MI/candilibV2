<template>
  <v-card>
    <page-title>Mon profil</page-title>
    <div class="u-flex  u-flex--column  info-container">
      <div class="u-flex  u-flex--center">
        <v-progress-circular
          v-if="isFetchingProfile"
          indeterminate
          color="primary"
        />
      </div>
      <profile-info
        v-for="info in profileInfo"
        :key="info.label"
        :label="info.label"
        :value="info.value"
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
  name: 'MyProfile',
  components: {
    ProfileInfo,
  },

  computed: {
    isFetchingProfile () {
      return this.$store.state.candidat.isFetchingProfile
    },
    profileInfo () {
      const me = this.$store.state.candidat.me
      return me && Object.entries(me)
        .filter(el => el[0] in labelDictionary)
        .map(([key, value]) => ({
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
