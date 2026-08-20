# Préparation du lancement — décisions restantes

Ce document sépare les garde-fous déjà automatisés des validations qui appartiennent à l’équipe. Il n’autorise aucun déploiement, changement DNS ou import de contenu.

## Automatisé dans ce lot

- Les 28 URL de l’ancien site ont une décision explicite dans `src/data/legacy-routes.json`.
- Les redirections sont permanentes (308), en un seul saut et vers une page existante. Les routes Vercel avec `dest` conservent les paramètres de requête ; aucun paramètre n’est ajouté ou transformé.
- `agenda-modele`, `copie-de-agenda` et `radioludo-2-0` sont réécrits vers une fonction minimale qui répond 410, `no-store` et `noindex`. RadioLudo reste retiré tant que les droits des enregistrements et les autorisations des personnes ne sont pas établis.
- Les pages 404 et 500 sont génériques et n’exposent aucun détail technique. Leurs statuts réellement servis doivent être confirmés sur l’hébergement.
- Le build local reste désindexé. Le build de lancement exige une origine HTTPS explicite et vérifie le paquet SSR Vercel, les routes legacy et les réponses 410. Les contenus publics sont relus à la requête ; une publication LudoHub n’exige donc pas un nouveau build.
- `vercel.json` impose `npm run build:launch` : une Preview ou une production ne peut pas sélectionner le build local permissif par défaut.
- `PUBLIC_LAUNCH_FIXTURE_MODE=live` permet de tester la mécanique avec des origines `.test` uniquement. La fixture est vide et ne constitue jamais une validation éditoriale.
- Le sitemap n’intègre que les rubriques dont la source LudoHub est `live`. Le fonctionnement et l’inscription restent hors index tant que leurs contenus métier ne sont pas validés.

## Validations humaines avant lancement

- [ ] Confirmer l’origine canonique et la variante exacte du domaine (`www` ou domaine nu).
- [ ] Confirmer les horaires, coordonnées, tarifs, règles de prêt et règles concernant les enfants.
- [ ] Valider la liste des activités encore proposées et celles qui peuvent devenir des archives publiques.
- [ ] Valider les noms, fonctions et photos de l’équipe et du comité.
- [ ] Vérifier chaque photo : auteur ou source, licence/autorisation, personnes reconnaissables, accord de publication et texte alternatif.
- [ ] Choisir une image de partage social, puis vérifier sa source, ses droits, son cadrage et son texte alternatif avant d’ajouter `og:image`. Aucun média temporaire ou non validé n’est déclaré actuellement.
- [ ] Vérifier chaque PDF : version approuvée, année, absence de données personnelles et autorisation de mise en ligne.
- [ ] Décider si RadioLudo peut un jour être republié après revue des droits audio et consentements. Sans décision positive documentée, conserver le 410.
- [ ] Définir la fenêtre DNS, le déploiement de retour arrière et la personne responsable de la surveillance.

## Vérifications qui nécessitent l’hébergement

- Tester les 308, les 410 et la conservation des paramètres sur une Preview Vercel.
- Vérifier le statut réel de `/404`, `/500` et d’une URL inconnue. La présence des fichiers locaux ne prouve pas à elle seule le statut servi par la plateforme.
- Tester au clavier et avec un lecteur d’écran les parcours principaux.
- Tester les formulaires avec les services réels de préproduction, sans utiliser de données personnelles réelles.
- Contrôler les aperçus sociaux avec les outils des plateformes une fois l’URL Preview disponible.

Les archives, images, enregistrements et PDF du dossier legacy n’ont pas été copiés ni publiés par ce lot.
