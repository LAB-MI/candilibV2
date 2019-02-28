export default ({ selectedCenter, start, end }) => {
  console.log('TCL: selectedCenter', selectedCenter)
  console.log('TCL: end', end)
  console.log('TCL: start', start)
  return [
    {
      month: 'fevrier',
      daysAndHoursDispo: [
        {
          day: 'jeudi 14',
          hours: {},
        },
      ],
    },
  ]
}
