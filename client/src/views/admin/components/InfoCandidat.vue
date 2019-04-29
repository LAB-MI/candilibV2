<template>
  <div class="candidat-info">
    <div class="title">
      <h3>{{ title }}</h3>
    </div>
    <div
      v-for="([key, value]) in candidat"
      :key="key"
      class="container"
    >
      <div v-if="fillterKey(key)" class="label">
        <strong>
          {{ key }}&nbsp;:
        </strong>
      </div>
      <div v-if="fillterKey(key)" class="value">
        {{ value }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      title: 'Informations Candidat',
    }
  },

  props: {
    candidat: Object,
  },

  mounted () {
    console.log(this.profileInfo)
  },
}
</script>

<style lang="stylus" scoped>
p {
  display: flex;
  color: black;
}

.title {
  margin: auto;
  text-align: center;
  font-family: 'Raleway', sans-serif;
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
  flex-basis: 1rem;
}

.value {
  flex-grow: 1;
}
</style>
