<script>
import { Bar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins
export default {
  extends: Bar,
  mixins: [reactiveProp],
  props: {
    labels: {
      type: Array,
      default () {},
    },

    datasets: {
      type: Array,
      default () {},
    },

    chartData: {
      type: Array,
      default () {},
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
}
</script>
