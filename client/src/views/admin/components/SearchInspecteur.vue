<template>
  <div>
    <autocomplete-inspecteurs
      class="search-input"
      @selection="displayInspecteurInfo"
    />
    <info-inspecteur
      v-if="inspecteur"
      :inspecteur="inspecteur"
    />
  </div>
</template>

<script>
import AutocompleteInspecteurs from './AutocompleteInspecteurs'
import InfoInspecteur from './InfoInspecteur'

export const dict = {
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
    AutocompleteInspecteurs,
    InfoInspecteur,
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
      console.log('TCL: displayInspecteurInfo -> this.inspecteur', this.inspecteur)
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
