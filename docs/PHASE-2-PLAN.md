# Plan d'exécution — Phase 2

> Source fonctionnelle : [PHASE-2-SPEC.md](PHASE-2-SPEC.md)  
> Principe : terminer chaque lot verticalement avant d'ouvrir le suivant.

## Dépendances

Le site dépend du module public LudoHub. Ce module dépend lui-même du modèle multi-lieux et des
horaires actuellement prévus dans l'epic 19 de LudoHub.

## Lots

| Lot | Projet principal | Livrable | Statut |
|---|---|---|---|
| 0 | LudoHub | Vérifications epic 19, lieux Pâquis/Sécheron et horaires | EN ATTENTE |
| 1 | LudoHub | Socle du module Site public : schéma, permissions, médias et statuts | À FAIRE |
| 2 | LudoHub | Annonces, actualités, activités et Top 3 | À FAIRE |
| 3 | LudoHub | Galerie, profils, FAQ, documents et contacts | À FAIRE |
| 4 | LudoHub | API publique versionnée, cache et contrat d'erreur | À FAIRE |
| 5 | website-v2 | Architecture multipage et composants de contenu | À FAIRE |
| 6 | website-v2 | Connexion progressive à l'API LudoHub | À FAIRE |
| 7 | LudoHub | Inscriptions aux activités | À FAIRE |
| 8 | LudoHub | Formulaire d'adhésion mutualisé par ludothèque | À FAIRE |
| 9 | LudoOrphée | Migration Tally/Sheets vers LudoHub | À FAIRE |
| 10 | Tous | Import legacy, médias, redirections, SEO et lancement | À FAIRE |

## Lot 0 — Prérequis LudoHub

- vérifier le batch de correctifs de l'epic 19 ;
- finaliser le modèle un espace/N lieux ;
- permettre la gestion des adresses, coordonnées et horaires par lieu ;
- exposer des identifiants stables de lieu pour les futurs contenus publics.

## Lot 1 — Fondation Site public

- ajouter un flag/module activable par ludothèque ;
- créer les primitives communes : brouillon, publication, masquage, archivage, corbeille ;
- ajouter le ciblage par lieu ;
- ajouter les permissions membre/responsable ;
- généraliser l'upload Vercel Blob avec compression, ownership et nettoyage ;
- poser les tests de cloisonnement multi-tenant et de publication.

## Lots 2 à 4 — Premier parcours public complet

Ordre recommandé : annonces et horaires, puis actualités, activités et Top 3. Une première version
de l'API est livrée avec ces contenus avant d'ajouter les domaines suivants. Cela permet au site de
brancher rapidement l'accueil et les pages des deux lieux.

## Lots 5 et 6 — Site multipage

- préserver la landing et le styleguide existants ;
- créer les layouts, routes de liste et pages de détail ;
- fixer l'ambiance sur les pages Pâquis/Sécheron ;
- ajouter les états vide, chargement/revalidation et indisponibilité LudoHub ;
- conserver des données de repli explicites pendant la migration.

## Lots 7 à 9 — Formulaires

Les inscriptions aux activités sont indépendantes de l'adhésion familiale. Le formulaire familial
est multi-tenant et alimente ensuite l'extension Orphée. Les données personnelles ne passent jamais
par l'API publique de contenu.

## Lot 10 — Mise en ligne

- importer les contenus legacy ;
- valider les informations métier ;
- remplacer les médias provisoires ;
- tester mobile, accessibilité et parcours formulaires ;
- établir la table de redirections ;
- préparer puis basculer `ludo-paquis-secheron.ch`.

## Critère de démarrage immédiat

Le prochain lot exécutable est le **lot 0 dans LudoHub**. Aucun schéma du module public ne doit être
figé avant que les identifiants et relations des deux lieux soient stabilisés.
