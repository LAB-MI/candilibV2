const id = id => id

export const transformToProfileInfo = (object, dict) => dict.map(profileInfoGroup =>
  profileInfoGroup.map(([key, title, fn]) => (
    [
      title,
      (fn || id)(object[key]),
    ]
  ))
)
