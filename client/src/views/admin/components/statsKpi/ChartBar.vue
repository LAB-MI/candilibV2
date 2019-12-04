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
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            ticks: {
              beginAtZero: true,
            },
          }],
        },
      }
      this.renderChart({
        labels: this.labels,
        datasets: this.datasets,
      },
      chartOptions)
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
