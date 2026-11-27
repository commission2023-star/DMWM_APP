# Architecture — DMWM Conseil UASZ

Document technique de référence. Complète le `README.md` (installation, rôles, API)
et `docs/BRIEFING_PROJET.md` (métier et état du projet).

Toutes les affirmations ci-dessous ont été vérifiées dans le code le 26/11/2026.

## 1. Vue d'ensemble

Application monolithique : un seul serveur Express sert l'API REST et les pages
statiques, sur la même origine.

```text
Navigateur
 ├─ pages HTML + CSS + JS        public/
 ├─ service worker               cache hors ligne
 └─ fetch /api/...               JWT dans l'en-tete Authorization
        │
        ▼
Express (server.js)
 ├─ express.static(public)       pages et ressources
 ├─ express.static(uploads)      herite, plus utilise
 ├─ 10 routeurs /api             routes/
 ├─ middlewares                  auth, validation, upload
 └─ controleurs                  logique metier
        │
        ├─ Sequelize ──► MySQL (WAMP en local, Aiven en production)
        └─ Cloudinary ──► photos, pieces d'identite, fichiers
```

Il n'y a pas de couche « service » : les contrôleurs portent la logique métier.

Dans `server.js`, `express.static` est déclaré **avant** `app.get('/')` : à la racine,
c'est donc `public/index.html` qui répond, pas le texte « Serveur operationnel ».

## 2. Chaîne d'authentification

1. `POST /api/auth/login` reçoit `identifiant` et `mot_de_passe`.
2. Le contrôleur cherche l'utilisateur, vérifie `actif`, puis compare le mot de passe
   avec `bcrypt.compare`.
3. Il signe un JWT de **8 heures** contenant `id`, `nom`, `role`, `identifiant`.
4. Le front stocke `token` et `utilisateur` dans `localStorage`.
5. `public/js/auth-guard.js` est chargé avant `sidebar.js` : il vérifie la présence et
   l'expiration du jeton, sinon redirige vers `/index.html`.
6. Chaque appel API envoie `Authorization: Bearer <token>`.
7. `middleware/auth.js` :
   - `verifierToken` décode le jeton et remplit `req.utilisateur` ;
   - `verifierRole(...roles)` compare `req.utilisateur.role` et renvoie `403` sinon.

Limites connues : pas de rafraîchissement de jeton, pas de révocation côté serveur,
et `localStorage` est accessible au JavaScript de la page.

## 3. Flux inscription → membre

```text
inscription.html
   │ POST /api/inscriptions/soumettre        (public)
   ▼
upload Cloudinary (photo, piece d'identite)
   ▼
validerMembre : telephone 9 chiffres, email valide
   ▼
filtrerDonnees : 22 champs autorises + 2 fichiers (URL Cloudinary uniquement)
   ▼
inscriptions_en_attente : { donnees JSON, statut "En attente" }
   │
   ▼  CA : validation-inscriptions.html
GET /api/inscriptions  ──►  PATCH /:id/valider  ou  PATCH /:id/rejeter
                                │
                                ▼
                    membres : categorie = type_formulaire
                              statut = "Confirme" si Ancien, sinon "Nouveau"
                              date_adhesion = jour du traitement
                    inscription : statut "Valide", valide_par, date_traitement
```

Règles :

- Le dossier est stocké en JSON : le formulaire peut évoluer sans migration.
- À la validation, le téléphone est normalisé puis comparé aux 3 formes possibles
  (`771234567`, `221771234567`, `+221771234567`). Un doublon est refusé.
- Un rejet exige un `motif_rejet` non vide.
- Une inscription déjà traitée ne peut pas être retraitée.
- **La validation n'est pas transactionnelle** : `Membre.create` puis
  `inscription.update`. Si la seconde écriture échoue, le membre existe mais le
  dossier reste « En attente ». À corriger dans une session dédiée.
- `PUT /api/inscriptions/:id/modifier` existe mais aucune page ne l'appelle.

## 4. Flux membre

- **Ajout public** : passe par `inscriptions_en_attente` (section 3).
- **Ajout par le CA** : `POST /api/membres`, avec les mêmes validations.
- **Conversion d'un visiteur** : `POST /api/membres` avec `visiteur_id`.
  Le membre et le passage du visiteur à `Devenu membre` se font dans **une
  transaction** : les deux réussissent ou aucun.
- **Modification** : `PUT /api/membres/:id`, doublon de téléphone refusé en excluant
  le membre courant.
- **Changement de statut** : `Nouveau`, `Confirme`, `Inactif`.
- **Archivage** : `PATCH /api/membres/:id/archiver` met `Inactif`. Aucune route ne
  supprime un membre.

## 5. Flux programmes

- Trois types récurrents sont créés automatiquement à chaque `GET /api/programmes`
  et `GET /api/programmes/prochain`, pour la semaine en cours, s'ils n'existent pas :

| Jour | Type | Horaire |
|---|---|---|
| Mardi | `Enseignement` | 21:00 – 23:00 |
| Jeudi | `Goudy Aldiouma` | 21:00 – 23:30 |
| Samedi | `Xadara` | 14:00 – 16:00 |

- Statuts : `Planifie`, `Tenu`, `Annule`.
- Le pointage passe automatiquement le programme à `Tenu`.
- `DELETE /api/programmes/:id` supprime réellement, mais **refuse** un programme
  marqué `recurrent: true`.

## 6. Flux pointage

