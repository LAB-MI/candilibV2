<template>
  <div>
    <autocomplete-candidats
      class="search-input"
      @selection="displayCandidatInfo"
    />

    <info-candidat
      v-if="candidat"
      :candidat="candidat"
    />
  </div>
</template>

<script>
import AutocompleteCandidats from './AutocompleteCandidats'

export const dict = {
  adresse: 'Adresse',
  codeNeph: 'NEPH',
  email: 'Email',
  nomNaissance: 'Nom',
  prenom: 'Prénom',
  portable: 'Portable',
  presignedUpAt: 'Inscrit le',
}

export default {
  components: {
    AutocompleteCandidats,
  },

  data () {
    return {
      title: 'Informations Candidat',
      candidat: undefined,
    }
  },

  methods: {
    displayCandidatInfo (candidat) {
      this.candidat = Object.entries(candidat)
        .reduce((acc, [key, value]) => {
          if (key === '_id') {
            return acc
          }

          return [
            ...acc,
            [(dict[key] || key), value],
          ]
        }, [])
    },
  },
}
</script>

<style lang="stylus" scoped>

.title-style {
  margin: auto;
  text-align: center;
  font-family: "Raleway", sans-serif;
  font-size: 1 rem;
  text-transform: uppercase;
  font-weight: 600;
}

.candidat-info {
  display: flex;
  flex-direction: column;
  margin: 15 px;
  padding: 15 px;
  font-family: 'Poppins-Regular', Arial, Helvetica, sans-serif;
  box-shadow: 0 0 2px #555;
}

.container {
  display: flex;
  width: 100%;
}

.label {
  flex-basis: 7rem;
}

.value {
  flex-grow: 1;
}
</style>
