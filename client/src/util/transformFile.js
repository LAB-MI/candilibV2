
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

export const uploadFileBatchAurige = async (api, file) => {
  const data = new FormData()
  data.append('file', file)

  try {
    const result = await api.admin.uploadCandidatsJson(data)
    if (result.success === false) {
      throw new Error(result.message)
    }
    return result.candidats
  } catch (error) {
    throw new Error(error.message)
  }
}
