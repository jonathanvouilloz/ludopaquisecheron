# Spécification fonctionnelle — Phase 2

> Cadrage issu de l'entretien du 5 août 2026  
> Statut : **validé fonctionnellement, prêt à découper en lots techniques**

## 1. Objectif

Transformer le prototype statique en site public multipage de la Ludothèque
Pâquis-Sécheron, alimenté par LudoHub et destiné à remplacer l'ancien site sur
`ludo-paquis-secheron.ch`.

Le site doit faire comprendre immédiatement :

- les horaires des deux lieux ;
- que le jeu sur place est gratuit ;
- que l'emprunt est accessible avec une cotisation annuelle de 30 CHF par famille ;
- qu'une famille peut emprunter jusqu'à 10 jeux simultanément, gratuitement pendant un mois,
  avec une prolongation possible d'un mois ;
- que les enfants de moins de 7 ans doivent rester accompagnés ;
- que les enfants peuvent venir seuls dès 7 ans ;
- que la ludothèque est un lieu de jeu et de prêt, pas un service de garde.

La cotisation est commune aux ludothèques de la Ville de Genève. Une famille peut emprunter
dans plusieurs ludothèques, mais chaque jeu doit être rendu dans son lieu d'origine.

## 2. Principes de produit

- Le site public reste un client en lecture de LudoHub.
- LudoHub est l'unique espace de gestion des contenus et formulaires dynamiques.
- Les informations stables d'identité et de présentation peuvent rester dans le dépôt du site.
- Le site est uniquement en français.
- Aucun catalogue complet des jeux n'est exposé.
- Aucun compte public n'est créé pour consulter le site ou remplir un formulaire.
- Aucun outil de mesure d'audience n'est prévu.
- La direction artistique de la phase 1 reste la référence ; la phase 2 la réutilise.

## 3. Arborescence publique

- Accueil
- Ludothèque des Pâquis
- Ludothèque de Sécheron
- Activités
  - page de liste
  - une page partageable par activité
  - archives publiques des anciennes activités
- Actualités
  - page de liste
  - une page partageable par actualité
- Nos Top 3
- Galerie
- Notre association
  - mission
  - équipe
  - comité
  - statuts et rapports d'activité
- Infos pratiques
  - fonctionnement et tarifs
  - inscription
  - FAQ
  - annuaire des ludothèques genevoises
- Contact

L'accueil reste commun aux deux lieux et conserve le choix d'ambiance. Les pages dédiées
`/paquis` et `/secheron` fixent automatiquement l'ambiance de leur lieu.

## 4. Accueil

L'accueil affiche :

- les informations pratiques prioritaires ;
- les horaires des deux lieux ;
- les annonces de service actives ;
- les trois actualités publiées les plus récentes ;
- jusqu'à trois activités choisies manuellement ;
- une seule sélection Top 3 choisie manuellement ;
- les accès vers les pages Pâquis et Sécheron.

## 5. Données gérées dans LudoHub

### 5.1 Lieux et horaires

- un espace LudoHub Pâquis-Sécheron avec deux lieux physiques ;
- horaires gérés par l'équipe et exposés publiquement ;
- adresse, téléphone, accès et informations pratiques propres à chaque lieu ;
- activités et annonces ciblables sur Pâquis, Sécheron ou les deux.

### 5.2 Annonces de service

Contenu court destiné aux fermetures exceptionnelles, vacances, changements d'horaires ou
informations urgentes.

- titre et message ;
- ciblage Pâquis, Sécheron ou les deux ;
- activation et désactivation manuelles uniquement ;
- aucune programmation par dates ;
- affichage prioritaire sur le site tant que l'annonce est active.

### 5.3 Actualités

- titre, résumé, contenu, image et date ;
- ciblage Pâquis, Sécheron ou les deux ;
- cycle brouillon, publié, masqué ;
- page de détail ;
- les trois plus récentes remontent automatiquement sur l'accueil.

### 5.4 Activités

Toutes les offres, y compris les accueils d'écoles, crèches ou parascolaires, utilisent le même
modèle d'activité. Il n'existe pas de rubrique institutionnelle séparée.

