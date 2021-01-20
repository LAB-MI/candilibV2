export const downloadContent = async (response) => {
  const filename = response.headers.get('Content-Disposition').split('=')[1].replace(/"/g, '')
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  triggerDownloadByLink(url, filename)
  return {
    filename,
    url,
  }
}

export const triggerDownloadByLink = (url, filename) => {
  const link = document.createElement('a')
  document.body.appendChild(link)
  link.style = 'display: none'
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
  document.body.removeChild(link)
}
