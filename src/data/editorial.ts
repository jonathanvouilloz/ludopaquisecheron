export type EditorialStatus = 'demo' | 'archive'

export type NewsItem = {
  slug: string
  title: string
  question: string
  summary: string
  body: string[]
  dateLabel: string
  location: 'Pâquis' | 'Sécheron' | 'Les deux lieux'
  status: EditorialStatus
}

export type Activity = NewsItem & {
  audience: string
  schedule: string
}

export const editorialNotice =
  'Contenu de démonstration — les informations seront remplacées par les publications validées dans LudoHub.'

export const news: NewsItem[] = [
  {
    slug: 'bienvenue-sur-le-futur-site',
    title: 'Bienvenue sur le futur site',
    question: 'Qu’est-ce qui change sur le site ?',
    summary: 'Un exemple de publication pour tester une information courte, datée et facile à partager.',
    body: [
      'Cette page montre la forme d’une future actualité. Son contenu n’annonce aucun changement réel.',
      'Après validation, l’équipe publiera ici les fermetures, nouvelles et rendez-vous utiles aux familles.',
    ],
    dateLabel: 'Date à confirmer',
    location: 'Les deux lieux',
    status: 'demo',
  },
  {
    slug: 'une-nouvelle-selection-de-jeux',
    title: 'Une nouvelle sélection de jeux',
    question: 'Quels jeux l’équipe pourrait-elle mettre en avant ?',
    summary: 'Un second exemple pour vérifier l’affichage d’une actualité liée aux collections.',
    body: [
      'Les titres présentés ici sont provisoires. Une publication réelle renverra vers une sélection éditoriale validée.',
      'La date, le lieu et les éventuelles conditions seront affichés dès leur confirmation.',
    ],
    dateLabel: 'Date à confirmer',
    location: 'Pâquis',
    status: 'demo',
  },
]

export const activities: Activity[] = [
  {
    slug: 'apres-midi-jeux-en-famille',
    title: 'Après-midi jeux en famille',
    question: 'Envie de découvrir un jeu ensemble ?',
    summary: 'Une activité fictive utilisée pour tester une fiche avec public, horaire et lieu.',
    body: [
      'Cette activité n’est pas programmée. Elle illustre la manière dont une animation validée sera présentée.',
      'Les modalités d’inscription et d’accueil apparaîtront ici lorsqu’elles seront connues.',
    ],
    dateLabel: 'Date à confirmer',
    location: 'Sécheron',
    audience: 'Familles — âge à confirmer',
    schedule: 'Horaire à confirmer',
    status: 'demo',
  },
]

export const archivedActivities: Activity[] = [
  {
    slug: 'exemple-animation-archivee',
    title: 'Exemple d’animation archivée',
    question: 'À quoi ressemblera l’historique des activités ?',
    summary: 'Un exemple explicitement fictif pour rendre l’état archive testable.',
    body: ['Cette fiche ne correspond pas à une activité passée réelle. Elle sera retirée lors du raccordement aux données validées.'],
    dateLabel: 'Exemple sans date réelle',
    location: 'Les deux lieux',
    audience: 'Public non défini',
    schedule: 'Terminé — exemple',
    status: 'archive',
  },
]

export const topGames = [
  { rank: 1, name: 'Jeu à sélectionner', age: 'Âge à confirmer', reason: 'L’équipe ajoutera ici son conseil en une phrase.' },
  { rank: 2, name: 'Deuxième choix à venir', age: 'Âge à confirmer', reason: 'Ce rang reste visible pour tester la hiérarchie.' },
  { rank: 3, name: 'Troisième choix à venir', age: 'Âge à confirmer', reason: 'Aucun titre provisoire n’est présenté comme recommandé.' },
]

export const galleryItems = [
  { title: 'Les espaces de jeu', alt: 'Emplacement réservé à une future photo des espaces', note: 'Photo locale à sélectionner et légender.' },
  { title: 'Une table en activité', alt: 'Emplacement réservé à une future photo de partie', note: 'Autorisation de diffusion à vérifier.' },
  { title: 'Les collections', alt: 'Emplacement réservé à une future photo de jeux', note: 'Image et légende à publier depuis LudoHub.' },
]

export const team = [
  { name: 'Portrait à venir', role: 'Rôle à confirmer', bio: 'La présentation sera publiée avec l’accord de la personne.' },
]

export const committee: Array<{ name: string; role: string; bio: string }> = []

export const documents = [
  { title: 'Statuts de l’association', state: 'Document à valider avant publication' },
  { title: 'Rapport d’activité', state: 'Version publique à sélectionner' },
]

export const missionPoints = [
  'Rendre le jeu accessible dans les quartiers des Pâquis et de Sécheron.',
  'Créer un espace d’accueil, de découverte et de rencontre entre générations.',
  'Conseiller les familles sans transformer le site en catalogue exhaustif.',
]
