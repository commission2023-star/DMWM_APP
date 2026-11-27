# Journal des changements — DMWM Conseil UASZ

Historique consolidé, reconstitué depuis `git log` et `CHANGELOG_V2.md`.
Les détails de la version 2 restent dans `CHANGELOG_V2.md`.

## Version 1 — base

| Commit | Contenu |
|---|---|
| `608587f` | Version initiale de l'application (phases 1 à 8) |

## Version 2

| Commit | Contenu |
|---|---|
| `ee42013` | Modifications de la V2 prêtes : rapports PDF/Excel, graphiques Chart.js, validation des téléphones et emails, `labels.js`, `.env.example`, `postinstall` |
| `b690984` | Stockage des fichiers sur Cloudinary (photos, pièces d'identité, messages, comptes rendus) |
| `5ffdfaf` | Route `/api/health`, reprise automatique de la connexion Sequelize, lien Rapports pour le rôle PF |

Corrections de la phase 9 (détail dans `CHANGELOG_V2.md`) :

- doublon de téléphone refusé aussi à la modification d'un membre ;
- libellés de statut homogènes ;
- téléphone et email validés côté serveur ;
- pointage : copie locale systématique, détection de session expirée ;
- messages d'erreur clairs pour les fichiers refusés par Multer ;
- motif de rejet obligatoire ;
- `title` et `aria-label` sur les boutons-icônes.

Bugs corrigés pendant la reconstruction :

- filtre par mois sur une colonne `DATE` (remplacé par un intervalle premier/dernier
  jour) ;
- dossier `uploads/messages` créé à la demande ;
- SSL activé seulement pour une base distante, port lu depuis `DB_PORT`.

## Extraction du CSS

| Commit | Contenu |
|---|---|
| `58f23af` | CSS de `partager-ca.html` dans un fichier dédié |
| `fe3739f` | `commun.css` (reset + body) |
| `c2fe55e` | CSS de 5 pages |
| `515dae3` | CSS de 8 pages |
| `be4a9b1` | CSS de `dashboard`, `inscription` et `index` |

Toutes les pages ont désormais un fichier CSS séparé.

## Pointage hors ligne et PWA

| Commit | Contenu |
|---|---|
| `c9c937e` | Séparation brouillon / pointage en attente de synchronisation |
| `fdd3df0` | Préchargement des membres, lecture hors ligne, effacement des caches à la déconnexion |
| `380815f` | `manifest.webmanifest`, service worker, page `offline.html`, icônes provisoires, liaison dans les pages |

Service worker : `VERSION = "v3"`, 14 fichiers pré-cachés. Toute modification d'un
fichier pré-caché impose une nouvelle version.

## Tâche 6 — Visiteurs

| Commit | Contenu |
|---|---|
| `1a0ad97` | Modèles `Visiteur`, `Visite`, `Parametre` et enregistrement des visiteurs au pointage |
| `527c07f` | Ajout de visiteurs sur la page de pointage, hors ligne compris |
| `10f1fa8` | API visiteurs : liste, seuil, statut, historique |
| `60690db` | Page d'administration des visiteurs |
| `f43747b` | Conversion d'un visiteur en membre (transaction, préremplissage du formulaire) |
| `06a4abc` | Correction de la section Photo et documents du formulaire public |

Règles : seuil par défaut 3 participations au même type de programme, configurable
de 1 à 50 ; aucun cumul entre programmes ; aucune adhésion automatique.

## Téléphone

| Commit | Contenu |
|---|---|
| `5f51e48` | Normalisation côté serveur (membre, tuteur, PF) |
| `4528725` | Même structure dans tous les formulaires : préfixe `+221`, groupes, 9 chiffres |

Format en base : 9 chiffres, sans `+221` ni espaces. L'affichage ajoute `+221`.

## Sécurité

| Commit | Contenu |
|---|---|
| `516b316` | Échappement HTML dans la validation des inscriptions |
| `a3c235e` | Liste blanche des 22 champs d'un dossier d'inscription |

Restent ouverts : bug des apostrophes, échappement des autres pages, secret Cloudinary
en dur, routes sans contrôle de rôle.

## Documentation — 26/11/2026

| Commit | Contenu |
|---|---|
| `9578630` | Première version du README réécrit et ajout de `.env.example` |
| `410a892` | Version complète du README (le second commit remplace la première version) |

Documents ajoutés le 26/11/2026 : `docs/ARCHITECTURE.md`, `docs/API.md`,
`docs/CHANGELOG.md`, `docs/EXPLOITATION.md` et la version 2 de
`docs/BRIEFING_PROJET.md`.

## État Git au 26/11/2026

- Branche de travail : `develop` ; `main` reçoit `develop` par PR en fin de grande étape.
- Fichiers non suivis : `docs/` (à commiter), `.opencode/` (outil local),
  `verifier_tables.js` (script de lecture seule, **ne jamais commiter**).
- Fusion `develop` → `main` par Pull Request avec « merge commit », uniquement en fin
  de grande étape : elle déclenche Render.

## Backlog

| # | Chantier | Statut |
|---|---|---|
| 1 | Sessions sécurité S1 à S7 | À planifier |
| 2 | Préparation du lancement : vider les données fictives, vérifier le Super Admin, sauvegardes | À faire |
| 3 | Tâche 7 — refonte design (violet/bleu, Inter + Space Grotesk + Instrument Serif, glassmorphism, mode sombre, Lucide) | Prochain chantier |
| 4 | Cases de la checklist V2 jamais testées | Sans urgence |
| 5 | Durée du JWT, pièces d'identité publiques, fichiers Cloudinary orphelins | Sans urgence |
| 6 | Visiteurs non réaffichés à la réouverture d'un programme pointé | Ouvert |
| 7 | Rappel hebdomadaire pour garder Aiven actif | Ouvert |

Détail des sessions sécurité :

- **S1** : refuser `<` et `>` dans les champs texte côté serveur.
- **S2** : noms avec apostrophe dans les boutons (`membres`, `nouveaux-adherents`,
  `absences`, `comptes`).
- **S3** : échappement des affichages (`membres`, `nouveaux-adherents`, `absences`,
  `dashboard`, `pointage`).
- **S4** : vérifier le mot de passe par défaut du Super Admin en production.
- **S5** : pièces d'identité en URL publiques.
- **S6** : limite de soumissions sur la route publique.
- **S7** : fichiers Cloudinary orphelins.
