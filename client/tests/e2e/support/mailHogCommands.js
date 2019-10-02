Cypress.Commands.add('mhGetFirstRecipients', () => {
  cy.mhGetAllMails()
    .mhFirst()
    .mhGetRecipients()
})

Cypress.Commands.add('mhGetFirstSubject', () => {
  cy.mhGetAllMails()
    .mhFirst()
    .mhGetSubject()
})

Cypress.Commands.add('mhGetFirstBody', () => {
  cy.mhGetAllMails()
    .mhFirst()
    .mhGetBody()
})
