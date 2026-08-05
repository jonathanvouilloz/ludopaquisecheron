# Connexion à l’API publique LudoHub

Le client typé se trouve dans `src/lib/ludohub`. Il est conçu pour les frontmatters Astro, les fonctions `getStaticPaths` et les lectures côté serveur/build. Il ne fait jamais échouer volontairement un build à cause d’une API absente.

## Configuration

Copier `.env.example` vers `.env`, puis renseigner :

```dotenv
LUDOHUB_PUBLIC_API_BASE=https://ludohub.example/api/public/v1
LUDOHUB_PUBLIC_LUDO_SLUG=paquis-secheron
```

La base peut aussi être l’origine seule (`https://ludohub.example`) : le client ajoute alors `/api/public/v1`. Seuls `http:` et `https:` sont acceptés. Une URL avec identifiants, paramètres ou fragment est refusée. Si la base est vide ou invalide, aucune requête réseau ne part.

Le tenant vaut `paquis-secheron` par défaut. Tous les segments de chemin et filtres sont encodés avant construction de l’URL. Le délai maximal est de 4 secondes par défaut et peut être remplacé globalement ou par appel.

## Utilisation et repli

```ts
import { ludohub } from "../lib/ludohub";
import type { SitesPayload } from "../lib/ludohub";

const fallback: SitesPayload = {
  ludo: { slug: "paquis-secheron", name: "Pâquis-Sécheron" },
  sites: [],
};
const result = await ludohub.sites({ fallback });
const sites = result.data;
```

Chaque lecture retourne une union discriminée :

- `live` : enveloppe V1 et payload validés, provenant de LudoHub ;
- `fallback` : contenu fourni par la page, avec la raison de l’échec distant ;
- `empty` : base non configurée ou ressource absente (`404`), sans repli fourni ;
- `unavailable` : configuration invalide, timeout, erreur réseau/HTTP ou réponse invalide.

Les erreurs HTTP conservent uniquement leur statut. Le client ne retourne ni corps d’erreur distant, ni URL appelée, ni exception brute. Un `404` est donc distingué d’une indisponibilité sans révéler d’information interne.

Les méthodes disponibles sont `sites`, `announcements`, `news`, `newsDetail`, `activities`, `archivedActivities`, `activityDetail`, `topThrees`, `topThreeDetail`, `faqs`, `documents`, `documentDetail`, `gallery`, `profiles` et `directory`. Les listes acceptent les filtres documentés `site`, `limit` et, pour les profils, `section`.

Les champs `bodyMarkdown`, `answerMarkdown`, `bioMarkdown` et `descriptionMarkdown` restent du texte. Ne jamais les injecter comme HTML brut : utiliser un rendu Markdown dont le HTML est désactivé et dont les liens sont limités aux protocoles attendus.

## Validation, projection et limites

Une réponse distante valide n’est jamais retournée telle quelle. Le client reconstruit
récursivement un nouvel objet à partir des seuls champs du contrat ; les clés inconnues sont
supprimées à la racine comme dans les objets et tableaux imbriqués.

Une limite invalide est rejetée localement avec la raison `invalid_request`, avant toute requête :
le fallback est utilisé s’il existe, sinon le résultat est `unavailable`. Les limites sont :

- 1 à 50 pour les actualités, activités, tops trois et documents ;
- 1 à 100 pour la galerie ;
- 1 à 200 pour les FAQ, profils et l’annuaire.

Les lectures de détail n’acceptent et n’envoient jamais de paramètre `limit`.

Les réponses `live` respectent aussi ces invariants : timestamps ISO 8601 complets avec fuseau,
horaires `HH:mm` sans chevauchement, exactement trois jeux par top trois, trois dates maximum dans
un résumé d’activité, 366 dates et exceptions maximum dans un détail, aucune date/récurrence/
exception pour une activité permanente, images HTTP(S) avec texte alternatif, coordonnées
géographiques par paire, emails valides, rapports annuels datés de 1000 à 9999 (année absente
pour les autres types) et document détaillé
avec corps Markdown non vide ou PDF HTTP(S).

## Formulaire de contact

L’écriture de contact ne fait pas partie du client de lecture. `publicContactEndpoint()` fournit séparément l’URL publique `/api/public/contact/v1/{tenant}` et `PublicContactSubmission` décrit le JSON attendu. Le script navigateur devra générer une clé d’idempotence distincte et envoyer l’en-tête `Idempotency-Key`; aucune clé secrète n’est nécessaire ou exposée.
