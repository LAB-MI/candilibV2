<template>
  <div>
    <div class="u-flex u-flex--center">
      <candilib-autocomplete
        class="search-input"
        @selection="displayEmailSearch"
        label="Emails"
        hint="Chercher un email dans la whitelist"
        placeholder="marguerite@example.fr"
        :items="whitelist"
        item-text="email"
        item-value="_id"
        :fetch-autocomplete-action="fetchAutocompleteAction"
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
      selectedEmail: undefined,
      fetchAutocompleteAction: FETCH_AUTOCOMPLETE_WHITELIST_REQUEST,
    }
  },
  computed: mapState({
    whitelist: state => state.whitelist.list,

  }),

  methods: {

  },

}

</script>
