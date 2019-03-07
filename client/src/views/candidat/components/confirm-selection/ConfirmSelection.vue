<template>
    <div>
        <section>
            <header class="candidat-section-header">
                <h2
                class="candidat-section-header__title"
                v-ripple
                @click="goToSelectTimeSlot()"
                >
                <v-btn icon>
                    <v-icon>
                    arrow_back_ios
                    </v-icon>
                    choix du creneau
                </v-btn>
                </h2>
            </header>
        </section>
        <v-card>
            <v-card-title>
                <p>codeNeph: {{ candidat.me ? candidat.me.codeNeph : '' }}</p>
            </v-card-title>
            <v-card-title>
                <p>Nom: {{ candidat.me ? candidat.me.nomNaissance : '' }}</p>
            </v-card-title>
            <v-card-title>
                <p>Prenom: {{ candidat.me ? candidat.me.prenom : '' }}</p>
            </v-card-title>
            <v-card-title>
                <span><strong>Centre:</strong> {{ center.selected ? center.selected.nom : '' }}</span>
            </v-card-title>
            <v-card-title>
                <span><strong>Adresse:</strong>{{ center.selected ? center.selected.adresse : '' }}</span>
            </v-card-title>
            <v-card-title>
                <p><strong>Date:</strong>{{ timeSlots.selected ? this.convertIsoDate(timeSlots.selected.slot) : '' }}</p>
            </v-card-title>
            <v-card-actions>
                 <v-btn flat color="red" @click="goToSelectTimeSlot()" >ANNULER</v-btn>
                 <v-btn flat color="primary" @click="confirmReservation()" >CONFIRMER</v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
import { DateTime } from 'luxon'
import { mapState } from 'vuex'

import { FETCH_CENTER_REQUEST } from '@/store/center'
import { SELECT_DAY } from '@/store/time-slots'

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

        confirmReservation () {
            console.log('confirmReservation as clicked')
        },

        convertIsoDate (dateIso) {
            return `${DateTime.fromISO(dateIso).toLocaleString({ weekday: 'long', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })}`
        },

        async getSelectedCenterAndDate () {
            const { center: nom, departement, slot } = this.$route.params
            const selected = this.center.selected
            if (!selected || !selected._id) {
                await this.$store.dispatch(FETCH_CENTER_REQUEST, { nom, departement })
                setTimeout(this.getSelectedCenterAndDate, 100)
                return
            }
            const selectedSlot = {
                slot,
                centreInfo: {
                id: selected._id,
                nom,
                departement,
                },
            }
            this.$store.dispatch(SELECT_DAY, selectedSlot)
        }
    },

    mounted () {
        this.getSelectedCenterAndDate()
    },
}
</script>