Une activité peut être :

- ponctuelle, avec une ou plusieurs dates ;
- récurrente, avec règle de récurrence et exceptions ;
- permanente ou accessible sur demande.

Champs prévus : titre, résumé, description, image, public, âge, lieu, horaires, tarif éventuel,
modalités, inscription éventuelle, statut éditorial et ordre de mise en avant.

Cycle de vie :

- activité actuelle publiée ;
- activité passée publiée dans les archives ;
- activité masquée ;
- corbeille restaurable ;
- suppression définitive.

Une activité archivée garde sa page et ses médias, affiche clairement qu'elle n'est plus proposée,
ne remonte pas sur l'accueil et n'accepte plus d'inscription.

Activités actuelles confirmées au 5 août 2026 :

- Jeux & Goûter ;
- accueil parascolaire ;
- accueil des écoles ;
- Pré-ados Pâquis ;
- Pré-ados Sécheron.

Les autres activités de l'ancien site seront importées comme archives publiques, sous réserve de
la revue éditoriale de leur contenu.

#### Inscriptions aux activités

- formulaire public sans compte ;
- nom du parent, nom et âge de l'enfant, téléphone, e-mail et nombre de places ;
- confirmation par e-mail ;
- capacité indicative ;
- si l'activité est complète, le formulaire reste ouvert avec le message indiquant que l'équipe
  contactera la famille si une place se libère ;
- pas d'annulation autonome par lien ;
- gestion flexible et manuelle depuis LudoHub.

### 5.5 Sélections « Top 3 »

Le site ne propose pas de catalogue de jeux. Une sélection contient un thème libre et exactement
trois jeux saisis directement, sans table de jeux ni historique des anciennes versions.

- titre et courte introduction ;
- trois emplacements : image, titre, description et âge recommandé facultatif ;
- ciblage Pâquis, Sécheron ou les deux, si utile ;
- ordre d'affichage ;
- statut actif ou masqué ;
- une sélection peut être choisie pour l'accueil ;
- toutes les sélections actives apparaissent sur la page dédiée ;
- étiquettes optionnelles stockées pour permettre de futurs filtres, sans filtre visible au lancement.

Modifier une sélection remplace son contenu actuel ; les anciens jeux ne sont pas conservés.

### 5.6 Galerie

- page unique, sans albums ;
- image et courte légende libre, pouvant inclure un événement et une date ;
- ordre d'affichage ;
- statut visible ou masqué ;
- stockage Vercel Blob avec compression et redimensionnement à l'envoi.

Le processus d'autorisation de publication des photographies existe déjà hors LudoHub.

### 5.7 Profils publics

Les profils publics sont séparés des comptes internes, avec un lien facultatif vers un membre
LudoHub existant.

- nom public ;
- fonction affichée ;
- photo ;
- courte présentation ;
- jeu préféré ;
- rattachement Pâquis, Sécheron ou les deux ;
- catégorie équipe ou comité ;
- ordre et visibilité.

Cette séparation permet de publier un membre du comité qui ne possède pas d'accès interne et
évite de confondre le statut actif interne avec la visibilité publique.

### 5.8 Association et documents

- mission et présentation institutionnelle ;
- équipe et comité dans deux sections distinctes ;
- statuts ;
- rapports d'activité annuels ;
- documents téléchargeables, ordonnables, publiables et masquables depuis LudoHub.

### 5.9 FAQ

- questions et réponses ;
- ordre d'affichage ;
- cycle brouillon, publié, masqué ;
- reprise et simplification de la FAQ de l'ancien site.

### 5.10 Annuaire des ludothèques genevoises

Le site contient un petit annuaire direct avec, pour chaque ludothèque :

- nom ;
- adresse ;
- accès direct à l'itinéraire ;
- lien vers la page officielle de la Ville de Genève.

### 5.11 Contact

Le site affiche les e-mails, téléphones, adresses et itinéraires, ainsi qu'un formulaire public.

