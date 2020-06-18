let fakeMails = []

const mhApiUrl = path => {
  const basePath = Cypress.config('mailHogUrl')
  return `${basePath}/api${path}`
}

Cypress.Commands.add('deleteAllMails', () => {
  fakeMails = []
  return cy.request('DELETE', mhApiUrl('/v1/messages'))
})
Cypress.Commands.add('AddFakeMail', (to, subject, Body) => {
  const ToSplit = to.split('@')
  fakeMails.push({
    Content: {
      Headers: {
        Subject: [subject],
      },
      Body,
    },
    To: [{
      Mailbox: ToSplit[0],
      Domain: ToSplit[1],
    }],
  })
})

Cypress.Commands.add('getLastMail', (infos) => {
  cy.wait(100)
  cy.request({
    method: 'GET',
    url: mhApiUrl('/v2/messages?limit=10'),
  })
    .then(response => JSON.parse(JSON.stringify(response.body)))
    .then(parsed => parsed.items)
    .then(mails => mails.concat(fakeMails))
    .then(mails => infos && infos.recipient
      ? mails.filter(mail =>
        mail.To.map(
          recipientObj => `${recipientObj.Mailbox}@${recipientObj.Domain}`,
        ).includes(infos.recipient),
      )
      : mails,
    )
    .then(mails => infos && infos.subjectContains
      ? mails.filter(mail => new RegExp(infos.subjectContains).test(mail.Content.Headers.Subject[0]))
      : mails,
    )
    .then(mails => infos && infos.subject
      ? mails.filter(mail => mail.Content.Headers.Subject[0] === infos.subject)
      : mails,
    )
    .then(mails => {
      return Array.isArray(mails) && mails.length > 0 ? mails[0] : mails
    })
})

Cypress.Commands.add('getSubject', { prevSubject: true }, (mail) => {
  return cy.wrap(mail.Content.Headers).then((headers) => headers.Subject[0])
})

Cypress.Commands.add('getBody', { prevSubject: true }, (mail) => {
  return cy.wrap(mail.Content).its('Body')
})

Cypress.Commands.add('getRecipients', { prevSubject: true }, (mail) => {
  return cy
    .wrap(mail)
    .then((mail) => {
      return (mail.To || []).map(
        (recipientObj) => `${recipientObj.Mailbox}@${recipientObj.Domain}`,
      )
    })
})
