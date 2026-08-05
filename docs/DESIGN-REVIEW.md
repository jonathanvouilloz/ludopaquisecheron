# Revue visuelle — clôture de la fondation V0.4

## Surface

- Primaire : **Decide / Learn** — comprendre où aller, quand venir et comment choisir.
- Secondaire : **Explore** — parcourir les groupes d’âge, jeux et futurs contenus.

## Vérifications réelles

- Desktop : accueil V0.4 inspecté en navigateur sur une largeur de 1250 px.
- Mobile : accueil V0.4 inspecté dans un viewport iframe de 375 px.
- Mobile : largeur document = largeur viewport, débordement horizontal = 0 px.
- Menu mobile ouvert : rectangle compris entre 19 et 359 px, sans débordement.
- Boutons visibles : hauteur 48 px.
- Curseur interactif calculé : `play-hand.svg` avec fallback `pointer`.
- Phosphor Icons chargé et rendu via sa fonte locale bundlée.
- Fond géométrique vérifié avec `background-attachment: fixed`.
- Navigation flottante : masquage à la descente et retour à la remontée vérifiés.
- Switch Pâquis/Sécheron : application globale et persistance vérifiées.
- Cartes de jeux : hiérarchie titre, badge d’âge, hover et curseur vérifiés.
- Fiches des lieux : grilles d’informations et horaires visibles inspectés sur desktop et mobile.
- Cycliste SVG : trajectoire sur la vague, thèmes et absence de débordement vérifiés.

## Slop diagnostic

Score après réalisation : **0/10**.

- Pas de gradient technologique.
- Le bleu `#4A57C8` est la couleur officielle fournie, pas une teinte SaaS par défaut.
- Pas de grille générique « icône + feature » répétée.
- Pas de rail décoratif, glassmorphism, monument statistique ou blur.
- Les symboles géométriques appartiennent au vocabulaire ludique et ne remplacent pas la hiérarchie.
- La composition n’est pas un empilement centré.
- Les polices sont choisies : Bubblegum Sans, Fredoka et Open Sans.
- Le hero est cohérent avec une surface Decide / Learn.

## Points reportés à la phase suivante

- Remplacer la photo extérieure temporaire, trop basse définition pour un hero final.
- Confirmer ou remplacer le wordmark typographique après décision sur le logo.
- Obtenir une photo de Sécheron pour équilibrer la représentation des deux lieux.
- Tester le menu mobile avec Playwright quand les parcours de navigation existeront.
- Faire confirmer horaires, contacts et textes avant toute publication publique.

La liste complète des limites et le point de reprise sont maintenus dans `PROJECT-STATUS.md`.

## Décisions consolidées à la clôture V0.4

- deux ambiances partagent les mêmes composants et contenus : Pâquis bleu, Sécheron vert ;
- tous les éléments de hiérarchie consomment des tokens sémantiques de thème ;
- rose terre `#BE5B45` réservé aux illustrations et détails secondaires ;
- aucune surface ajoutée aux sections claires : le motif fixe reste visible en continu ;
- sorties des aplats bleus avec une vague `cutout` bleue inversée, sans blanc opaque ;
- suppression des surtitres au-dessus des titres de section ;
- boutons plats en pills, ombre courte et micro-mouvement d’icône ;
- navigation flottante : icône uniquement pour la destination active et switch toujours accessible ;
- horaires visibles directement dans les fiches, sans accordéon ;
- cycliste SVG animé sur la première vague, statique avec `prefers-reduced-motion` ;
- les SVG fournis dans `Downloads/image-icones` ont une facture illustrée historique et des palettes hétérogènes : ils ne sont pas injectés tels quels dans la navigation. Ils pourront être recolorés ou réservés à des pages éditoriales après sélection.
