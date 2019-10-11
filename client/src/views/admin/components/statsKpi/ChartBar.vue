<script>
import { HorizontalBar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins
export default {
  extends: HorizontalBar,
  mixins: [ reactiveProp ],
  props: {
    labels: {
      type: Array,
    },

    datasets: {
      type: Array,
    },

    chartData: {
      type: Array,
    },
  },
  watch: {
    datasets (newValue, oldValue) {
      this.renderChart({
        labels: this.labels,
        datasets: this.datasets,
      },
      { responsive: true, maintainAspectRatio: false })
    },
  },
  mounted () {
    this.renderChart({
      labels: this.labels,
      datasets: this.datasets,
    },
    { responsive: true, maintainAspectRatio: false })
  },
}
</script>
