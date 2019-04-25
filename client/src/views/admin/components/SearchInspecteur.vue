<template>
  <div>
    <search-inspecteurs
      class="search-input"
      @selection="displayInspecteurInfo"
    />

    <div v-if="inspecteur" class="info-style">
      <div class="title-style">
        <p>{{ title }}</p>
      </div>
      <div
        v-for="([key, value]) in inspecteur"
        :key="key"
        class="container-style"
      >
         <div class="label"><strong>{{ key }}&nbsp;:</strong></div>
         <div class="value">{{ value }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import SearchInspecteurs from './SearchInspecteurs'

const dict = {
  adresse: 'Adresse',
  matricule: 'Matricule',
  email: 'Email',
  nom: 'Nom',
  prenom: 'Prénom',
  portable: 'Portable',
  departement: 'Département',

}

export default {
  components: {
    SearchInspecteurs,
  },

  data () {
    return {
      title: 'Informations Inspecteur',
      inspecteur: undefined,
    }
  },

  methods: {
    displayInspecteurInfo (inspecteur) {
      this.inspecteur = Object.entries(inspecteur)
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

.info-style {
  display: flex;
  flex-direction: column;
  margin: 15 px;
  padding: 15 px;
  font-family: 'Poppins-Regular', Arial, Helvetica, sans-serif;
  box-shadow: 0 0 2px #555;
}

.container-style {
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
