# Feuille de route — DMWM Conseil UASZ

But de ce fichier : savoir en un coup d'œil **ce qui est fait** et **ce qui reste à faire**.
Il ne remplace pas les autres documents : il sert de liste de contrôle.

Dernière mise à jour : **28/11/2026** — branche `develop`.

## 1. Comment utiliser cette feuille de route

- `[x]` : tâche terminée **et testée**.
- `[ ]` : tâche à faire.
- Une tâche commencée mais non finie reste `[ ]` avec la mention « en cours ».

Quand tu termines une tâche :

1. vérifie qu'elle fonctionne réellement (pas seulement que le code est écrit) ;
2. remplace `[ ]` par `[x]` et ajoute la date et le commit ;
3. commit ce fichier seul :

```powershell
git add docs/ROADMAP.md
git commit -m "Roadmap : mise a jour"
git push
```

Ne jamais cocher sans test. Ne rien commencer sans l'accord de Zo (règle du projet).

## 2. Quel document lire ?

| Je veux… | Document |
|---|---|
| installer le projet sur mon poste | `README.md` §2 |
| comprendre le métier, les rôles, l'histoire | `docs/BRIEFING_PROJET.md` |
| comprendre comment le code est organisé | `docs/ARCHITECTURE.md` |
| connaître une route API (méthode, rôle, corps) | `docs/API.md` |
| déployer, surveiller, réparer, changer un secret | `docs/EXPLOITATION.md` |
| savoir ce qui a changé et quand | `docs/CHANGELOG.md` |
| savoir quoi faire ensuite | ce fichier |

## 3. Vue d'ensemble

| Élément | État |
|---|---|
| Application | V2 + tâche 6, en production |
| URL | https://dmwm-uasz.onrender.com |
| Documentation | à jour au 28/11/2026 |
| Sécurité | 2 corrections faites (F1, F2) ; 7 sessions à faire (S1–S7) |
| Prochaine grande étape | tâche 7 — vérification en production, puis PR vers `main` |
| Lancement officiel | pas de date ; conditions en §6.1 |

## 4. Terminé

### 4.1 Socle — phases 1 à 10

- [x] Connexion, 8 rôles, JWT de 8 h
- [x] Membres : ajout, modification, archivage, recherche, fiche
- [x] Inscriptions publiques, validation et rejet par la CA
- [x] Programmes récurrents (mardi, jeudi, samedi) et programmes « Autre »
- [x] Pointage en ligne et hors ligne, absences récurrentes
- [x] Visiteurs (tâche 6)
- [x] Messages à la CA, réunions, comptes rendus
- [x] Rapports PDF et Excel, graphiques Chart.js
- [x] Comptes utilisateurs (Super Admin)
- [x] PWA : service worker, page hors ligne, icônes provisoires
- [x] Déploiement Render + Aiven + Cloudinary

### 4.2 Version 2

- [x] Rapports PDF/Excel et graphiques
- [x] Validation des téléphones et des emails
- [x] `labels.js` pour les libellés accentués
- [x] `.env.example`
- [x] Fichiers sur Cloudinary
- [x] Route `/api/health` et reprise de la connexion Sequelize
- [x] CSS séparé par page (22 fichiers)

### 4.3 Tâches 3 à 6

- [x] Tâche 3 : résilience Render/Aiven
- [x] Tâche 4 : CSS en fichiers
- [x] Tâche 5 : stratégie mobile
- [x] Tâche 6 : visiteurs (modèles, pointage, API, page, conversion)
- [x] Téléphone : 9 chiffres en base, `+221` à l'écran

### 4.4 Documentation — 26 et 27/11/2026

- [x] `README.md` réécrit (`410a892`)
- [x] `docs/ARCHITECTURE.md` (`5027ed2`)
- [x] `docs/API.md` (`1cd4151`)
- [x] `docs/CHANGELOG.md` (`0863c87`)
- [x] `docs/EXPLOITATION.md` (`a80ae42`)
- [x] `docs/BRIEFING_PROJET.md` version 2 (`43921af`)
- [x] `docs/ROADMAP.md` (ce fichier)
- [x] `.gitignore` : `.opencode/` et `verifier_tables.js`

### 4.5 Sécurité déjà faite

- [x] F1 : liste blanche des 22 champs d'un dossier d'inscription (`a3c235e`)
- [x] F2 : échappement HTML dans la validation des inscriptions (`516b316`)

## 5. En cours

### 5.1 Tâche 7 — refonte design (en cours)

Dégradés violet/bleu avec grain, polices Inter + Space Grotesk + Instrument Serif,
glassmorphism, mode sombre, icônes Lucide à la place de Font Awesome.

- [x] Valider la direction artistique
- [x] Définir les tokens : couleurs, espacements, typographie
- [x] Reprendre `commun.css` et les fichiers CSS de page
- [x] Remplacer Font Awesome par Lucide
- [x] Ajouter le mode sombre (bascule mémorisée)
- [x] Créer les icônes PWA définitives
- [x] Vérifier chaque page sur mobile et sur bureau (captures Edge)
- [x] Incrémenter `VERSION` dans `public/service-worker.js` (`v4`)
- [ ] Tester en production, puis PR vers `main`

## 6. À faire

