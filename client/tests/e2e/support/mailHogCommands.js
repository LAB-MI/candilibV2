Cypress.Commands.add('mhGetFirstRecipients', () => {
  cy.mhGetAllMailsFixed()
    .mhFirst()
    .mhGetRecipients()
})

Cypress.Commands.add('mhGetFirstSubject', () => {
  cy.mhGetAllMailsFixed()
    .mhFirst()
    .mhGetSubject()
})

Cypress.Commands.add('mhGetFirstBody', () => {
  cy.mhGetAllMailsFixed()
    .mhFirst()
    .mhGetBody()
})
