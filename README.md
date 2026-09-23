# Ludothèque Pâquis-Sécheron — nouveau site

Nouveau socle public de la Ludothèque Pâquis-Sécheron, recréé depuis zéro avec une direction artistique inspirée de SoundCarrot.

## État

- **Phase 1 clôturée le 5 août 2026** : direction artistique et prototype statique V0.4 validés.
- Le point de situation canonique, les preuves de validation et le périmètre de la phase suivante sont dans `docs/PROJECT-STATUS.md`.
- Les données sont statiques dans `src/data/site.ts`.
- La fondation de connexion LudoHub est disponible mais les pages conservent leurs données statiques tant que leur migration n'est pas activée.
- Les contenus issus de l’ancien site sont des sources provisoires à confirmer avant publication.

## Commandes

```bash
pnpm install
pnpm dev
pnpm test
pnpm check
pnpm build
pnpm preview
```

## Routes

- `/` — démonstration de la future page d’accueil.
- `/styleguide` — référence visuelle et composants.

## Documentation

- `DESIGN.md` — tokens et règles visuelles normatives.
- `docs/PROJECT-STATUS.md` — clôture de phase, validation, limites et prochain point de départ.
- `docs/BRAND.md` — identité et voix.
- `docs/CONTENT-MAP.md` — contenus disponibles et future séparation statique/dynamique.
- `docs/DESIGN-REVIEW.md` — vérification visuelle desktop/mobile et audit anti-slop.
- `docs/LUDOHUB-API.md` — configuration du client public, états de source et stratégie de repli.

## Sources

Les textes archivés se trouvent dans `docs/legacy-content/`. Ils ne doivent pas être recopiés sans tri : horaires, membres, comité, tarifs et coordonnées peuvent être obsolètes.
