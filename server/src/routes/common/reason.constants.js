export const REASON_UNKNOWN = 'UNKNOWN'
export const REASON_CANCEL = 'CANCEL'
export const REASON_MODIFY = 'MODIFY'
export const REASON_EXAM_FAILED = 'EXAM_FAILED'
export const REASON_ABSENT_EXAM = 'EXAM_ABSENT'
export const REASON_REMOVE_RESA_ADMIN = 'REMOVE_RESA_ADMIN'
export const REASON_MODIFY_RESA_ADMIN = 'MODIFY_RESA_ADMIN'

export const statutReasonDictionnary = {
  [REASON_UNKNOWN]: 'Raison inconnue',
  [REASON_CANCEL]: 'Annulation',
  [REASON_MODIFY]: 'Modification',
  [REASON_EXAM_FAILED]: 'Échec',
  [REASON_ABSENT_EXAM]: 'Absent·e',
  [REASON_REMOVE_RESA_ADMIN]: 'Annulation admin',
  [REASON_MODIFY_RESA_ADMIN]: 'Modification admin',
}
