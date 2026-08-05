# CLAUDE.md — Site public Ludothèque Pâquis-Sécheron V2

## Projet

Nouveau site public de la Ludothèque Pâquis-Sécheron. Cette base remplace visuellement l’ancien essai sans le modifier ni le supprimer.

## Phase actuelle

La phase 1 « direction artistique et prototype statique » est clôturée et vérifiée depuis le 5 août 2026. Le point de reprise canonique est `docs/PROJECT-STATUS.md`.

La phase 2 est cadrée fonctionnellement dans `docs/PHASE-2-SPEC.md` et ordonnée dans
`docs/PHASE-2-PLAN.md`. Son premier prérequis s'exécute dans LudoHub : modèle multi-lieux puis
horaires. Tant que l'API publique n'est pas livrée, les données de démonstration restent dans
`src/data/site.ts` et les contenus de `../website/docs/legacy-content/` restent
`provisional` / `needs_review`.

## Sources de vérité

- Identité et voix : `docs/BRAND.md`
- Design system normatif : `DESIGN.md`
- Implémentation des tokens : `src/styles/tokens.css`
- Composants : `src/components/`
- Contenu statique de démonstration : `src/data/site.ts`

## Stack

- Astro 7, TypeScript strict
- CSS natif avec tokens ; pas de Tailwind dans cette première phase
- Vitest pour les invariants de contenu

## Règles visuelles

- La DA est inspirée de SoundCarrot, mais ancrée dans la palette officielle : bleu `#4A57C8`, rose terre `#BE5B45`, échelle pervenche et jaune ludique.
- Deux thèmes sont disponibles sans modifier le contenu : Pâquis (bleu/rose/jaune) et Sécheron (`#69B34C` / `#245C35` / `#FF6B4A`, avec `#3532B6` en accent complémentaire ponctuel).
- La navigation est une capsule sticky flottante : elle se masque au scroll descendant, revient au scroll montant et n’affiche une icône que sur la destination active.
- Les sections claires n’ont aucun fond : elles laissent apparaître le motif géométrique fixe. Les vagues ne marquent que les vrais changements d’intensité.
- Phosphor Icons est le système iconographique d’interface. Les illustrations historiques fournies restent des sources à évaluer, pas des icônes de navigation.
- Les titres de section n’ont pas de petit surtitre/eyebrow : titre puis sous-texte uniquement.
- Ne jamais copier ses assets, son logo ou son code.
- Pas de gradients, glassmorphism, blobs de l’ancien essai ou cartes SaaS génériques.
- Toute valeur visuelle réutilisée doit venir de `tokens.css`.
- Les animations restent tactiles, brèves et désactivées avec `prefers-reduced-motion`.
- Les interactions à la souris utilisent le curseur-main fourni par `public/cursors/play-hand.svg` avec fallback natif.
- Cibles tactiles de 44 px minimum et contrastes WCAG AA.

## Commandes

```bash
pnpm test
pnpm check
pnpm build
```

## Git

Ce dossier est nouveau. Ne pas connecter de remote, pousser ou supprimer les anciens dossiers sans accord explicite.
