# DMWM — Conseil UASZ

Application web de gestion administrative du Conseil UASZ (Moustarchidine Junior) :
membres, inscriptions, programmes, pointage, absences, visiteurs, messages à la CA,
réunions et comptes rendus, rapports PDF/Excel.

- **Production** : https://dmwm-uasz.onrender.com
- **Dépôt** : `commission2023-star/DMWM_APP`
- **Branches** : `develop` (travail au quotidien) → `main` (production, déploie Render)
- **Documentation de passation** : [`docs/BRIEFING_PROJET.md`](docs/BRIEFING_PROJET.md)

## 1. Stack

| Couche | Technologie |
|---|---|
| Serveur | Node.js + Express 4 |
| Base | MySQL / MariaDB via Sequelize 6 (Aiven en production) |
| Authentification | JWT (8 h) + bcrypt |
| Fichiers | Multer + Cloudinary (photos, pièces d'identité, messages, comptes rendus) |
| Front | HTML + CSS + JavaScript natif, Bootstrap 5.3 et Font Awesome 6 servis en local |
| Graphiques | Chart.js (local) |
| Exports | PDFKit (PDF), ExcelJS (Excel) |
| Hors ligne | PWA : `manifest.webmanifest` + `service-worker.js` |

Aucune version de Node n'est imposée (`engines` absent de `package.json`) : Render
utilise sa version par défaut. Pour le développement, Node 20 LTS ou plus récent est
recommandé.

## 2. Démarrage local (WAMP)

1. Placer le dossier dans `C:\wamp64\www\...` puis s'y placer en ligne de commande.
2. `npm install`
   Le script `postinstall` exécute `public/js/copier-libs.js`, qui copie Bootstrap,
   Font Awesome et Chart.js dans `public/` (ces fichiers sont ignorés par Git).
3. Copier `.env.example` en `.env` et adapter les valeurs.
4. Créer la base `dmwm_uasz` dans phpMyAdmin (interclassement `utf8mb4`).
5. `node sync.js`
   Crée les **11 tables** manquantes et, si aucun Super Admin n'existe, le compte
   `superadmin` avec le mot de passe défini dans `sync.js`. Ce mot de passe doit être
   changé dès la première connexion.
6. `npm run dev` (rechargement automatique) ou `npm start`.
7. Ouvrir http://localhost:3000

> `node sync.js` ne supprime rien (`force: false`) : il ne fait que créer ce qui manque.
> Il vise la base décrite par le `.env` courant. Ne pas le lancer avec le `.env` de
> production sans être certain de ce que l'on fait.

## 3. Variables d'environnement

| Variable | Rôle | Exemple local |
|---|---|---|
| `DB_HOST` | Hôte MySQL | `localhost` |
| `DB_PORT` | Port MySQL | `3306` |
| `DB_NAME` | Nom de la base | `dmwm_uasz` |
| `DB_USER` | Utilisateur MySQL | `root` |
| `DB_PASSWORD` | Mot de passe MySQL | vide sous WAMP |
| `DB_SSL` | Force le SSL (`true`/`false`) | `false` |
| `JWT_SECRET` | Clé de signature des jetons | chaîne aléatoire longue |
| `PORT` | Port HTTP | `3000` |

Le SSL vers Aiven s'active **automatiquement** dès que `DB_HOST` n'est pas
`localhost`, `127.0.0.1` ou `::1` ; `DB_SSL` permet de forcer le contraire.

Les identifiants Cloudinary ne passent pas encore par des variables d'environnement :
ils sont écrits en dur dans `config/cloudinary.js` (voir « Sécurité »).

Ne jamais commiter `.env`.

## 4. Scripts

| Commande | Effet |
|---|---|
| `npm start` | Démarre le serveur (`node server.js`) |
| `npm run dev` | Démarre avec `nodemon` |
| `npm install` | Installe les dépendances puis copie les libs front (`postinstall`) |
| `node sync.js` | Crée les tables manquantes et le Super Admin initial |

Scripts ponctuels déjà appliqués, conservés à la racine pour mémoire :
`update-cdn.js` (remplace les CDN par les fichiers locaux) et `update-pages.js`
(injecte `sidebar.js` et la barre de titre). Ils ne font pas partie du cycle normal.

## 5. Structure

```text
DMWM_APP/
├─ server.js              point d'entrée Express
├─ sync.js                création des tables + Super Admin initial
├─ config/
│  ├─ database.js         connexion Sequelize (SSL auto vers Aiven)
│  └─ cloudinary.js       configuration Cloudinary
├─ middleware/
│  ├─ auth.js             verifierToken / verifierRole
│  ├─ upload.js           upload des photos et pièces d'identité (5 Mo)
│  └─ validation.js       téléphone (9 chiffres) et email
├─ models/                11 modèles Sequelize
├─ controllers/           10 contrôleurs
├─ routes/                10 routeurs montés sous /api
├─ utils/                 téléphone, mois, champs d'inscription
├─ public/
│  ├─ *.html              19 pages
│  ├─ css/                1 fichier par page + commun.css + libs copiées
│  ├─ js/                 auth-guard, sidebar, labels, telephone-input, pwa, copier-libs
│  ├─ js-libs/            Bootstrap JS et Chart.js (générés par postinstall)
│  ├─ fonts/              polices Font Awesome (générées par postinstall)
│  ├─ images/             icônes PWA (192 et 512)
│  ├─ manifest.webmanifest
│  └─ service-worker.js   cache hors ligne (versionné)
├─ uploads/               hérité de l'ancien stockage local (vide)
├─ docs/                  briefing de passation
└─ CHANGELOG_V2.md        historique des phases 1 à 9
```

## 6. Rôles

Huit rôles, stockés dans `utilisateurs.role` :

| Rôle | Usage | Accès principal |
|---|---|---|
| `Super Admin` | Administration technique | Tout, plus la gestion des comptes |
| `Admin CA` | Bureau du Conseil | Membres, inscriptions, programmes, pointage, visiteurs, messages, réunions, rapports |
| `PF` | Supervision | Lecture membres/programmes/pointage/visiteurs, messages, réunions, rapports |
| `CIPS` | Commission | Lecture programmes et réunions, envoi de messages à la CA |
| `CTC` | Commission | Idem CIPS |
| `CL` | Commission | Idem CIPS |
| `Agent H` | Agent de terrain | Pointage, lecture des programmes |
| `Agent F` | Agente de terrain | Pointage, lecture des programmes |

Le menu est construit par `public/js/sidebar.js`. Il existe des écarts connus entre
le menu et les droits réels de l'API (voir « Limites connues »).

## 7. Base de données

Onze tables :

| Table | Modèle | Contenu |
|---|---|---|
| `membres` | `Membre` | Fiche complète, statut (`Nouveau`, `Confirme`, `Inactif`), commission |
| `inscriptions_en_attente` | `InscriptionEnAttente` | Dossiers publics en JSON + statut de traitement |
| `programmes` | `Programme` | Activités (`Goudy Aldiouma`, `Xadara`, `Enseignement`, `Autre`) |
| `presences` | `Presence` | Pointage par membre et par programme |
| `visiteurs` | `Visiteur` | Non-membres rencontrés, statut de suivi |
| `visites` | `Visite` | Passage d'un visiteur à un programme (unique par paire) |
| `parametres` | `Parametre` | Réglages clé/valeur (seuil d'alerte visiteurs) |
| `utilisateurs` | `Utilisateur` | Comptes de connexion et rôles |
| `messages_ca` | `MessageCA` | Messages adressés à la CA, avec fichier éventuel |
| `reunions` | `Reunion` | Réunions du Conseil |
| `comptes_rendus` | `CompteRendu` | Comptes rendus par réunion et par commission |

Un membre n'est jamais supprimé : il passe en `Inactif` (archivage).

## 8. API

Toutes les routes sont sous `/api`. Sauf mention contraire, il faut l'en-tête
`Authorization: Bearer <token>`.

### Authentification

| Méthode et route | Accès |
|---|---|
| `POST /api/auth/login` | Public |
| `GET /api/auth/me` | Connecté |
| `PUT /api/auth/changer-mot-de-passe` | Connecté |

### Comptes

| Méthode et route | Accès |
|---|---|
| `GET /api/utilisateurs` | Super Admin |
| `POST /api/utilisateurs` | Super Admin |
| `PUT /api/utilisateurs/:id` | Super Admin |
| `PATCH /api/utilisateurs/:id/toggle` | Super Admin |

### Membres

| Méthode et route | Accès |
|---|---|
| `GET /api/membres/stats` | Connecté (pas de contrôle de rôle) |
| `GET /api/membres` | Super Admin, Admin CA, PF |
| `GET /api/membres/:id` | Super Admin, Admin CA, PF |
| `POST /api/membres` | Super Admin, Admin CA |
| `PUT /api/membres/:id` | Super Admin, Admin CA |
| `PATCH /api/membres/:id/statut` | Super Admin, Admin CA |
| `PATCH /api/membres/:id/archiver` | Super Admin, Admin CA |

### Inscriptions

| Méthode et route | Accès |
|---|---|
| `POST /api/inscriptions/soumettre` | Public |
| `GET /api/inscriptions/stats` | Connecté (pas de contrôle de rôle) |
| `GET /api/inscriptions` | Super Admin, Admin CA |
| `GET /api/inscriptions/:id` | Super Admin, Admin CA |
| `PATCH /api/inscriptions/:id/valider` | Super Admin, Admin CA |
| `PATCH /api/inscriptions/:id/rejeter` | Super Admin, Admin CA |
| `PUT /api/inscriptions/:id/modifier` | Super Admin, Admin CA (aucune page ne l'appelle) |

### Programmes

| Méthode et route | Accès |
|---|---|
| `GET /api/programmes/prochain` | Connecté (pas de contrôle de rôle) |
| `GET /api/programmes` | Les 8 rôles |
| `GET /api/programmes/:id` | Les 8 rôles |
| `POST /api/programmes` | Super Admin, Admin CA |
| `PUT /api/programmes/:id` | Super Admin, Admin CA |
| `PATCH /api/programmes/:id/statut` | Super Admin, Admin CA |
| `DELETE /api/programmes/:id` | Super Admin, Admin CA |

### Pointage

| Méthode et route | Accès |
|---|---|
| `GET /api/pointage/membres` | Super Admin, Admin CA, Agent H, Agent F |
| `POST /api/pointage/enregistrer` | Super Admin, Admin CA, Agent H, Agent F |
| `GET /api/pointage/stats/:programme_id` | Super Admin, Admin CA, PF |
| `GET /api/pointage/historique/:membre_id` | Super Admin, Admin CA, PF |
| `GET /api/pointage/absents-recurrents` | Super Admin, Admin CA, PF |

### Visiteurs

| Méthode et route | Accès |
|---|---|
| `GET /api/visiteurs` | Super Admin, Admin CA, PF |
| `GET /api/visiteurs/:id/historique` | Super Admin, Admin CA, PF |
| `PUT /api/visiteurs/seuil` | Super Admin, Admin CA |
| `PATCH /api/visiteurs/:id/statut` | Super Admin, Admin CA |

### Messages à la CA

| Méthode et route | Accès |
|---|---|
| `GET /api/messages/stats` | Super Admin, Admin CA |
| `GET /api/messages/mes-messages` | Connecté (pas de contrôle de rôle) |
| `GET /api/messages` | Super Admin, Admin CA, PF |
| `GET /api/messages/:id` | Super Admin, Admin CA, PF |
| `POST /api/messages` | Super Admin, Admin CA, PF, CIPS, CTC, CL |
| `PATCH /api/messages/:id/statut` | Super Admin, Admin CA |

### Réunions

| Méthode et route | Accès |
|---|---|
| `GET /api/reunions` | Super Admin, Admin CA, PF, CIPS, CTC, CL |
| `GET /api/reunions/:id` | Super Admin, Admin CA, PF, CIPS, CTC, CL |
| `POST /api/reunions` | Super Admin, Admin CA |
| `PUT /api/reunions/:id` | Super Admin, Admin CA |
| `POST /api/reunions/:id/comptes-rendus` | Super Admin, Admin CA, PF, CIPS, CTC, CL |
| `DELETE /api/reunions/:id/comptes-rendus/:cr_id` | Super Admin, Admin CA |

### Rapports et santé

| Méthode et route | Accès |
|---|---|
| `GET /api/rapports/statistiques` | Super Admin, Admin CA, PF |
| `GET /api/rapports/pdf` | Super Admin, Admin CA, PF |
| `GET /api/rapports/excel` | Super Admin, Admin CA, PF |
| `GET /api/health` | Public (serveur + base) |

## 9. Fichiers et Cloudinary

Trois dossiers Cloudinary :

| Dossier | Contenu | Taille max | Formats |
|---|---|---|---|
| `dmwm-uasz/membres` | Photo de profil, pièce d'identité | 5 Mo | JPG, PNG, PDF |
| `dmwm-uasz/messages` | Pièces jointes des messages à la CA | 10 Mo | JPG, PNG, PDF, DOC(X), XLS(X) |
| `dmwm-uasz/comptes-rendus` | Fichiers des comptes rendus | 10 Mo | PDF, DOC(X) |

Render ne conservant pas les fichiers locaux, tout passe par Cloudinary. Le dossier
`uploads/` à la racine n'est plus utilisé (il ne contient que `.gitkeep`).

## 10. PWA et mode hors ligne

- `public/service-worker.js` pré-cache les fichiers nécessaires au pointage hors ligne
  (page, styles, scripts, polices) et bascule sur `offline.html` si le réseau manque.
- La page de pointage garde une copie locale avant l'envoi et détecte l'expiration du
  jeton.
- **Règle** : dès qu'un fichier pré-caché change, incrémenter `VERSION` dans
  `service-worker.js` (actuellement `v3`) et mettre à jour `PRECACHE` si nécessaire.
  Sans cela, le navigateur continue de servir l'ancienne version.

## 11. Déploiement (Render + Aiven)

- **Build** : `npm install` (le `postinstall` copie les librairies front).
- **Start** : `node server.js`.
- **Variables Render** : `PORT`, `JWT_SECRET`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`,
  `DB_NAME`, `DB_PORT`.
- **SSL** : automatique vers Aiven (hôte non local).
- **Santé** : `GET /api/health` répond `200 {"status":"ok"}` si le serveur et la base
  répondent, `503` sinon.
- **Déploiement** : une fusion de `develop` vers `main` par Pull Request déclenche
  Render. Travailler sur `develop`, jamais directement sur `main`.

## 12. Conventions

- Interface, messages et documentation en français.
- Tables et champs en `snake_case` ; modèles en PascalCase ; fonctions de contrôleur
  en français (`soumettre`, `valider`, `rejeter`).
- Les chaînes stockées en base restent sans accents (`Confirme`, `Planifie`) ;
  l'affichage accentué est centralisé dans `public/js/labels.js`.
- Commits en français, sans accents, préfixés par le sujet (`Tache 7 : ...`).
- Ne jamais utiliser `git add .` : ajouter les fichiers un par un.

## 13. Sécurité et limites connues

À traiter en priorité (détail dans le briefing) :

1. **Secret Cloudinary en dur** dans `config/cloudinary.js`. Le secret doit être
   révoqué et régénéré, puis chargé par variables d'environnement.
2. Quatre routes ne vérifient que le jeton, pas le rôle : `/api/membres/stats`,
   `/api/inscriptions/stats`, `/api/programmes/prochain`, `/api/messages/mes-messages`.
3. Menu et API divergent pour `Agent H` / `Agent F` : « Réunions » et « Envoyer à la
   CA » sont affichés mais répondent `403`.
4. Le tableau de bord appelle `/api/reunions` et `/api/pointage/absents-recurrents`
   pour tous les rôles ; la partie basse ne s'affiche pas pour les rôles non autorisés.
5. Noms contenant une apostrophe : le bouton d'action casse dans `membres.html`,
   `nouveaux-adherents.html`, `absences.html` et `comptes.html`.
6. Plusieurs pages n'échappent pas le HTML affiché (risque XSS) ; seules
   `pointage.html`, `validation-inscriptions.html` et `visiteurs.html` le font.
7. `PUT /api/inscriptions/:id/modifier` existe mais n'est utilisée par aucune page.
8. Le mot de passe par défaut du Super Admin est écrit dans `sync.js` ; il doit être
   changé après la première connexion.

## 14. Documentation

| Fichier | Contenu |
|---|---|
| `docs/BRIEFING_PROJET.md` | Passation complète : métier, modèle, API, état réel, backlog |
| `CHANGELOG_V2.md` | Phases 1 à 9, corrections et limites |
| `README.md` | Ce document : installation, structure, rôles, API |

Le document `Documentation_Phases3_4_DMWM.docx` est partiellement obsolète (upload
local, rôles d'avant la V2) et ne doit plus servir de référence.
