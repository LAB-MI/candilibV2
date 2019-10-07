<template>
  <v-card>
    <v-card-title class="title u-flex u-flex--center">
    <h3>{{ title }}</h3>
    </v-card-title>
    <v-card-text>
      <v-card
        class="spaced"
        v-for="groupInfo of profileInfo"
        :key="groupInfo[0][1]"
      >
        <div v-for="([title, value]) of groupInfo" :key="title">
          <div class="u-flex  u-flex--v-center">
            <strong class="label">{{ title }}&nbsp;:</strong>
            <span class="value" v-html="value"></span>
          </div>
        </div>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  props: {
    profileInfo: Array,
    title: String,
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

.spaced {
  padding: 1em;
  margin: 0.5em 0;
}

.label {
  line-height: 1.5em;
  flex-basis: 15rem;
}

.value {
  flex-shrink: 1;
}
</style>
