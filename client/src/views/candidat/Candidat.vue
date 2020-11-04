<template>
  <div class="candidat  u-flex  u-flex--column">
    <v-container :style="{ maxWidth: '100vw', paddingLeft: 0, paddingRight: 0, flexGrow: 1}">
      <div>
        <candidat-header :links="links" />
        <covid-message-exam />
      </div>
      <div class="u-flex  with-top-margin  u-max-width">
        <div class="u-flex  u-flex__item--grow  u-flex--column-on-mobile  u-flex--center-on-mobile">
          <div class="u-flex__item--grow">
            <router-view />
          </div>
        </div>
      </div>
    </v-container>
    <navigation-drawer
      style="top: 0; position: fixed;"
      :links="links"
    />
    <candidat-footer />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CovidMessageExam from '@/views/candidat/components/CovidMessageExam'
import {
  SIGNED_OUT_CANDIDAT,
  FETCH_MY_PROFILE_REQUEST,
  SHOW_ERROR,
} from '@/store'
import CandidatHeader from './components/CandidatHeader'
import CandidatFooter from './components/CandidatFooter'
import NavigationDrawer from './components/NavigationDrawer'

export default {
  components: {
    CandidatHeader,
    CandidatFooter,
    NavigationDrawer,
    CovidMessageExam,
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
          routerTo: { name: 'my-profile' },
          iconName: 'supervised_user_circle',
          tooltipText: 'Profil candidat',
          label: 'Mon Profil',
        },
        {
          routerTo: { name: 'faq-candidat' },
          iconName: 'help_outline',
          tooltipText: 'FAQ',
          label: 'F.A.Q.',
        },
        {
          routerTo: { name: 'mentions-legales-candidat' },
          iconName: 'account_balance',
          tooltipText: 'Mentions légales',
          label: 'Mentions légales',
        },
      ],
    }
  },

  computed: {
    ...mapGetters(['statusCandidat']),
  },

  watch: {
    statusCandidat (newValue) {
      if (newValue === SIGNED_OUT_CANDIDAT) {
        this.$router.push({ name: 'candidat-presignup' })
      }
    },
  },

  async beforeMount () {
    await this.getMyProfile()
  },

  methods: {
    async getMyProfile () {
      try {
        await this.$store.dispatch(FETCH_MY_PROFILE_REQUEST)
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
</script>

<style lang="postcss" scoped>
.container {
  padding: 0;
}

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
