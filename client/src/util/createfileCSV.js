import { triggerDownloadByLink } from '.'

export const transformToCsv = (headers, datas, filename) => {
  const csvPolicy = 'data:text/csv;charset=utf-8,'

  const csvContent = `${csvPolicy}${headers.join(',')}\n${datas.map(e => e.join(',')).join('\n')}`
  var encodedUri = encodeURI(csvContent)
  triggerDownloadByLink(encodedUri, filename)
}
