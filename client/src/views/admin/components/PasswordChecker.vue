<template>
  <ul class="password-checker">
    <checker
      v-for="([key, value]) in checks"
      v-show="!value"
      :key="key"
      :text="key"
      :valid="value"
    />
  </ul>
</template>

<script>

import Checker from '@/views/admin/components/Checker.vue'
import { strongEnoughPasswordObject } from '@/util'

export default {

  components: {
    Checker,
  },
  props: {
    password: {
      type: String,
      default: '',
    },
  },

  data () {
    return {
      checks: Object.entries(strongEnoughPasswordObject).map(
        ([key, regex]) => { return [key, regex.test(this.password)] },
      ),
    }
  },

  watch: {
    password (password) {
      const checks = Object.entries(strongEnoughPasswordObject).map(
        ([key, regex]) => { return [key, regex.test(password)] },
      )

      this.checks = checks
    },
  },

}
</script>

<style lang="postcss" scoped>
.password-checker {
  list-style: none;
  padding: 0;
  margin-top: -1.5em;
  font-size: 0.8em;
}
</style>