### 6.1 Avant le lancement officiel (priorité 1)

- [ ] Choisir la date de lancement
- [ ] Vider les données de test d'Aiven (visiteurs `Test Prod` et `Test Hors`,
      programme passé à `Tenu`, etc.)
- [ ] Vérifier et changer le mot de passe du Super Admin en production (S4)
- [ ] Vérifier les sauvegardes Aiven **et tester une restauration**
- [ ] Corriger le bug des apostrophes (S2)
- [ ] Échapper les affichages des pages listées (S3)
- [ ] Sortir le secret Cloudinary du code, puis le révoquer
- [ ] Limiter les soumissions sur la route publique (S6)
- [ ] Définir la conservation des données et le consentement
- [ ] Vérifier le ping cron et les alertes
- [ ] Relire les documents et cocher cette feuille de route

### 6.2 Sessions sécurité (aucune commencée)

- [ ] S1 — refuser `<` et `>` dans les champs texte côté serveur
- [ ] S2 — noms avec apostrophe dans les boutons (`membres`, `nouveaux-adherents`,
      `absences`, `comptes`)
- [ ] S3 — échappement des affichages (`membres`, `nouveaux-adherents`, `absences`,
      `dashboard`, `pointage`)
- [ ] S4 — mot de passe par défaut du Super Admin
- [ ] S5 — pièces d'identité en URL publiques
- [ ] S6 — limite de soumissions sur la route publique
- [ ] S7 — fichiers Cloudinary orphelins

### 6.3 Tests jamais faits en conditions réelles

- [ ] Réseau lent
- [ ] Plusieurs appareils en même temps
- [ ] Photo de plus de 5 Mo
- [ ] Badge des jours (nouveaux adhérents)
- [ ] Rejet avec et sans motif en production
- [ ] Suppression d'un programme
- [ ] Filtre par mois
- [ ] Absences sur 2 programmes
- [ ] Cloudinary avec de vrais volumes

### 6.4 Améliorations sans urgence

- [ ] Rendre la validation d'une inscription transactionnelle
- [ ] Valider les statuts avant écriture (`membres`, `messages`)
- [ ] Paginer les listes
- [ ] Ne plus renvoyer le message d'erreur interne au client
- [ ] Réévaluer la durée du JWT (8 h)
- [ ] Réafficher les visiteurs à la réouverture d'un pointage
- [ ] Rappel hebdomadaire pour garder Aiven actif

### 6.5 Bugs ouverts

- [ ] Visiteurs déjà enregistrés non affichés à la réouverture d'un programme pointé
- [ ] Partie basse du tableau de bord cassée pour Agent H/F, CIPS, CTC et CL
- [ ] Menu « Réunions » et « Envoyer à la CA » visible pour les Agents H/F mais
      refusé par l'API (403)

## 7. Décisions et réponses attendues (Zo)

- [ ] Sens de DMWM, PF, CIPS, CTC, CL
- [ ] Rôle réel des Agents H et F
- [ ] Mot de passe du Super Admin changé en production ?
- [ ] Dépôt public ou privé ?
- [ ] Qui a accès à Render, Aiven, Cloudinary, cron-job.org et GitHub ?
- [ ] Version de Node visée et version de MySQL
- [ ] Sauvegardes Aiven : fréquence et procédure de restauration
- [ ] Politique de conservation et consentement des données personnelles
- [ ] Date de lancement et données à vider
- [ ] « Format On Save » désactivé dans VS Code ?

## 8. Journal des mises à jour

| Date | Commit | Modification |
|---|---|---|
| 26/11/2026 | `410a892` | README réécrit et `.env.example` |
| 27/11/2026 | `5027ed2` … `43921af` | cinq documents dans `docs/` |
| 27/11/2026 | à venir | cette feuille de route et `.gitignore` |
| 28/11/2026 | à venir | tâche 7 : design system, mode sombre, Lucide, icônes PWA |

## 9. Lexique pour débuter

| Terme | Définition simple |
|---|---|
| Dépôt (repository) | Le dossier du projet suivi par Git, ici hébergé sur GitHub. |
| Branche | Une version parallèle du code. `develop` sert à travailler, `main` est la production. |
| Commit | Un point de sauvegarde du code, avec un message qui explique le changement. |
| Push | Envoyer ses commits locaux vers GitHub. |
| Pull Request (PR) | Demande de fusionner une branche dans une autre, avec relecture. |
| Merge | Fusion de deux branches. Ici : `develop` → `main` en fin de grande étape. |
| Déploiement | Mise en ligne automatique par Render quand `main` change. |
| API | Les adresses `/api/...` que le navigateur appelle pour lire ou écrire des données. |
| JWT | Jeton de connexion signé, valable 8 h, envoyé dans l'en-tête `Authorization`. |
| Migration | Modification de la structure de la base. Ici, il n'y a pas d'outil : c'est manuel. |
| Sauvegarde | Copie de la base permettant de restaurer les données en cas de problème. |
| Rollback | Retour à une version précédente (code ou base). |
| Roadmap | Feuille de route : la liste des étapes, faites et à faire. |
| PRD | « Product Requirements Document » : description de ce que doit faire le produit. Ce fichier en tient lieu, en plus simple. |
