export const queryPopulate = (populate = {}, query) => {
  Object.entries(populate).forEach(([key, value]) => {
    value && query.populate(key)
  })
}
