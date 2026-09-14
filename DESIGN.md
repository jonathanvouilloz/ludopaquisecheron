---
version: alpha
name: Ludo Pâquis-Sécheron — Ondes de jeu
description: Une identité locale, joyeuse et accessible avec deux ambiances — bleu Pâquis ou vert Sécheron — reliées par un fond ludique fixe et des vagues.
colors:
  primary: "#4A57C8"
  primary-dark: "#313A92"
  primary-mid: "#6E79D3"
  primary-muted: "#929ADE"
  primary-pale: "#B7BCE9"
  primary-soft: "#DBDDF4"
  paquis: "#4A57C8"
  paquis-dark: "#313A92"
  paquis-soft: "#DBDDF4"
  accent: "#BE5B45"
  accent-soft: "#F0D8D2"
  highlight: "#F4D43E"
  surface: "#FFFEFB"
  surface-soft: "#FFFEFB"
  ink: "#22233E"
  ink-muted: "#565A73"
  border: "#D8DAF2"
  success: "#26734D"
  danger: "#A83232"
  secheron-primary: "#69B34C"
  secheron-dark: "#245C35"
  secheron-soft: "#EDF7E8"
  secheron-secondary: "#3532B6"
  secheron-accent: "#FF6B4A"
typography:
  display-xl:
    fontFamily: "Nunito, sans-serif"
    fontSize: 4.75rem
    fontWeight: 800
    lineHeight: 0.96
    letterSpacing: "-0.025em"
  display-lg:
    fontFamily: "Nunito, sans-serif"
    fontSize: 3.5rem
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.012em"
  heading-lg:
    fontFamily: "Nunito, sans-serif"
    fontSize: 2rem
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.012em"
  heading-md:
    fontFamily: "Nunito, sans-serif"
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.008em"
  body-lg:
    fontFamily: "Nunito, sans-serif"
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0em"
  body-md:
    fontFamily: "Nunito, sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0em"
  ui:
    fontFamily: "Nunito, sans-serif"
    fontSize: 1rem
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0em"
  label:
    fontFamily: "Nunito, sans-serif"
    fontSize: 0.75rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  xs: 6px
  sm: 10px
  md: 16px
  lg: 24px
  pill: 999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 72px
  section: 96px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: 14px 24px
  button-primary-hover:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: 14px 24px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-dark}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: 14px 24px
  button-brand:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.surface}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: 14px 24px
  age-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 24px
  location-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 32px
  notice:
    backgroundColor: "{colors.highlight}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 12px 16px
---

## Overview

« Ondes de jeu » est une identité pour un lieu public de quartier, pas pour une marque de jouets. Elle reprend de SoundCarrot une structure immédiatement joyeuse — aplats indigo, vagues, typographie ronde et accents chauds — puis la rend plus locale, lisible et institutionnelle.

La composition principale est **Decide / Learn** : chaque section répond à une question concrète. Où aller ? Quand venir ? Quel jeu choisir ? Que propose l’association ? La grille de jeux et la galerie introduisent ensuite une dimension **Explore**.

La signature n’est pas une accumulation de décorations. Elle repose sur quatre décisions visibles :

1. le bleu officiel `#4A57C8` donne le rythme et porte les sections immersives ;
2. un plateau clair à formes géométriques reste fixe derrière la page ;
3. les vagues signalent uniquement les vrais changements d’intensité ;
4. le rose terre et le jaune ajoutent de l’énergie sans concurrencer le bleu.

## Colors

Le site possède deux ambiances visuelles persistantes. Le switch change uniquement le thème, jamais le contenu ni la hiérarchie :

- **Pâquis :** bleu officiel `#4A57C8`, rose terre `#BE5B45`, jaune `#F4D43E` ;
- **Sécheron :** vert végétal `#69B34C`, vert forêt `#245C35`, violet complémentaire `#3532B6`, corail `#FF6B4A` et jaune `#FFC928`.

Sur le vert, le texte utilise une encre sombre `#162412` plutôt que du blanc. Le contraste calculé est de `6.29:1`. Les titres, liens actifs, boutons principaux et boutons outline utilisent le vert forêt ; le violet reste un accent ponctuel et ne porte pas la hiérarchie principale.

- **Primary — `#4A57C8` :** bleu officiel, grand aplat de marque, navigation et action principale.
- **Échelle bleue — `#6E79D3`, `#929ADE`, `#B7BCE9`, `#DBDDF4` :** profondeur, catégories et états légers sans introduire une nouvelle teinte.
- **Accent — `#BE5B45` :** rose terre historique, réservé aux illustrations, repères et détails secondaires ; jamais le CTA principal.
- **Highlight — `#F4D43E` :** informations heureuses, détails de jeu et hover ponctuel.
- **Surface — `#FFFEFB` :** même surface chaude sur toutes les sections claires afin d’éviter la cassure gris/blanc.
- **Danger — `#A83232` :** fermeture ou erreur uniquement.

Les couleurs secondaires ne sont jamais distribuées au hasard. Elles servent à différencier les catégories de découverte et ne concurrencent jamais le bleu comme couleur d’action. Les cartes de lieux sont une exception volontaire : **Pâquis** y conserve toujours son bleu et **Sécheron** toujours son vert, quel que soit le thème actif.

## Typography

- **Nunito** est l’unique famille du site : ronde, accueillante et très lisible pour les visiteurs comme pour les informations pratiques.
- Les grands titres utilisent Nunito 800 ; les titres d’interface Nunito 700 ; les textes et horaires Nunito 400 à 600.

