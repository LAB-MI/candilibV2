<template>
  <div>
    <div class="u-flex u-flex--column u-flex--center">
      <candilib-autocomplete
        class="search-input"
        label="Emails"
        hint="Chercher un email dans la whitelist"
        placeholder="marguerite@example.fr"
        :items="matchingList"
        item-text="email"
        item-value="_id"
        :fetch-autocomplete-action="fetchAutocompleteAction"
        @selection="displayEmailSearch"
      />
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'

import {
  FETCH_AUTOCOMPLETE_WHITELIST_REQUEST,
} from '@/store'

import CandilibAutocomplete from './CandilibAutocomplete'

export default {
  components: {
    CandilibAutocomplete,
  },
  data () {
    return {
      fetchAutocompleteAction: FETCH_AUTOCOMPLETE_WHITELIST_REQUEST,
    }
  },

  computed: mapState({
    matchingList: state => state.whitelist.matchingList.slice(0, 6),
  }),

  methods: {
    async displayEmailSearch (matchingList) {
      await this.$store.dispatch(FETCH_AUTOCOMPLETE_WHITELIST_REQUEST, matchingList)
    },
  },
}

</script>
