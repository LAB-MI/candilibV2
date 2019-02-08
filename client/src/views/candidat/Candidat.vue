<template>
  <div class="candidat">
    <v-container :style="{ maxWidth: '100vw', paddingLeft: 0, paddingRight: 0 }">
      <candidat-header :links="links" />
      <div class="u-flex  with-top-margin u-max-width">
        <faq v-if="isFaq" />
        <legal v-if="isLegal" />
        <div v-if="isCalendar" class="u-flex  u-flex__item--grow  u-flex--column-on-mobile">
          <my-profile class="profile" />
          <div class="u-flex__item--grow">
            <section>
              <header class="candidat-section-header">
                <h2 v-if="isCalendar" class="candidat-section-header__title">
                  Ma réservation
                </h2>
              </header>
            </section>
          </div>
        </div>
      </div>
      <candidat-footer style="margin-top: 10px" />
    </v-container>
    <navigation-drawer
      :links="links"
    />
  </div>
</template>

<script>
import CandidatHeader from './components/CandidatHeader'
import CandidatFooter from './components/CandidatFooter'
import NavigationDrawer from './components/NavigationDrawer'

import Faq from './Faq'
import Legal from './Legal'
import MyProfile from './components/MyProfile'

export default {
  components: {
    CandidatHeader,
    CandidatFooter,
    Faq,
    Legal,
    MyProfile,
    NavigationDrawer,
  },

  data () {
    return {
      links: [
        {
          routerTo: '/candidat',
          iconName: 'home',
          tooltipText: 'Ma réservation',
          label: 'Ma réservation',
        },
        {
          routerTo: '/candidat/faq',
          iconName: 'help_outline',
          tooltipText: 'FAQ',
          label: 'F.A.Q.',
        },
        {
          routerTo: '/candidat/legal',
          iconName: 'account_balance',
          tooltipText: 'Mentions légales',
          label: 'Mentions légales',
        },
      ],
    }
  },

  computed: {
    isFaq () {
      return this.$route.params.subpage === 'faq'
    },
    isLegal () {
      return this.$route.params.subpage === 'legal'
    },
    isCalendar () {
      return !this.$route.params.subpage
    },
  },
}
</script>

<style lang="postcss" scoped>
.with-top-margin {
  margin-top: 4rem;
}

.profile {
  margin: 0 1em;
  width: 20rem;
}

.candidat-section-header {
  font-family: 'Poppins-Regular', Arial, Helvetica, sans-serif;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &::after {
    content: '';
    width: 60px;
    height: 5px;
    background: #f82249;
    bottom: 0;
  }

  &__title {
    font-size: 2.5rem;
    text-transform: uppercase;
    text-align: center;
    font-weight: 700;
    margin-bottom: 10px;
  }
}
</style>
