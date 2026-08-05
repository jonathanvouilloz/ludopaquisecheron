export type PlaceKey = 'paquis' | 'secheron'

export type PracticalPlace = {
  key: PlaceKey
  name: string
  shortName: string
  question: string
  introduction: string
  address: string
  transit: string
  phone: string
  email: string
  schedule: Array<{ day: string; hours: string }>
  arrival: string[]
}

/** Contenu repris des archives, en attente de validation par l'équipe. */
export const practicalStatus = {
  label: 'Informations provisoires',
  note: 'Ces informations viennent de l’ancien site et doivent encore être confirmées par l’équipe avant publication.',
  verified: false,
} as const

export const practicalPlaces: Record<PlaceKey, PracticalPlace> = {
  paquis: {
    key: 'paquis',
    name: 'Ludothèque des Pâquis',
    shortName: 'Pâquis',
    question: 'Quand puis-je venir à la ludothèque des Pâquis ?',
    introduction: 'Retrouvez ici l’adresse, les horaires et ce qu’il faut savoir avant de venir jouer ou emprunter un jeu.',
    address: 'Rue de Berne 50, 1201 Genève',
    transit: 'Bus 1 et 25 · arrêt Navigation',
    phone: '+41 22 731 20 09',
    email: 'lu.paquissecheron@fase.ch',
    schedule: [
      { day: 'Lundi', hours: '9h30–11h30' },
      { day: 'Mardi', hours: '16h30–18h30' },
      { day: 'Mercredi', hours: '9h30–11h30 · 14h30–17h30' },
      { day: 'Jeudi', hours: '9h30–11h30 · 16h30–18h30' },
      { day: 'Samedi', hours: '9h–12h' },
    ],
    arrival: ['Les enfants restent sous la responsabilité de l’adulte qui les accompagne.', 'Pour un premier emprunt, demandez à l’équipe les modalités d’inscription.', 'En cas de doute sur une ouverture, téléphonez avant de vous déplacer.'],
  },
  secheron: {
    key: 'secheron',
    name: 'Ludothèque de Sécheron',
    shortName: 'Sécheron',
    question: 'Quand puis-je venir à la ludothèque de Sécheron ?',
    introduction: 'Retrouvez ici l’adresse, les horaires et ce qu’il faut savoir avant de venir jouer ou rendre un jeu.',
    address: 'Rue Anne Torcapel 2, 1202 Genève',
    transit: 'Tram 15 · arrêts Butini ou Maison de la Paix',
    phone: '+41 22 731 94 65',
    email: 'lu.paquissecheron@fase.ch',
    schedule: [
      { day: 'Mardi', hours: '16h–18h30' },
      { day: 'Mercredi', hours: '9h30–11h30 · 14h30–17h30' },
      { day: 'Samedi', hours: '9h–10h30 · prêts et retours' },
    ],
    arrival: ['Les enfants restent sous la responsabilité de l’adulte qui les accompagne.', 'Le samedi matin est indiqué pour les prêts et les retours.', 'En cas de doute sur une ouverture, téléphonez avant de vous déplacer.'],
  },
}

export const practicalLinks = [
  { href: '/infos-pratiques/fonctionnement', label: 'Comment ça marche ?', description: 'Jeu sur place, emprunts et retours.', icon: 'arrows-clockwise' },
  { href: '/infos-pratiques/inscription', label: 'Comment s’inscrire ?', description: 'Les étapes à prévoir avant un premier emprunt.', icon: 'identification-card' },
  { href: '/infos-pratiques/faq', label: 'Questions fréquentes', description: 'Les réponses rapides avant de venir.', icon: 'question' },
  { href: '/infos-pratiques/annuaire', label: 'Qui contacter ?', description: 'Les coordonnées des deux lieux.', icon: 'address-book' },
] as const
