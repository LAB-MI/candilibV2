<template>
  <div class="candidat  u-flex  u-flex--column">
    <v-container :style="{ maxWidth: '100vw', paddingLeft: 0, paddingRight: 0, flexGrow: 1}">
      <candidat-header :links="links" />
      <div class="u-flex  with-top-margin  u-max-width">
        <div class="u-flex  u-flex__item--grow  u-flex--column-on-mobile  u-flex--center-on-mobile">
          <div class="u-flex__item--grow">
            <router-view />
          </div>
        </div>
      </div>
    </v-container>
    <navigation-drawer
      style="top: 0; position: fixed"
      :links="links"
    />
    <candidat-footer style="margin-top: 10px;" />
  </div>
</template>

<script>
import CandidatHeader from './components/CandidatHeader'
import CandidatFooter from './components/CandidatFooter'
import NavigationDrawer from './components/NavigationDrawer'

export default {
  components: {
    CandidatHeader,
    CandidatFooter,
    NavigationDrawer,
  },

  data () {
    return {
      links: [
        {
          routerTo: { name: 'candidat-home' },
          iconName: 'home',
          tooltipText: 'Ma réservation',
          label: 'Ma réservation',
        },
        {
          routerTo: { name: 'faq' },
          iconName: 'help_outline',
          tooltipText: 'FAQ',
          label: 'F.A.Q.',
        },
        {
          routerTo: { name: 'mentions-legales' },
          iconName: 'account_balance',
          tooltipText: 'Mentions légales',
          label: 'Mentions légales',
        },
        {
          routerTo: { name: 'candidat-information' },
          iconName: 'supervised_user_circle',
          tooltipText: 'Profile candidat',
          label: 'Profile candidat',
        },
      ],
    }
  },
}
</script>

<style lang="postcss" scoped>
.candidat {
  min-height: 100%;
}

.with-top-margin {
  margin-top: 4rem;
}

.profile {
  margin-right: 1em;
  margin-left: 1em;
  width: 20rem;

  @media (max-width: 599px) {
    order: 2;
    margin: 1em auto 0 auto;
  }
}
</style>
