export const EMAIL_EXISTE = (emails) => Array.isArray(emails) && emails.length > 1 ? `Les adresses courriels ${emails} existent déjà.` : `Cette adresse courriel existe déjà : ${emails}`
export const INVALID_EMAIL_FOR = (emails) => Array.isArray(emails) && emails.length > 1 ? `Les adresses courriels ${emails} ne sont pas valides` : `L'adresse courriel ${emails} n'est pas valide`
export const EMAIL_ALREADY_SET = (emails) => Array.isArray(emails) && emails.length > 1 ? `Les adresses courriels ${emails} sont saisies en double` : `L'adresse courriel ${emails} est saisie en double`
