<template>
  <section data-nosnippet="true">
    <message-end />
    <footer>
      <div class="actions">
        <router-link
          :to="{ name: 'faq' }"
          class="t-faq"
        >
          <v-btn
            text
            color="#fff"
            tag="a"
            :to="{ name: 'faq' }"
            tabindex="10"
          >
            Une Question ?
          </v-btn>
        </router-link>

        <router-link
          :to="{ name: 'mentions-legales' }"
          class="t-mentions-legales"
        >
          <v-btn
            text
            color="#fff"
            tag="a"
            :to="{ name: 'mentions-legales' }"
            tabindex="9"
          >
            Mentions Légales
          </v-btn>
        </router-link>
      </div>
    </footer>
  </section>
</template>

<script>
import MessageEnd from './MessageEnd'
export default {
  components: {
    MessageEnd,
  },
}
</script>

<style scoped>
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