```text
pointage.html
   │ GET /api/programmes?statut=Planifie
   │   -> garde les programmes dont la date >= aujourd'hui - 7 jours
   │ GET /api/pointage/membres?programme_id=...
   │   -> membres non Inactifs + presence existante pour ce programme
   ▼
saisie Present / Absent (+ visiteurs eventuels)
   ▼
POST /api/pointage/enregistrer
   { programme_id, pointages: [...], visiteurs: [...] }
   ▼
Presence.findOrCreate (membre_id, programme_id) puis update du statut
   ▼
visiteurs : Visiteur.findOrCreate par telephone normalise,
            puis Visite.findOrCreate (visiteur_id, programme_id)
   ▼
programme.statut = "Tenu"
```

- `presences` a un enregistrement unique par couple (membre, programme).
- `visites` a un index unique par couple (visiteur, programme).
- Un visiteur incomplet (prénom, nom ou téléphone manquant) est ignoré et compté
  dans `visiteurs_ignores`.
- **Hors ligne** : la page copie le pointage en local avant l'envoi et détecte
  `401`/`403` pour proposer « Se reconnecter ».
- **Absents récurrents** : sur les 5 derniers programmes `Tenu`, un membre est signalé
  à partir de **2 absences consécutives** (absence d'enregistrement = absence).

## 7. Flux visiteurs

- Seuil stocké dans `parametres`, clé `seuil_visiteurs`, défaut **3**, bornes 1 à 50.
- Les visites sont regroupées par type de programme ; pour le type `Autre`, c'est le
  nom du programme qui sert de clé.
- Un visiteur est « potentiel » si son meilleur nombre de visites pour un même
  programme atteint le seuil.
- Statuts de suivi : `A contacter`, `Contacte`, `Devenu membre`.
  Les deux premiers sont modifiables à la main ; le troisième est posé par la
  conversion et n'est plus modifiable.

## 8. Messages et réunions

- `messages_ca` : expéditeur, commission (le rôle de l'expéditeur), objet, contenu,
  fichier joint (10 Mo max), statut `En attente` ou `Traite`.
- `reunions` : date, horaires, lieu, ordre du jour, créateur.
- `comptes_rendus` : un par réunion **et par commission**, avec contenu et fichier
  (PDF ou DOC/DOCX, 10 Mo max). Il faut un contenu ou un fichier.

## 9. Rapports

`GET /api/rapports/statistiques` renvoie les séries utilisées par les graphiques
Chart.js : taux par programme, répartition par type, classement des 10 membres les
plus assidus, comparaison H/F, évolution des nouveaux adhérents sur 6 mois.

Les exports PDF (PDFKit) et Excel (ExcelJS) sont générés à la volée, sans stockage
intermédiaire. Filtres communs : `mois` (`AAAA-MM`), `type_programme`, `sexe`,
`commission`.

## 10. Front

- 19 pages HTML dans `public/`, un fichier CSS par page plus `commun.css`.
- `sidebar.js` injecte le menu selon `window.currentUser.role`, avec un bloc `<style>`
  embarqué pour la mise en page générale.
- `labels.js` traduit les valeurs stockées sans accents vers l'affichage accentué.
- `telephone-input.js` gère le préfixe `+221` à la saisie.
- PWA : le service worker sert les navigations en réseau d'abord, les ressources en
  cache d'abord, et ignore `/api/` et `/uploads/`.

## 11. Matrice réelle des droits

`SA` = Super Admin, `CA` = Admin CA, `H/F` = Agent H et Agent F.

| Domaine | Lecture | Écriture / gestion |
|---|---|---|
| Membres | SA, CA, PF | SA, CA |
| Inscriptions | SA, CA | SA, CA |
| Programmes | Les 8 rôles | SA, CA |
| Pointage (saisie) | — | SA, CA, H/F |
| Pointage (stats, absences) | SA, CA, PF | — |
| Visiteurs | SA, CA, PF | SA, CA |
| Messages (envoi) | — | SA, CA, PF, CIPS, CTC, CL |
| Messages (lecture, traitement) | SA, CA, PF | SA, CA |
| Réunions (lecture) | SA, CA, PF, CIPS, CTC, CL | — |
| Réunions (création, modification) | — | SA, CA |
| Comptes rendus (ajout) | — | SA, CA, PF, CIPS, CTC, CL |
| Comptes rendus (suppression) | — | SA, CA |
| Rapports | SA, CA, PF | — |
| Comptes utilisateurs | — | SA |

## 12. Écarts connus entre le menu et l'API

1. **Agent H / Agent F** voient « Réunions » et « Envoyer à la CA » dans le menu,
   mais les routes répondent `403`.
2. Le **tableau de bord** appelle `/api/reunions` et
   `/api/pointage/absents-recurrents` pour tous les rôles. Pour les rôles non
   autorisés, la réponse est un objet d'erreur ; le `.filter` qui suit lève une
   exception, donc la partie basse du tableau de bord ne s'affiche pas. Les compteurs
   du haut restent affichés.
3. Quatre routes ne contrôlent que le jeton, pas le rôle : `/api/membres/stats`,
   `/api/inscriptions/stats`, `/api/programmes/prochain`, `/api/messages/mes-messages`.
4. `PUT /api/inscriptions/:id/modifier` n'est appelée par aucune page.

## 13. Décisions d'architecture

| Décision | Raison |
|---|---|
| Aucune suppression de membre, seulement `Inactif` | Conserver l'historique |
| Dossiers d'inscription en JSON | Formulaire évolutif sans migration |
| Visiteurs dans des tables séparées | Ne pas mélanger membres et non-membres |
| Conversion visiteur → membre en transaction | Éviter un membre sans visiteur marqué |
| Téléphone : 9 chiffres en base, `+221` à l'écran | Format unique |
| Fichiers sur Cloudinary | Render ne conserve pas les fichiers locaux |
| Front et back dans le même dépôt | Déploiement simple sur Render |
| Statuts stockés sans accents | Contrainte historique ; `labels.js` gère l'affichage |
