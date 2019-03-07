<template>
    <div>
        <v-toolbar 
            dark
        >
            <v-btn @click="goToSelectTimeSlot()">
                <v-icon>
                    arrow_back_ios
                </v-icon>
                    CHOIX DU CRÉNEAU
            </v-btn>
        </v-toolbar>
        <v-card>
            <v-card-title>
                <p>codeNeph: {{ candidat.me.codeNeph }}</p>
                <p>Mme/M :{{ candidat.me.nomNaissance }} {{ candidat.me.prenom }}</p>
            </v-card-title>
            <v-card-title>
                <!-- <h4>VOUS AVEZ CHOISI LE CRÉNEAU:</h4> -->
                <p>{{ this.convertIsoDate(timeSlots.selected.slot) }}</p>
            </v-card-title>
            <v-card-title>
                <!-- <h4>VOUS AVEZ CHOISI LE CENTRE: </h4> -->
                <!-- <span>{{ selectedCenter.nom }}</span>
                <p>{{ selectedCenter.adresse }}</p> -->
            </v-card-title>
            <v-card-actions>
                 <v-btn flat color="red">ANNULER</v-btn>
                 <v-btn flat color="blue">CONFIRMER</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
import { DateTime } from 'luxon'
import { mapState } from 'vuex'

export default {
    computed: {
        ...mapState(['center', 'timeSlots', 'candidat']),
    },

    methods: {
        goToSelectTimeSlot () {
            this.$router.push({
                name: 'time-slot',
            })
        },

        convertIsoDate (dateIso) {
            return `${DateTime.fromISO(dateIso).toLocaleString({ weekday: 'long', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`
        },
    },
}
</script>
