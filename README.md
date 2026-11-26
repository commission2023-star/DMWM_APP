# DMWM — Conseil UASZ

Gestion administrative du Conseil UASZ (Moustarchidine Junior) : membres, inscriptions,
programmes, pointage, absences, visiteurs, messages à la CA, réunions, rapports PDF/Excel.

- Production : https://dmwm-uasz.onrender.com
- Dépôt : `commission2023-star/DMWM_APP` — `develop` → `main` (Render)
- Passation : `docs/BRIEFING_PROJET.md`

## Démarrage local (WAMP)

1. `npm install` — le `postinstall` copie Bootstrap, Font Awesome et Chart.js dans `public/`.
2. Copier `.env.example` en `.env` et adapter.
3. Créer la base `dmwm_uasz` (utf8mb4) dans phpMyAdmin.
4. `node sync.js` — crée les 11 tables et le compte `superadmin` (mot de passe défini dans `sync.js`, à changer).
5. `npm run dev` ou `npm start`.
6. Ouvrir http://localhost:3000

`sync.js` ne supprime rien (`force: false`) et vise la base du `.env` courant.

## Variables d'environnement

| Variable | Rôle | Local |
|---|---|---|
| `DB_HOST` `DB_PORT` `DB_NAME` `DB_USER` `DB_PASSWORD` | Connexion MySQL | `localhost` / `3306` / `dmwm_uasz` / `root` / vide |
| `DB_SSL` | Force le SSL ; sinon automatique (actif si l'hôte n'est pas local) | vide |
| `JWT_SECRET` | Signature des jetons (8 h) | chaîne aléatoire |
| `PORT` | Port HTTP | `3000` |

Cloudinary n'utilise pas encore de variables : identifiants en dur dans `config/cloudinary.js`.
Ne jamais commiter `.env`.

## Scripts

| Commande | Effet |
|---|---|
| `npm start` / `npm run dev` | Serveur / serveur avec nodemon |
| `npm install` | Dépendances + copie des libs front |
| `node sync.js` | Tables manquantes + Super Admin initial |

`update-cdn.js` et `update-pages.js` sont des scripts ponctuels déjà appliqués.

## Structure

```text
server.js  sync.js
config/      database, cloudinary
middleware/  auth, upload, validation
models/      11 modèles
controllers/ 10 contrôleurs
routes/      10 routeurs sous /api
utils/       telephone, mois, champs d'inscription
public/      19 pages HTML, css/, js/, js-libs/, fonts/, images/,
             manifest.webmanifest, service-worker.js
docs/        briefing de passation
```

## Rôles

| Rôle | Accès |
|---|---|
| `Super Admin` | Tout + gestion des comptes |
| `Admin CA` | Membres, inscriptions, programmes, pointage, visiteurs, messages, réunions, rapports |
| `PF` | Lecture membres/programmes/pointage/visiteurs + messages, réunions, rapports |
| `CIPS` `CTC` `CL` | Lecture programmes et réunions, envoi de messages |
| `Agent H` `Agent F` | Pointage et lecture des programmes |

Menu construit par `public/js/sidebar.js`. Des écarts menu/API existent (voir Sécurité).

## Base de données

11 tables : `membres`, `inscriptions_en_attente`, `programmes`, `presences`, `visiteurs`,
`visites`, `parametres`, `utilisateurs`, `messages_ca`, `reunions`, `comptes_rendus`.

Un membre n'est jamais supprimé : il passe en `Inactif`.

## API

Routes sous `/api`, jeton `Authorization: Bearer <token>`.
Bureau = Super Admin, Admin CA, PF, CIPS, CTC, CL.

| Domaine | Accès |
|---|---|
| `auth` | `login` public, reste connecté |
| `utilisateurs` | Super Admin |
| `membres` | lecture SA/Admin CA/PF, écriture SA/Admin CA |
| `inscriptions` | soumission publique, gestion SA/Admin CA |
| `programmes` | lecture 8 rôles, écriture SA/Admin CA |
| `pointage` | saisie SA/Admin CA/Agents, stats SA/Admin CA/PF |
| `visiteurs` | lecture SA/Admin CA/PF, gestion SA/Admin CA |
| `messages` | envoi bureau, lecture SA/Admin CA/PF |
| `reunions` | lecture bureau, création SA/Admin CA |
| `rapports` | SA/Admin CA/PF |

`GET /api/health` : public, teste serveur + base.

## Fichiers (Cloudinary)

| Dossier | Contenu | Max | Formats |
|---|---|---|---|
| `dmwm-uasz/membres` | Photo, pièce d'identité | 5 Mo | JPG, PNG, PDF |
| `dmwm-uasz/messages` | Pièces jointes | 10 Mo | JPG, PNG, PDF, DOC(X), XLS(X) |
| `dmwm-uasz/comptes-rendus` | Comptes rendus | 10 Mo | PDF, DOC(X) |

`uploads/` n'est plus utilisé (seulement `.gitkeep`).

## PWA

`service-worker.js` pré-cache le pointage et bascule sur `offline.html` hors réseau.
**Tout fichier pré-caché modifié impose d'incrémenter `VERSION`** (actuellement `v3`).

## Déploiement

Build `npm install`, start `node server.js`. Variables Render : `PORT`, `JWT_SECRET`,
`DB_*`. SSL Aiven automatique. Santé : `/api/health`. Fusion `develop` → `main` = déploiement.

## Sécurité et limites connues

1. Secret Cloudinary en dur dans `config/cloudinary.js` : à révoquer et passer en variables.
2. `/api/membres/stats`, `/api/inscriptions/stats`, `/api/programmes/prochain` et
   `/api/messages/mes-messages` ne vérifient que le jeton, pas le rôle.
3. `Agent H/F` voient « Réunions » et « Envoyer à la CA » mais reçoivent `403`.
4. Le dashboard appelle `/api/reunions` et `/api/pointage/absents-recurrents` pour tous les rôles.
5. Apostrophe dans un nom : boutons cassés dans `membres`, `nouveaux-adherents`, `absences`, `comptes`.
6. HTML non échappé sur plusieurs pages (XSS) ; seules `pointage`, `validation-inscriptions` et `visiteurs` le font.
7. `PUT /api/inscriptions/:id/modifier` n'est utilisée par aucune page.
8. Mot de passe par défaut du Super Admin écrit dans `sync.js`.

## Documentation

`docs/BRIEFING_PROJET.md` (passation), `CHANGELOG_V2.md` (phases 1 à 9), ce README.
`Documentation_Phases3_4_DMWM.docx` est obsolète.
