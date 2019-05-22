import PDF from 'html-pdf'

export const toPdf = html => {
  return new Promise((resolve, reject) => {
    PDF.create(html, {
      format: 'Letter',
      orientation: 'portrait',
    }).toBuffer((err, buffer) => {
      if (err) reject(err)
      resolve(buffer)
    })
  })
}
