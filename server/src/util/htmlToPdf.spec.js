import pdf from 'html-pdf'
import { writeFile } from 'fs'

import { toPdf } from './htmlToPdf'
describe('htmlToPdf', () => {
  const html = `<!DOCTYPE html>
  <html> <p>TOTO</p> </html>`

  it('should callback ', () => {
    pdf
      .create(html, {
        format: 'Letter',
        orientation: 'portrait',
      })
      .toBuffer(function (err, buffer) {
        if (err) {
          console.log('The file has been saved!')
        }
        writeFile('/tmp/test.pdf', buffer, err => {
          if (err) {
            console.log('The file has been saved!')
          }
        })
        expect(buffer).toBeDefined()
      })
  })
  it('should synchron', async () => {
    const buffer = await toPdf(html)
    writeFile('/tmp/test-async.pdf', buffer, err => {
      if (err) {
        console.log('The file has been saved!')
      }
    })
    expect(buffer).toBeDefined()
  })
})
