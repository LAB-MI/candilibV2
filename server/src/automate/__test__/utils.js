export const wait1s = (second = 1) => new Promise((resolve) => {
  setTimeout(() => { resolve() }, second * 1000)
})
