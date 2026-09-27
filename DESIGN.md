# Design system — Ludothèque Pâquis-Sécheron

> Version pastel, adoptée le 24 septembre 2026. L’implémentation de référence est `src/styles/tokens.css`.

## Direction

Le site doit ressembler à un lieu de quartier accueillant : un fond ludique déjà connu, des contenus calmes et lisibles, et des couleurs qui aident à se repérer. Les patterns `toy-field.svg` et `toy-field-secheron.svg` restent le geste graphique principal. Les cartes blanches, les titres fins et les aplats pastel leur laissent de la place.

La composition répond d’abord aux questions concrètes : où aller, quand venir, quel jeu choisir et que propose l’association. Le décor reste en périphérie de cette information.

## Couleurs

| Rôle | Valeur | Usage |
| --- | --- | --- |
| Bleu Pâquis | `#5e7dd9` | repères, bordures actives, illustrations |
| Bleu Pâquis sombre | `#334b9b` | liens et boutons accessibles |
| Bleu pastel | `#d7dff6` | fonds de badges, contrôles et sections Pâquis |
| Vert Sécheron | `#38941a` | repères Sécheron |
| Vert Sécheron sombre | `#286b16` | liens et boutons accessibles |
| Vert pastel | `#e4f7dd` | fonds de badges, contrôles et sections Sécheron |
| Rose | `#d95e7d` | accent ponctuel |
| Rose sombre | `#91334b` | texte sur rose clair et états critiques |
| Rose pastel | `#f7c5dd` | annonces et catégories |
| Encre | `#333333` | texte principal |
| Fond | `#f5f7f7` | fond général sous le pattern |
| Carte | `#ffffff` | panneaux et contenus |

Les couleurs vives ne portent pas de texte courant : leur contraste est insuffisant avec le blanc et l’encre. Les variantes sombres sont utilisées pour les liens, les boutons et les textes colorés.

## Typographie

- Questrial pour les titres, graisse normale, avec un espacement resserré de `-0.025em` à `-0.035em`.
- Inter pour le corps, l’interface et les informations pratiques, de 400 à 700.
- H1 : `clamp(2.9rem, 5.5vw, 3.6rem)`.
- H2 principal : `clamp(2.15rem, 4vw, 2.75rem)`.
- Corps : 16 px minimum, hauteur de ligne 1.65, largeur de lecture de 45 rem.
- Les petites étiquettes restent en casse phrase. Les capitales ne servent qu’aux données qui les exigent.

## Mise en page

- largeur de contenu : 1120 px ; largeur de lecture : 720 px ;
- fond fixe avec le pattern existant ;
- hero, navigation et contenus majeurs sur des panneaux blancs ;
- sections pastel uniquement pour créer une respiration réelle ;
- grille de jeux par âge : 4 colonnes desktop, 2 tablette, 1 mobile ;
- cartes lieu : 2 colonnes desktop, 1 mobile ;
- rythme vertical de 64 à 96 px ;
- vérification à 375, 768 et 1440 px.

## Formes, profondeur et mouvement

- rayon 14 px pour une carte, 20 px pour un grand panneau, pill pour un contrôle court ;
- bordures de 1 px et ombres diffuses très légères ;
- aucun gradient, verre ou halo ;
- pas de rotation ni de déplacement latéral au survol ; un déplacement vertical d’un pixel suffit ;
- transitions courtes et désactivées avec `prefers-reduced-motion`.

## Composants

### Navigation

Panneau blanc flottant et sticky. Le lien actif reçoit un fond pastel. Le sélecteur Pâquis/Sécheron reste accessible et conserve le choix dans `localStorage`. Le menu mobile utilise le même vocabulaire.

### Boutons

Le bouton principal utilise la variante sombre du lieu et du texte blanc. Les boutons secondaires utilisent une surface blanche ou pastel avec texte sombre. Toutes les cibles mesurent au moins 44 px.

### Cartes

Les cartes utilisent une surface blanche, une bordure fine et une ombre douce. Les titres sont en Questrial et gardent un écart de taille net avec le résumé, y compris dans les variantes horizontales. La couleur sert aux badges, pictogrammes et repères de lieu.

Les badges éditoriaux restent compacts, en bleu sombre sur fond bleu pastel. Ils se regroupent sur plusieurs lignes avec un espace constant de 8 px et conservent un espace distinct avant le titre.

### Top 3

Chaque jeu présente le rang, une catégorie facultative, le titre et le conseil. Le badge de catégorie est rose pastel et disparaît totalement si LudoHub ne fournit aucune valeur. Le rendu doit fonctionner sans image.

### Vagues et pattern

Les patterns existants sont conservés sans redessin. Les vagues deviennent basses et reprennent la teinte pastel de la section suivante. Elles sont décoratives et `aria-hidden`.

## Accessibilité

- contraste WCAG AA pour le texte courant ;
- focus clavier visible avec la variante sombre du thème ;
- cibles tactiles de 44 px minimum ;
- contenu compréhensible sans image, couleur ou animation ;
- états sans contenu et erreurs avec une action claire.

## Sources

- identité et voix : `docs/BRAND.md` ;
- plan de refonte : `docs/REFONTE-UI-PASTEL.md` ;
- tokens : `src/styles/tokens.css` ;
- référence visible : `/styleguide`.
