import { storiesOf } from '@storybook/vue'

import InfoInspecteur from './InfoInspecteur'
import { dict } from './SearchInspecteur'

let inspecteur = {
  _id: 1,
  matricule: '012345678910',
  nom: 'Emilie',
  prenom: 'Emilie',
  portable: '0601020304',
  email: 'emilie@email.fr',
  departement: '93',
}

inspecteur = Object.entries(inspecteur)
  .reduce((acc, [key, value]) => {
    if (key === '_id') {
      return acc
    }

    return [
      ...acc,
      [(dict[key] || key), value],
    ]
  }, [])
storiesOf('Admin/InfoInspecteur', module)
  .add('Basic', () => ({
    components: { InfoInspecteur },
    template: `<info-inspecteur
      :inspecteur="inspecteur"
    />`,
    data () {
      return {
        inspecteur,
      }
    },
  }))
