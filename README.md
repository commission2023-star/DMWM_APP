# DMWM — Conseil UASZ — Application de gestion administrative

Ce dossier contient l'intégralité du projet reconstruit (Phases 1 à 7).

## Réinstallation sur votre PC (WAMP)

### Étape 1 — Copier le dossier
Placez tout ce dossier dans :
```
C:\wamp64\www\dmwm-uasz
```

### Étape 2 — Installer les dépendances
Ouvrez un terminal dans VS Code, dans le dossier du projet, et lancez :
```bash
npm install
```
Cela réinstalle tous les packages listés dans `package.json` (express, sequelize, jwt, bcrypt, multer, bootstrap, fontawesome, etc.)

### Étape 3 — Copier les librairies locales (Bootstrap + FontAwesome)
```bash
node public/js/copier-libs.js
```

### Étape 4 — Recréer la base de données
1. Démarrez WAMP
2. Allez sur http://localhost/phpmyadmin
3. Créez une base nommée `dmwm_uasz` (interclassement `utf8_general_ci`)

### Étape 5 — Synchroniser les tables + créer le Super Admin
```bash
node sync.js
```
Cela crée automatiquement :
- Les 8 tables (membres, utilisateurs, programmes, presences, inscriptions_en_attente, messages_ca, reunions, comptes_rendus)
- Le compte Super Admin :
  - Identifiant : `superadmin`
  - Mot de passe : `Admin@2025`

### Étape 6 — Lancer le serveur
```bash
npm run dev
```
Ouvrez ensuite : http://localhost:3000

---

## Contenu déjà réalisé (Phases 1 à 7)

- **Phase 1** — Environnement Node.js/Express + Base de données MySQL/Sequelize
- **Phase 2** — Authentification JWT, rôles, gestion des comptes
- **Phase 3** — Gestion complète des membres (CRUD + upload photo/document)
- **Phase 4** — Formulaires publics d'inscription (3 formulaires) + validation CA + sidebar universelle
- **Phase 5** — Programmes + calendrier automatique (Goudy/Xadara/Enseignement)
- **Phase 6** — Pointage + mode hors ligne (localStorage) + suivi des absences
- **Phase 7** — Communication interne (boîte de réception CA, réunions, comptes rendus)

## Structure des dossiers

```
dmwm-uasz/
├── config/          → connexion base de données
├── controllers/      → logique métier (8 fichiers)
├── middleware/        → authentification JWT (auth.js)
├── models/           → 8 modèles Sequelize + index.js (associations)
├── routes/            → 8 fichiers de routes API
├── public/            → frontend (16 pages HTML + JS)
│   ├── css/           → (généré par copier-libs.js)
│   ├── js/             → auth-guard.js, sidebar.js, copier-libs.js
│   ├── js-libs/        → (généré par copier-libs.js)
│   └── fonts/          → (généré par copier-libs.js)
├── uploads/            → fichiers uploadés (photos, docs, comptes rendus)
├── server.js           → point d'entrée
├── sync.js             → script de création des tables + Super Admin
├── update-pages.js     → script d'injection sidebar (déjà appliqué)
├── update-cdn.js       → script de conversion CDN → local (déjà appliqué)
├── package.json
└── .env                → variables d'environnement
```

## Notes importantes

- Le fichier `.env` contient les identifiants de connexion à la base de données. Vérifiez que `DB_PASSWORD` correspond à votre configuration WAMP (vide par défaut).
- Toutes les pages HTML sont déjà mises à jour avec la sidebar universelle (`sidebar.js`) — pas besoin de relancer `update-pages.js`.
- Le mode hors ligne du pointage utilise le `localStorage` du navigateur — testez en coupant votre WiFi une fois le serveur lancé.

## Phases restantes à développer

- Phase 8 — Rapports et statistiques (export PDF/Excel, graphiques)
- Phase 9 — Tests finaux et corrections
- Phase 10 — Déploiement en production (Railway/Render)
