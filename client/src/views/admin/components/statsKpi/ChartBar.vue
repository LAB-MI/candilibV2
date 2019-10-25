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

  methods: {
    renderChartBar () {
      this.renderChart({
        labels: this.labels,
        datasets: this.datasets,
      },
      { responsive: true, maintainAspectRatio: false })
    },
  },

  watch: {
    datasets (newValue, oldValue) {
      this.renderChartBar()
    },
  },

  mounted () {
    this.renderChartBar()
  },
}
</script>
