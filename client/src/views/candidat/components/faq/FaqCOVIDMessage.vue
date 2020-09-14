<template>
  <div
    class="question-covid"
    data-nosnippet="true"
  >
    <h3
      class="question-covid-title"
    >
      COVID19 Mesures de sécurité sanitaire à respecter pour le passage de l’examen
    </h3>
    <table class="question-covid-content">
      <th
        colspan="2"
        class="question-covid-subtitle center"
      >
        MESURES OBLIGATOIRES DE SÉCURITÉ SANITAIRE POUR LE PASSAGE DE L’EXAMEN B DU PERMIS DE CONDUIRE
      </th>
      <tr class="pab-2">
        <td class="question-covid-content-col1">
          <img :src="imgMasque">
        </td>
        <td>
          Port obligatoire d'un masque à usage médical (vous et votre accompagnateur).
          <v-divider class="mt-2" />
        </td>
      </tr>
      <tr>
        <td class="question-covid-content-col1">
          <img :src="imgClimForbid">
        </td>
        <td>
          Climatisation et ventilation coupées et véhicule aéré pendant l’examen.
          <v-divider class="mt-2" />
        </td>
      </tr>
      <tr>
        <td class="question-covid-content-col1">
          <img :src="imgHousse">
        </td>
        <td>
          Ventilation autorisée en position basse et sans recyclage d'air.
          <v-divider class="mt-2" />
        </td>
      </tr>
      <tr>
        <td class="question-covid-content-col1">
          <img :src="imgNettoyage">
        </td>
        <td>
          Nettoyage (produit ou lingette virucide respectant la norme EN 14476), aération et désinfection du véhicule avant l’examen.
          <v-divider class="mt-2" />
        </td>
      </tr>
      <tr>
        <td class="question-covid-content-col1">
          <img :src="imgInterdiction">
        </td>
        <td>
          Si toutes les conditions sanitaires précitées ne peuvent être réunies, ou en cas de suspicion du covid-19 (toux, état fébrile), l’examen de conduite ne pourra avoir lieu.
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import imgMasque from '@/assets/images/masque.png'
import imgCasque from '@/assets/images/casque.png'
import imgClimForbid from '@/assets/images/climatisationInterdit.png'
import imgHousse from '@/assets/images/housse.png'
import imgNettoyage from '@/assets/images/nettoyage.png'
import imgInterdiction from '@/assets/images/interdiction.png'

export default {
  components: {
  },
  data () {
    return {
      imgMasque,
      imgCasque,
      imgClimForbid,
      imgHousse,
      imgNettoyage,
      imgInterdiction,
    }
  },
}
</script>

<style lang="stylus" scoped>
.question-covid {
  border-bottom: 1px solid #ddd;
  padding-bottom: 1em;

  &-title {
    padding: 1em 0;
    font-size: 16px;
    font-family: "Raleway", sans-serif;
    color: #891329;
    cursor: pointer;
    text-align: center;
  }

  &-content {
    color: #212529;

    &-col1 {
      text-align: right;
      width: 15%;
      height: 50px;
    }
  }

  &-subtitle {
    margin-bottom: 0.6em;
    text-align: center;
  }
}

.list {
  list-style: disc;
  color: #000;
  margin-bottom: 1em;

  .item {
    line-height: 2em;
  }
}

td {
  padding-right: 2em;
}

img {
  min-width: 50px;
  width: 20%;
}
</style>
