<template>
  <div class="inspecteur-info">
    <div class="title">
      <h3>{{ title }}</h3>
    </div>
    <v-layout column>
      <v-card color="white">
        <v-flex xs12>
          <div v-for="([key, value]) in inspecteur" :key="key" class="container">
            <div v-if="fillterKey(key)" class="label">
              <strong>{{ key }}&nbsp;:</strong>
            </div>
            <div v-if="fillterKey(key)" class="value">{{ value }}</div>
          </div>
        </v-flex>
      </v-card>
    </v-layout>
  </div>
</template>

<script>
export default {
  data () {
    return {
      title: 'Informations Inspecteur',
    }
  },

  props: {
    inspecteur: Object,
  },
  methods: {
    fillterKey (keyToCheck) {
      return !['__v'].includes(keyToCheck)
    },
  },
}
</script>

<style lang="stylus" scoped>
.title {
  margin: auto;
  text-align: center;
  font-family: 'Raleway', sans-serif;
  font-size: 1 rem;
  text-transform: uppercase;
  font-weight: 600;
}

.inspecteur-info {
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
  flex-basis: 10rem;
}

.value {
  flex-grow: 1;
}
</style>
