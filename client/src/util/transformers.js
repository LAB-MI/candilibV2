const id = id => id

export const transformToProfileInfo = (object, dict) => dict.map(profileInfoGroup =>
  profileInfoGroup.map(
    ([key, title, fn, isComponent]) => {
      const value = (fn || id)(object[key])
      return (
        [
          title,
          isComponent ? value.name : value,
          isComponent,
          isComponent ? value.data : {},
        ]
      )
    },
  ),
)
