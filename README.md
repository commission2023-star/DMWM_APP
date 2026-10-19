# DMWM — Conseil UASZ — Application de gestion administrative (version 2)

Node.js + Express + MySQL (Sequelize). Production : Render (serveur) + Aiven (MySQL).

## Installation locale (WAMP)
1. Placer le dossier dans `C:\wamp64\www\...` puis `cd` dedans.
2. `npm install` (copie aussi Bootstrap, Font Awesome et Chart.js en local via `postinstall`).
3. Copier `.env.example` en `.env` et verifier les valeurs (WAMP : `DB_HOST=localhost`, mot de passe vide).
4. Creer la base `dmwm_uasz` dans phpMyAdmin (interclassement utf8mb4 / utf8 general).
5. `node sync.js` : cree les 8 tables + le compte `superadmin` / `Admin@2025` (a changer apres la premiere connexion).
6. `npm run dev` puis ouvrir http://localhost:3000

## Production (Render + Aiven)
- Build command : `npm install` (le `postinstall` copie les librairies) — ou garder `npm install && node public/js/copier-libs.js`.
- Start command : `node server.js`
- Variables Render : `PORT`, `JWT_SECRET`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, plus (plus tard) les cles Cloudinary.
- SSL vers Aiven : active automatiquement quand `DB_HOST` n'est pas local (forcable avec `DB_SSL=true/false`).

## Contenu
Phases 1 a 8 + corrections de la Phase 9 : voir `CHANGELOG_V2.md`.

## Backlog prochaine version
1. Reparer les pages Communication en production (boite de reception, envoyer a la CA, reunions) — voir note dans CHANGELOG_V2.md
2. Stockage des fichiers persistant (Cloudinary) — les uploads sont perdus a chaque redeploiement Render
3. Resilience Render + Aiven (retry connexion, `/api/health`, ping cron-job.org)
4. Sortir le CSS des pages HTML vers des fichiers `.css`
5. Strategie mobile (PWA installable ou application native)
6. Liste "Visiteurs" au pointage (non-membres presents, table separee, conversion en membre)
7. Refonte design "vibecode" (degrades violet/bleu, Inter + Space Grotesk + Instrument Serif, glassmorphism, dark mode, icones Lucide, animations) — a faire apres la tache 4
