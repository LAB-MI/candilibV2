<template>
  <section>
    <v-alert
      value="true"
      type="error"
      class="rounded-corner"
    >
      <p>
        EXAM COVID 19 Presignup
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate, error. Repellendus .
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius repudiandae rerum fuga
        Lorem ipsum dolor sit amet consectetur, adipisicing elit.

        <router-link
          :to="{ name: 'faq' }"
          class="t-faq"
          style="border: 2px solid red;"
        >
          <v-btn
            text
            color="#fff"
            tag="a"
            :to="{ name: 'faq' }"
            tabindex="10"
          >
            FAQ
          </v-btn>
        </router-link>
      </p>
    </v-alert>
  </section>
</template>

<script>

export default {
  components: {
  },
}
</script>

<style lang="stylus" scoped>
.link-color {
  color: white;
  text-decoration: underline;
}

.actions {
  display: grid;
  justify-content: center;
  grid-template-columns: auto auto;
  justify-items: center;
}
</style>
