export type NavigationItem = {
  label: string
  href: string
  icon: string
}

export type Location = {
  key: 'paquis' | 'secheron'
  name: string
  summary: string
  address: string
  transit: string
  phone: string
  schedule: Array<{
    day: string
    hours: string
  }>
  color: 'rose' | 'yellow'
}

export type AgeGroup = {
  key: string
  range: string
  title: string
  description: string
  accent: 'rose' | 'yellow' | 'blue' | 'periwinkle'
  icon: string
}

export type FeaturedGame = {
  name: string
  ageGroup: AgeGroup['key']
  age: string
  description: string
  accent: AgeGroup['accent']
}

export const navigation: NavigationItem[] = [
  { label: 'Accueil', href: '/', icon: 'house' },
  { label: 'Jeux par âge', href: '/#jeux-par-age', icon: 'game-controller' },
  { label: 'Actualités', href: '/#actualites', icon: 'newspaper-clipping' },
  { label: 'Activités', href: '/#activites', icon: 'calendar-dots' },
  { label: 'La ludothèque', href: '/#association', icon: 'users-three' },
  { label: 'Infos pratiques', href: '/#infos-pratiques', icon: 'map-pin' },
]

export const primaryNavigation: NavigationItem[] = [
  { label: 'Pâquis', href: '/paquis', icon: 'map-pin' },
  { label: 'Sécheron', href: '/secheron', icon: 'map-pin' },
  { label: 'Découvrir', href: '/actualites', icon: 'compass' },
  { label: 'Infos pratiques', href: '/infos-pratiques', icon: 'info' },
  { label: 'Contact', href: '/contact', icon: 'envelope-simple' },
]

export const discoverNavigation: NavigationItem[] = [
  { label: 'Actualités', href: '/actualites', icon: 'newspaper-clipping' },
  { label: 'Activités', href: '/activites', icon: 'calendar-dots' },
  { label: 'Top 3', href: '/top-3', icon: 'trophy' },
  { label: 'Galerie', href: '/galerie', icon: 'images' },
  { label: 'Association', href: '/association', icon: 'users-three' },
]

export const locations: Location[] = [
  {
    key: 'paquis',
    name: 'Ludothèque des Pâquis',
    summary: 'Une arcade au cœur du quartier, pensée comme un espace de rencontre et d’épanouissement.',
    address: 'Rue de Berne 50, 1201 Genève',
    transit: 'Bus 1 et 25 · arrêt Navigation',
    phone: '+41 22 731 20 09',
    schedule: [
      { day: 'Lundi', hours: '9h30–11h30' },
      { day: 'Mardi', hours: '16h30–18h30' },
      { day: 'Mercredi', hours: '9h30–11h30 · 14h30–17h30' },
      { day: 'Jeudi', hours: '9h30–11h30 · 16h30–18h30' },
      { day: 'Samedi', hours: '9h–12h' },
    ],
    color: 'rose',
  },
  {
    key: 'secheron',
    name: 'Ludothèque de Sécheron',
    summary: 'Un espace de jeu accueillant pour les enfants, les familles et toutes les générations.',
    address: 'Rue Anne Torcapel 2, 1202 Genève',
    transit: 'Tram 15 · arrêts Butini ou Maison de la Paix',
    phone: '+41 22 731 94 65',
    schedule: [
      { day: 'Mardi', hours: '16h–18h30' },
      { day: 'Mercredi', hours: '9h30–11h30 · 14h30–17h30' },
      { day: 'Samedi', hours: '9h–10h30 · prêts et retours' },
    ],
    color: 'yellow',
  },
]

export const ageGroups: AgeGroup[] = [
  {
    key: 'tout-petits',
    range: '0–3 ans',
    title: 'Premières découvertes',
    description: 'Manipuler, écouter, empiler et jouer ensemble à son rythme.',
    accent: 'yellow',
    icon: 'baby',
  },
  {
    key: 'explorateurs',
    range: '4–6 ans',
    title: 'Petits explorateurs',
    description: 'Des règles simples, de l’imagination et beaucoup de surprises.',
    accent: 'rose',
    icon: 'balloon',
  },
  {
    key: 'curieux',
    range: '7–9 ans',
    title: 'Curieux stratèges',
    description: 'Observer, coopérer et commencer à élaborer de vraies tactiques.',
    accent: 'periwinkle',
    icon: 'puzzle-piece',
  },
  {
    key: 'grands',
    range: '10 ans et +',
    title: 'Grands joueurs',
    description: 'Des défis plus riches à partager entre amis ou en famille.',
    accent: 'blue',
    icon: 'cards-three',
  },
]

export const featuredGames: FeaturedGame[] = [
  { name: 'Little Mémo', ageGroup: 'tout-petits', age: 'Dès 2 ans', description: 'Un premier jeu pour observer et exercer sa mémoire.', accent: 'yellow' },
  { name: 'Mémo Meuh', ageGroup: 'tout-petits', age: '3–6 ans', description: 'Reconnaître les animaux par leurs cris et retrouver la bonne image.', accent: 'periwinkle' },
  { name: 'Little Panic Island', ageGroup: 'explorateurs', age: 'Dès 4 ans', description: 'Un memory coopératif rythmé par un sablier et des actions loufoques.', accent: 'rose' },
  { name: 'Méchanlou', ageGroup: 'explorateurs', age: 'Dès 5 ans', description: 'Ruser autour du Petit Chaperon rouge sans se faire surprendre par le loup.', accent: 'blue' },
  { name: 'Blokus', ageGroup: 'curieux', age: 'Dès 7 ans', description: 'Concentration et stratégie dans un jeu aux règles très accessibles.', accent: 'periwinkle' },
  { name: 'Otrio', ageGroup: 'curieux', age: 'Dès 8 ans', description: 'Un casse-tête convivial inspiré du morpion.', accent: 'yellow' },
  { name: '6 qui prend !', ageGroup: 'grands', age: 'Dès 10 ans', description: 'Un jeu de cartes astucieux, stratégique et très drôle.', accent: 'rose' },
  { name: 'Splendor', ageGroup: 'grands', age: 'Dès 10 ans', description: 'Une stratégie simple à apprendre qui donne envie d’enchaîner les parties.', accent: 'blue' },
]