Le display reste en casse phrase. Les capitales sont réservées aux petits labels. Le corps ne descend jamais sous 16 px.

## Layout

- largeur de lecture : 720 px ;
- largeur de contenu : 1120 px ;
- hero d’accueil centré : message de bienvenue, explication courte et deux actions utiles ;
- sections bleues en aplat strict `#4A57C8` et sections claires transparentes au-dessus du motif fixe ;
- grille âge : 4 colonnes desktop, 2 tablette, 1 mobile ;
- cartes lieu : deux colonnes desktop, une colonne mobile ;
- dernières nouvelles : maximum trois cartes compactes empilées, avec une couverture à gauche sur desktop ;
- cartes par âge : repères éditoriaux non cliquables tant que les sélections par âge ne sont pas publiées ;
- rythme vertical généreux : 72 à 112 px selon la section ;
- aucune section ne répète exactement la composition de la précédente.

## Elevation & Depth

Les aplats et les bordures font l’essentiel du travail. Les ombres sont courtes, mates et réservées aux cartes et pills manipulables. Pas de verre, blur, glow ou gradient.

- repos : `0 8px 0 rgba(32, 33, 36, 0.08)` ;
- hover : déplacement vertical de 2 px et micro-mouvement de l’icône ;
- image : bordure blanche épaisse plutôt qu’une ombre photographique lourde.

## Shapes

- pills pour les contrôles et filtres ;
- rayon 16 px pour les cartes éditoriales ;
- rayon 24 px pour les blocs de lieux ;
- masques organiques uniquement pour les photos héro et portraits ;
- vagues SVG entre les grands aplats ;
- petits symboles géométriques comme vocabulaire d’illustration original.
- fond fixe composé de ronds, carrés, traits, triangles et étoiles à faible opacité ;
- curseur-main SVG personnalisé sur les dispositifs à pointeur précis.

Une forme organique est un accent. Elle ne doit pas transformer chaque composant en blob.

## Components

### Navigation

Capsule flottante et sticky, décollée du haut de page. Elle disparaît lors du scroll descendant et revient dès que l’utilisateur remonte. Les destinations inactives sont textuelles ; seule la destination active combine pictogramme Phosphor et libellé. À droite, un switch segmenté Pâquis / Sécheron reste accessible et conserve le choix dans `localStorage`. Sur mobile, le switch entre dans le menu `details` natif et toutes les cibles gardent 44 px minimum.

### Séparations animées

La première vague accueille un petit cycliste SVG qui suit visuellement sa courbe. Le personnage consomme les tokens du thème actif, ne reçoit aucun événement pointeur et devient une illustration fixe lorsque `prefers-reduced-motion` est activé.

### Fiches des lieux

Chaque fiche commence directement par le nom et la description du lieu, sans surtitre redondant. Adresse, transports et téléphone partagent une grille stable. Les horaires provisoires sont visibles immédiatement dans un panneau structuré par jour : aucun accordéon ne masque l’information essentielle.

### Boutons

Le bouton principal utilise `brand-dark` avec texte clair. Le bouton outline utilise `brand` pour sa bordure et `brand-dark` pour son texte. Ils sont donc bleus dans l’ambiance Pâquis et verts dans l’ambiance Sécheron. Les boutons sont plats, compacts et accompagnés d’une icône Phosphor utile ; au survol ils montent légèrement et l’icône se décale. Le jaune est réservé à certains hovers et appels secondaires.

### Vague

SVG décoratif `aria-hidden`, couleur héritée de la section suivante. La vague ne contient aucune information et ne doit jamais créer de scroll horizontal.

La vague et la section de marque qui la suit utilisent exactement le même token opaque `primary`. Ne jamais appliquer d’opacité au fond d’une section de marque : cela crée une ligne de raccord et deux variantes perceptibles. Pour sortir d’une telle section, utiliser la variante inversée `cutout` : elle prolonge la couleur du thème au-dessus de la courbe et laisse apparaître directement le motif fixe en dessous. Les sections claires n’ajoutent aucun fond blanc.

### Cartes d’âge

Chaque carte combine : intervalle d’âge, titre, phrase courte et symbole géométrique. La couleur secondaire apparaît sur le symbole et une petite zone, pas comme fond arc-en-ciel intégral.

### Cartes de jeu

Visuel carré ou illustration typographique, nom dominant, âge en badge puis description courte. Trois éléments maximum par sélection. Le rendu doit fonctionner sans image de boîte. Le hover déplace légèrement la carte, adapte sa bordure au thème et utilise le curseur-main du site.

### Horaires

Les jours et heures sont scannables. Les fermetures utilisent le token danger et un texte explicite ; la couleur seule ne suffit jamais.

## Do's and Don'ts

### À faire

- commencer chaque page par la question du visiteur ;
- conserver de grandes zones calmes entre les moments colorés ;
- utiliser de vraies photos locales dès qu’elles sont disponibles ;
- afficher clairement Pâquis ou Sécheron sur toute information locale ;
- écrire des CTA concrets : « Voir les horaires », « Choisir un jeu » ;
- respecter le mouvement réduit et la navigation clavier.

### À éviter

- copier les carottes, mascottes, pochettes ou illustrations de SoundCarrot ;
- reprendre les blobs pastel de l’ancien essai ;
- utiliser des gradients ou du glassmorphism ;
- ajouter des emojis comme système d’icônes ;
- centrer tous les contenus ;
- créer une grille répétitive de cartes de même poids ;
- publier une information legacy sans validation.
