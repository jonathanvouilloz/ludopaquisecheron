# Plan de refonte UI — retour à une ambiance pastel

Date : 24 septembre 2026  
Statut : appliqué sur `website-v2` le 24 septembre 2026.

## Intention

Reprendre l'esprit des cinq captures de l'ancien site : une interface claire, accueillante et ludique, avec un fond coloré discret derrière des contenus blancs. Réduire le poids visuel de la version actuelle : titres trop grands et trop gras, grands aplats saturés, formes et ombres trop présentes. Les captures sont des références visuelles, pas des spécifications d'interface à reproduire pixel par pixel. Le pattern de fond actuellement présent sur le site est conservé pour cette première refonte.

## Fondations visuelles

| Rôle | Valeur | Usage prévu |
| --- | --- | --- |
| Fond de page | `#f5f7f7` | Surface générale, visible entre les cartes et sections |
| Cartes et panneaux | `#ffffff` | Contenus, navigation, fiches et listes |
| Texte principal | `#333333` | Titres, paragraphes et libellés |
| Bleu | `#5e7dd9` | Repère Pâquis, bordures et accents graphiques |
| Bleu clair | `#d7dff6` | Fonds de badges, filtres et encarts |
| Vert | `#38941a` | Repère Sécheron et accents secondaires |
| Vert clair | `#e4f7dd` | Fonds de badges et encarts associés |
| Rose | `#d95e7d` | Accent ponctuel, annonces et éléments décoratifs |
| Rose clair | `#f7c5dd` | Fonds d'encarts ponctuels |

Créer des variables par rôle dans `src/styles/tokens.css` et conserver une distinction claire entre la couleur d'identité d'un lieu et la couleur d'un état fonctionnel. Utiliser le bleu, le vert et le rose vifs principalement comme repères ou éléments graphiques ; sur les fonds pastel, le texte reste `#333333`. Les trois couleurs vives n'offrent pas un contraste suffisant avec du texte blanc ou `#333333` en taille courante : prévoir une teinte plus sombre dédiée aux liens et boutons textuels. Vérifier ces teintes dans le styleguide avant déploiement.

### Typographie

- Titres : Questrial, graisse normale, espacement des caractères resserré (`-0.02em` environ ; ajustement par niveau après revue visuelle). Éviter de simuler artificiellement une graisse forte.
- Corps et interface : Inter, 400 pour les textes, 500 ou 600 pour les actions et repères. Corps courant à 16 px minimum.
- Réduire l'échelle des titres : H1 desktop autour de 48–56 px selon la page, H2 autour de 32–40 px, avec une version mobile fluide. La version actuelle monte jusqu'à 108 px et emploie Nunito 800 : ce sont les principales causes de l'impression « grossière ».
- Garder une hauteur de ligne confortable pour les textes pratiques et une largeur de lecture d'environ 70 caractères.

### Composition et décor

- Conserver les patterns actuels `toy-field.svg` et `toy-field-secheron.svg`, ainsi que leur comportement fixe. Les faire reposer sur le nouveau fond `#f5f7f7` et vérifier seulement leur rendu avec la palette pastel.
- Réduire les grands aplats bleus/verts et les vagues entre chaque section. Réserver les transitions décoratives fortes aux zones qui en ont réellement besoin, sans modifier le dessin du pattern de fond dans ce lot.
- Garder des cartes arrondies, mais avec des rayons plus mesurés : environ 12–16 px pour une carte, 20–28 px pour un grand panneau. Bordures fines et ombres très légères.
- Simplifier les interactions : pas de rotation ou de déplacement marqué des cartes ; survol, focus et état actif restent visibles et calmes.

## Application par zone

1. **Styleguide et structure globale.** Mettre à jour les variables, la charge des fontes, les tailles de titres, les fonds et les composants de base. Le styleguide doit montrer les deux lieux, boutons, badges, cartes, liens et états de focus.
2. **En-tête et accueil.** Transformer la navigation actuelle en panneau blanc plus compact sur le fond pastel ; conserver les destinations et le choix Pâquis/Sécheron, mais alléger leur présentation. Ramener le hero à un titre plus court visuellement, avec un texte utile et deux actions lisibles. Les horaires et les deux lieux doivent rester faciles à trouver.
3. **Sections de l'accueil.** Recomposer les jeux par âge, le top 3, les lieux, les actualités et les activités en surfaces blanches cohérentes. Utiliser les teintes pastel pour les catégories et les repères, plutôt que pour de grands aplats derrière le texte.
4. **Pages intérieures.** Appliquer la même grammaire aux informations pratiques, lieux, activités, actualités, association et contact. Les pages longues reprennent le principe de la capture « Institutions » : contenu aéré, texte lisible, décor hors de la colonne de lecture.
5. **Top 3.** Sur l'accueil et `/top-3`, placer un badge de catégorie facultatif au-dessus du nom du jeu (ex. « Jeu d'expression », « Jeu de questions »), puis le titre et la recommandation. Le rang reste présent mais moins dominant. Si la catégorie n'existe pas encore, ne pas afficher de badge vide ni inventer une catégorie.

## Préparation du champ catégorie

Le site consomme aujourd'hui des jeux Top 3 avec nom, description et image, sans catégorie. Prévoir `category?: string | null` dans le modèle public et dans la vue du site, puis le transmettre aux deux rendus : `src/components/GameCard.astro` pour l'accueil et `src/pages/top-3.astro` pour la liste. Adapter la validation de la réponse publique et le contenu de démonstration lorsque le contrat LudoHub sera disponible. Aucun changement du formulaire LudoHub n'est réalisé dans cette refonte ; la tâche est ajoutée à `ludohub/docs/BACKLOG.md`.

## Ordre de réalisation proposé

1. Produire un premier aperçu desktop et mobile de l'accueil et d'une page intérieure à partir de ces règles. Confirmer les titres, la place des cartes blanches et le rendu du pattern existant avec les deux ambiances de lieux.
2. Mettre à jour les fondations (`tokens.css`, `global.css`, `BaseLayout.astro`) et les composants partagés (`Header`, boutons, cartes, séparateurs, pied de page).
3. Décliner sur l'accueil et les pages intérieures ; prévoir le badge facultatif du top 3 dans les deux rendus.
4. Mettre à jour `DESIGN.md`, `docs/BRAND.md`, `/styleguide` et les tests de contrat visuel qui codent encore l'ancienne palette ou les anciennes tailles.
5. Vérifier visuellement à 375 px, 768 px et 1440 px, en thème Pâquis et Sécheron : lisibilité, contrastes, navigation clavier, absence de débordement, états sans image et sans catégorie.

## Points à confirmer au moment de l'aperçu

- Le pattern actuellement intégré est conservé. L'aperçu permettra uniquement d'ajuster son contraste ou son opacité si la nouvelle base pastel le rend trop présent.
- Le logo/wordmark actuel est provisoire dans la documentation du site. Le plan allège son traitement ; le remplacement du logo demande l'asset choisi.