- nom, e-mail, téléphone facultatif, destinataire, sujet et message ;
- destinataires : Pâquis, Sécheron ou association/demande générale ;
- aucune pièce jointe ;
- aucun accusé de réception automatique ;
- conservation dans une boîte LudoHub avec statuts nouveau et traité ;
- notification par e-mail à l'équipe concernée.

### 5.12 Formulaire d'adhésion mutualisé

Le formulaire d'adhésion n'appartient pas spécifiquement au site Pâquis-Sécheron. LudoHub fournit
une page publique par ludothèque, copiable, intégrable sur un site ou partageable par QR code.

Champs famille :

- genre ;
- nom ;
- prénom ;
- adresse ;
- NPA ;
- ville ;
- téléphone ;
- autre téléphone facultatif ;
- e-mail ;
- ajout libre de membres de la famille avec nom et prénom.

Acceptation :

- affichage des conditions d'emprunt, du règlement intérieur et des statuts configurés par la
  ludothèque ;
- case obligatoire « J'accepte les conditions » ;
- nom complet et date, sans signature dessinée ;
- conservation de la version exacte des documents acceptés.

Le formulaire est commun aux deux lieux Pâquis-Sécheron, sans choix de lieu de référence. Le
paiement des 30 CHF se fait toujours sur place, par TWINT ou en espèces.

Cycle : nouvelle, traitée dans Orphée, conservation temporaire, suppression automatique. Une durée
de 30 jours après traitement est l'hypothèse initiale, à confirmer et rendre configurable.

## 6. Permissions LudoHub

- tous les membres actifs peuvent gérer les contenus du site public ;
- seuls les responsables peuvent modifier les règlements, configurer les formulaires d'adhésion
  et traiter les inscriptions ;
- les actualités et activités utilisent un bouton explicite de publication afin qu'une sauvegarde
  ne publie pas accidentellement un brouillon.

## 7. Extension Orphée

Le flux actuel Tally → Google Sheets → extension doit devenir :

LudoHub formulaire public → base LudoHub → extension Orphée → saisie automatique dans Orphée →
marquage traité → suppression automatique différée.

L'extension conserve la liste, le détail, l'auto-remplissage Orphée, le PDF et la quittance TWINT.
Elle abandonne Tally, Google Sheets et les mots de passe fixes au profit d'une authentification
LudoHub adaptée à l'extension.

## 8. API et résilience

- routes publiques en lecture seule, versionnées ;
- seules les données explicitement publiées sont exposées ;
- filtrage strict par ludothèque et lieu ;
- cache côté site pour éviter de dépendre d'une requête en temps réel à chaque affichage ;
- états vide, erreur et contenu de repli prévus pour chaque bloc ;
- formulaires publics protégés contre les abus et validés côté serveur ;
- aucune donnée interne de membre ou d'inscription dans l'API publique de contenu.

## 9. Migration et lancement

- reprendre les contenus utiles et archives de `docs/legacy-content/` ;
- vérifier les informations sensibles avant publication ;
- importer les anciennes activités et publications en les marquant comme archives si nécessaire ;
- conserver les anciennes URL via des redirections vers les nouvelles pages pertinentes ;
- remplacer l'ancien site sur `ludo-paquis-secheron.ch` ;
- ne pas ajouter d'analytics ni de multilingue ;
- finaliser SEO, sitemap, données structurées, métadonnées sociales et tests de parcours avant la
  bascule du domaine.

## 10. Hors périmètre confirmé

- catalogue complet et disponibilité des jeux ;
- compte utilisateur public ;
- paiement en ligne de la cotisation ;
- newsletter publique ;
- recrutement de bénévoles ;
- annulation autonome d'une inscription à une activité ;
- albums photo complexes ;
- analytics ;
- traduction anglaise ;
- connexion Google Business Profile dans ce chantier.

## 11. Points à confirmer pendant l'implémentation

- durée exacte de conservation des adhésions traitées ;
- destinataires e-mail précis des formulaires ;
- règles finales et documents propres à chaque ludothèque ;
- liste éditoriale complète des activités actuelles et archivées ;
- médias définitifs et droits associés ;
- modalités de déploiement et de migration DNS du domaine existant.
