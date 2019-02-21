<template>
  <div class="conrainer">
  <div class="section-header">
    <h2 class="page-title">Mentions légales</h2>
    <p class="date-info">Modifié le 21 décembre 2018</p>
  </div>
    <div v-for="(item, index) in ArrayContent" :key="index">
     
      <MentionLegale
        :icon="item.icon"
        :mainTitle="item.mainTitle"
        :textContent="item.textContent"
        :listInfo="item.listInfo"
      />
    </div>
  </div>
</template>

<script>

import MentionLegale from './MentionLegale.vue'


export default {
  name: 'mentions-legales',
    components: {
    MentionLegale,
  },
  data () {
    return {
      ArrayContent: [
        {
          icon: "border_color",
          mainTitle: "Information éditeurs",
          textContent: [
            {
              subTextContent: "Ce site est géré par la Délégation à la sécurité routière (DSR) Place Beauvau - 75800 PARIS CEDEX 08 Tél. : 01 49 27 49 27.",              
            }
          ], 
        },
        {
          icon: "work_outline",
          mainTitle: "MAIN-TITLE Y",
          textContent: [
            {
              subTitle: "SUBTITLE-1 Y",
              subTextContent: "SUBTEXTCONTENT-WITH-SUBTITILE-1 Y",
            },
            {
              subTextContent: "Tout site public ou privé est autorisé à établir, sans autorisation préalable, un lien vers les informations diffusées dans ce site. En revanche les pages du site beta.interieur.gouv.fr/candilib ne doivent pas être imbriquées à l’intérieur des pages d’un autre site : rien ne doit méprendre le visiteur sur l’origine d’une page vue.",              
            },
            {
              subTitle: "SUBTITLE-2 Y",
              subTextContent: "Tout site public ou privé est autorisé à établir, sans autorisation préalable, un lien vers les informations diffusées dans ce site. En revanche les pages du site beta.interieur.gouv.fr/candilib ne doivent pas être imbriquées à l’intérieur des pages d’un autre site : rien ne doit méprendre le visiteur sur l’origine d’une page vue.",              
            },
            {
              subTextContent: "SUBTEXTCONTENT-ALONE-2 Y",
            }
          ],
          listInfo: [ 
            'Code Neph',        
            'Code Neph',        
            'Transmettre par quelque procédé que ce soit (e-mail ou autres), tout contenu incluant des programmes, des codes, des virus, etc. destinés à détruire ou limiter les fonctionnalités du site Internet de l’éditeur.',
            'Transmettre par quelque procédé que ce soit dans les services interactifs proposés sur le site Internet de l’éditeur, tout contenu illicite ou nuisible, et notamment des photos ou messages à caractère injurieux, insultant, diffamant, dénigrant, dégradant, raciste, xénophobe, sexiste, pornographique, menaçant ou qui pourrait inciter à la haine ou au harcèlement et allant à l\'encontre du droit au respect de la vie privée ou sans rapport avec les thèmes proposés',
          ],
        },
        {
          icon: "work_outline",
          mainTitle: "MAIN-TITLE Y",
          textContent: [
            {
              subTitle: "SUBTITLE-1 Y",
              subTextContent: "Tout site public ou privé est autorisé à établir, sans autorisation préalable, un lien vers les informations diffusées dans ce site. En revanche les pages du site beta.interieur.gouv.fr/candilib ne doivent pas être imbriquées à l’intérieur des pages d’un autre site : rien ne doit méprendre le visiteur sur l’origine d’une page vue.",
            },
            {
              subTextContent: "SUBTEXTCONTENT-ALONE-1 Y",
            },
            {
              subTitle: "SUBTITLE-2 Y",
              subTextContent: "Tout site public ou privé est autorisé à établir, sans autorisation préalable, un lien vers les informations diffusées dans ce site. En revanche les pages du site beta.interieur.gouv.fr/candilib ne doivent pas être imbriquées à l’intérieur des pages d’un autre site : rien ne doit méprendre le visiteur sur l’origine d’une page vue.",              
            },
            {
              subTextContent: "Tout site public ou privé est autorisé à établir, sans autorisation préalable, un lien vers les informations diffusées dans ce site. En revanche les pages du site beta.interieur.gouv.fr/candilib ne doivent pas être imbriquées à l’intérieur des pages d’un autre site : rien ne doit méprendre le visiteur sur l’origine d’une page vue.",
            }
          ],
          listInfo: [ 
            'Code Neph',        
            'Code Neph',        
            'Transmettre par quelque procédé que ce soit (e-mail ou autres), tout contenu incluant des programmes, des codes, des virus, etc. destinés à détruire ou limiter les fonctionnalités du site Internet de l’éditeur.',
            'Transmettre par quelque procédé que ce soit dans les services interactifs proposés sur le site Internet de l’éditeur, tout contenu illicite ou nuisible, et notamment des photos ou messages à caractère injurieux, insultant, diffamant, dénigrant, dégradant, raciste, xénophobe, sexiste, pornographique, menaçant ou qui pourrait inciter à la haine ou au harcèlement et allant à l\'encontre du droit au respect de la vie privée ou sans rapport avec les thèmes proposés',
          ],
        }
      ],
    }
  },

  computed: {
  },

  methods: {
  },
}
</script>

<style>
  .page-title {
    font-size: 36px;
    text-transform: uppercase;
    text-align: center;
    font-weight: 700;
    margin-bottom: 10px;
    font-family: "Raleway", sans-serif;
    color: #0e1b4d;
    padding: 0;
  }
  .date-info {
    text-align: center;
    padding: 0;
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: #9195a2;
  }
  .conrainer {
    position: relative;
    width: 100%;
    height: auto;
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
    max-width: 740px;
    font-family: "Poppins", sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    text-align: left;
  }
  .section-header {
    margin-bottom: 60px;
    position: relative;
    padding-bottom: 20px;
  }
  .section-header {
    margin-bottom: 60px;
    position: relative;
    padding-bottom: 20px;
  }
</style>
