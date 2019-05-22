import { toPdf } from './htmlToPdf'
import { writeFile } from 'fs'
import { getHtmlBody } from '../routes/business/mail/body-mail-template'

describe('htmlToPdf', () => {
  const html = `<!DOCTYPE html>
                 <html> <p>TOTO</p> </html>`

  it('should synchron', async () => {
    const buffer = await toPdf(getHtmlBody(html))
    writeFile('/tmp/test-async.pdf', buffer, err => {
      if (err) {
        console.log('The file has been saved!')
      }
    })
    expect(buffer).toBeDefined()
  })
})
