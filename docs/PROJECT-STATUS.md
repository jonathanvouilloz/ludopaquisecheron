# État du projet

> Dernière mise à jour : 5 août 2026  
> Phase 1 : **direction artistique et prototype statique — clôturée et vérifiée**  
> Phase 2 : **cadrée fonctionnellement — implémentation à démarrer**

## Ouverture de la phase 2

L'entretien fonctionnel du 5 août 2026 a validé l'architecture multipage, les contenus publics,
les formulaires et la répartition des responsabilités entre le site, LudoHub et l'extension Orphée.

- Spécification : [PHASE-2-SPEC.md](PHASE-2-SPEC.md)
- Plan d'exécution : [PHASE-2-PLAN.md](PHASE-2-PLAN.md)
- Premier prérequis : terminer le modèle multi-lieux et les horaires dans LudoHub.

## Résumé

La première phase établit le socle visuel et technique du futur site public de la Ludothèque Pâquis-Sécheron. Elle valide une interface commune aux deux lieux, avec une ambiance Pâquis bleue et une ambiance Sécheron verte, sans connecter de CMS ni de données de production.

Le livrable est un prototype statique fonctionnel. Il constitue la référence de départ pour la future architecture multi-page et l’intégration de LudoHub, mais **n’est pas encore prêt à être publié comme site officiel**.

## Périmètre livré

### Socle technique

- Astro 7 et TypeScript strict ;
- CSS natif piloté par les tokens de `src/styles/tokens.css` ;
- contenu de démonstration centralisé dans `src/data/site.ts` ;
- tests Vitest pour les invariants de contenu et le contrat visuel ;
- build statique sans CMS, base de données ou API.

### Expérience visuelle

- page d’accueil statique responsive ;
- styleguide accessible sur `/styleguide` ;
- thèmes persistants Pâquis et Sécheron ;
- navigation flottante qui se masque à la descente et revient à la remontée ;
- fond illustré fixe, vagues de transition et raccords de couleurs opaques ;
- cartes de groupes d’âge, jeux, lieux et contenus éditoriaux ;
- horaires affichés directement dans les fiches des deux lieux ;
- petit cycliste SVG animé sur la première vague ;
- repli sans animation pour `prefers-reduced-motion` ;
- curseur ludique personnalisé et Phosphor Icons chargées localement.

### Thèmes validés

| Ambiance | Primaire | Hiérarchie | Accent chaud | Accent ludique |
|---|---|---|---|---|
| Pâquis | `#4A57C8` | `#313A92` | `#BE5B45` | `#F4D43E` |
| Sécheron | `#69B34C` | `#245C35` | `#FF6B4A` | `#FFC928` |

Le violet `#3532B6` reste un accent complémentaire ponctuel dans l’ambiance Sécheron. Les titres, boutons principaux, boutons outline, liens actifs, bordures, ombres, vagues et éléments de navigation consomment des tokens sémantiques et suivent l’ambiance active.

## Validation de clôture

Vérification fraîche exécutée le 5 août 2026 :

```text
pnpm test   → 12 tests réussis, 2 fichiers de tests
pnpm check  → 17 fichiers, 0 erreur, 0 avertissement, 0 indication
pnpm build  → réussi, 2 routes statiques générées
Design MD   → 0 erreur bloquante
```

Contrôles manuels réalisés :

- inspection desktop de l’accueil ;
- inspection mobile à 375 px ;
- aucun débordement horizontal sur mobile ;
- menu mobile et switch de thème vérifiés ;
- persistance du thème vérifiée ;
- comportement de la navigation au scroll vérifié ;
- thèmes Pâquis et Sécheron inspectés ;
- cycliste animé et adaptation aux couleurs du thème vérifiés ;
- cibles interactives principales d’au moins 44 px.

## Sources de vérité

| Sujet | Fichier |
|---|---|
| Identité et ton | `docs/BRAND.md` |
| Design system normatif | `DESIGN.md` |
| Tokens exécutables | `src/styles/tokens.css` |
| État et limites du projet | `docs/PROJECT-STATUS.md` |
| Carte des contenus | `docs/CONTENT-MAP.md` |
| Revue visuelle | `docs/DESIGN-REVIEW.md` |
| Données de démonstration | `src/data/site.ts` |
| Composants | `src/components/` |

En cas de divergence visuelle, `DESIGN.md` définit l’intention et `src/styles/tokens.css` définit les valeurs réellement exécutées.

## Contenu et statut éditorial

Tous les horaires, coordonnées, jeux et textes issus de l’ancien site restent **provisoires / à vérifier**. Leur présence dans le prototype ne constitue ni une validation par l’équipe ni une autorisation de publication.

Les sources archivées restent dans `../website/docs/legacy-content/`. L’ancien projet `../website/` ne doit pas être supprimé ou modifié dans le cadre de ce nouveau socle.

## Hors périmètre de la phase 1

- pages publiques finales autres que l’accueil et le styleguide ;
- connexion à LudoHub ;
- API publique, authentification, cache ou webhooks ;
- actualités, activités, galerie, équipe et jeux réellement dynamiques ;
- recherche ou catalogue complet de jeux ;
- validation métier des horaires, coordonnées, tarifs et personnes ;
- remplacement de la photo basse définition des Pâquis ;
- photo de Sécheron et médias finaux ;
- SEO éditorial complet, analytics, consentement et mise en production ;
- tests de parcours multi-pages de bout en bout.

## Limites connues

1. `public/images/exterieur-paquis.png` est insuffisante pour une version finale.
2. La représentation des deux lieux reste déséquilibrée tant qu’aucune photo de Sécheron n’est disponible.
3. Les cartes de jeux ont une interaction visuelle de prototype ; leurs pages de destination n’existent pas encore.
4. Le wordmark est typographique et doit être confirmé ou remplacé après décision sur le logo.
5. Les avertissements Design MD sur les tokens orphelins proviennent du fait que la spécification et l’implémentation CSS ne partagent pas encore un registre automatique ; aucune erreur bloquante n’est signalée.
6. Le dépôt local est sur `main`, sans remote configuré et sans premier commit à la date de clôture.

## Point de départ recommandé pour la phase 2

1. Faire confirmer par l’équipe les horaires, coordonnées, activités, personnes publiques et textes institutionnels.
2. Définir le contrat de lecture publique de LudoHub : schémas, statuts de publication, filtrage par site, cache, erreurs et stratégie de repli.
3. Créer l’architecture multi-page et les routes finales avant de brancher les données.
4. Connecter progressivement actualités, activités, jeux, horaires, galerie et équipe avec des états vide/chargement/erreur explicites.
5. Remplacer les médias temporaires et vérifier les droits d’utilisation.
6. Ajouter les métadonnées SEO, données structurées, sitemap, tests de parcours et critères de mise en production.

## Critère de réouverture de la direction artistique

La phase visuelle ne doit être rouverte que si une nouvelle contrainte métier, un contenu réel ou un test utilisateur invalide un composant ou un token. Les ajustements de la phase 2 doivent réutiliser le système existant plutôt que créer une nouvelle direction parallèle.
