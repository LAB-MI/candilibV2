
function getFileContent (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (evt) {
      resolve(evt.target.result)
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export const getJsonFromFile = async (file) => {
  const text = await getFileContent(file)
  return JSON.parse(text)
}
