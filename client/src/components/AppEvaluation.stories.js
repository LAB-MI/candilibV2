import { storiesOf } from '@storybook/vue'
import Vuex from 'vuex'
import AppEvaluation from '@/components/AppEvaluation'

storiesOf('Common/AppEvaluation', module)
  .add('AppEvaluation', () => ({
    components: {
      AppEvaluation,
    },
    template: `<div>
      <button @click="$store.dispatch('SET_SHOW_EVALUATION', !$store.state.candidat.showEvaluation)">Show Evaluation</button>
      <app-evaluation/>
    </div>`,
    store: new Vuex.Store({
      state: {
        candidat: {
          showEvaluation: false,
        },
      },

      mutations: {
        SET_SHOW_EVALUATION (state, showEvaluation) {
          state.candidat.showEvaluation = showEvaluation
        },
      },

      actions: {
        SET_SHOW_EVALUATION ({ commit }, showEvaluation) {
          commit('SET_SHOW_EVALUATION', showEvaluation)
        },
        SEND_EVALUATION_REQUEST ({ commit, state }, evaluation) {
          state.candidat.showEvaluation = false
        },
      },
    }),
  }))
