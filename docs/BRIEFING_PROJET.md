# BRIEFING DE PASSATION — DMWM Conseil UASZ

**Version 2 — 26/11/2026** — destiné à `docs/BRIEFING_PROJET.md`
**Rédigé par** : Claude (chef de projet technique, claude.ai), pour l'agent OpenCode.
**Version 2** : les points vérifiables ont été contrôlés dans le dépôt le 26/11/2026 ; voir aussi `README.md`, `docs/ARCHITECTURE.md`, `docs/API.md` et `docs/EXPLOITATION.md`.

**Légende des niveaux de confiance**
- **[VU]** : code ou sortie de commande vus pendant les sessions de travail.
- **[MÉM]** : affirmé par Zo ou noté dans la mémoire du projet, non revérifié dans le code.
- **[À CONFIRMER]** : absent ou incertain. Ne pas le traiter comme un fait.

**Avertissement** : la version 1 a été écrite sans accès au dépôt GitHub. La version 2 corrige les points vérifiés dans le code le 26/11/2026 ; les lignes encore marquées [MÉM] ou [À CONFIRMER] n'ont pas été vérifiées. Aucun secret n'y figure.

---

## 1. Identité du projet

| Élément | Contenu |
|---|---|
| Nom | DMWM — Conseil UASZ (dépôt : `DMWM_APP`, base locale : `dmwm_uasz`) |
| But | Application web d'administration du Conseil UASZ : membres, inscriptions, programmes, pointage, absences, visiteurs, messages à la CA, réunions et comptes rendus, rapports PDF/Excel [MÉM] |
| Commanditaire | Conseil UASZ (Moustarchidine Junior), sous-structure du DMWM, Université Assane Seck de Ziguinchor (Sénégal) [MÉM] |
| Utilisateurs finaux | Environ 350 membres ; l'application est utilisée par les membres de la CA et les responsables (8 rôles) [MÉM] |
| Mainteneur actuel | Zo, Master 1 MIO, membre de la CA, niveau intermédiaire, découvre Node.js [MÉM] |
| Propriétaire du dépôt | Compte GitHub `commission2023-star`, dépôt `commission2023-star/DMWM_APP` [MÉM] |
| URL de production | https://dmwm-uasz.onrender.com (peut dormir, plan gratuit) [MÉM] |
| Données | Les données de l'application déployée sont **fictives**. Le lancement officiel viendra après les mises à jour [MÉM] |
| Langue | Tout est en français (interface, messages d'erreur, commentaires) [MÉM] |

Propriétaire juridique, hébergeur officiel et responsable des données : **[À CONFIRMER]** (non précisé dans les sources).

## 2. Glossaire métier

| Terme | Définition | Niveau |
|---|---|---|
| DMWM | Mouvement dont le Conseil UASZ est une sous-structure. Développement exact de l'acronyme : à confirmer | [À CONFIRMER] |
| Conseil UASZ / Moustarchidine Junior | Structure des étudiants membres à l'UASZ, ~350 membres | [MÉM] |
| CA | Commission Administrative : examine les dossiers d'inscription (la page de validation lui est réservée) | [VU] pour le rôle, développement [MÉM] |
| PF | Rôle « PF » et valeur du champ `commission` ; dans le formulaire public, « PF / Président » désigne le responsable de la section de base du membre (champs `pf_nom`, `pf_telephone`). Développement exact : à confirmer | [VU] champs, [À CONFIRMER] sens |
| CIPS, CTC, CL | Valeurs de `commission` et de `poste_section_base`, et rôles utilisateur. Développements et attributions : à confirmer | [VU] valeurs, [À CONFIRMER] sens |
| Commission (membre) | ENUM : `PF`, `CA`, `CIPS`, `CTC`, `CL`, `Membre simple` (défaut `Membre simple`) | [VU] |
| Poste en section de base | ENUM : `PF`, `CA`, `CIPS`, `CL`, `CTC`, `Aucun` (sans valeur par défaut) | [VU] |
| Catégorie | `Nouveau Bachelier` (étudiant orienté à l'UASZ déjà membre), `Nouveau Adherent` (étudiant découvrant le mouvement, sans accent en base), `Ancien` (formulaire « Ancien / Confirmé ») | [VU] enum, [MÉM] sens |
| Statut membre | `Nouveau` (défaut), `Confirme` (affiché « Confirmé » par `public/js/labels.js`), `Inactif` (= archivé) | [VU] |
| Statut inscription | `En attente`, `Valide`, `Rejete` | [VU] |
| Section de base, comité/axe, conseil d'origine | Origine du membre dans le mouvement (champs `section_base`, `comite_origine`, `conseil_origine`), demandée aux formulaires Nouveau Bachelier et Ancien, pas à Nouveau Adhérent | [VU] |
| Programmes | Mardi « Enseignement » (21:00–23:00), jeudi « Goudy Aldiouma » (21:00–23:30), samedi « Xadara » (14:00–16:00), plus des types « Autre » ajoutés à la main. Ces trois programmes sont créés automatiquement pour la semaine en cours à chaque lecture de la liste | [VU] |
| Statut programme | `Planifie`, `Tenu`, `Annule` (valeurs vues dans `programmes.html`) | [VU] |
| Visiteur | Personne présente à un programme sans être membre ; table séparée de `membres` | [MÉM] |
| Potentiel | Indicateur : un visiteur atteint le seuil de participations (défaut 3, configurable de 1 à 50) au même type de programme. Jamais d'adhésion automatique | [MÉM] |

## 3. Acteurs et rôles

Les 8 rôles : **Super Admin, Admin CA, Agent H, Agent F, PF, CIPS, CTC, CL** (`models/Utilisateur.js`) [VU].

Rôles de référence dans le code vu : le tableau `rolesCA = ['Super Admin', 'Admin CA']` de `routes/inscriptions.js` [VU].

**Matrice rôle × action** — vérifiée dans `routes/` ; version complète dans `docs/ARCHITECTURE.md` §11.

| Domaine | Lire | Créer / Modifier / Valider | Niveau |
|---|---|---|---|
| Inscriptions (liste, détail, valider, rejeter, modifier) | Super Admin, Admin CA | Super Admin, Admin CA | [VU] |
| Inscriptions : soumission | Public sans connexion | — | [VU] |
| Inscriptions : stats | tout utilisateur connecté (jeton requis, rôle non contrôlé) | — | [VU] |
| Visiteurs | Super Admin, Admin CA, PF | Super Admin, Admin CA | [VU] |
| Membres | Super Admin, Admin CA, PF | Super Admin, Admin CA | [VU] |
| Suppression d'un membre | **Impossible par décision** : archivage (statut `Inactif`) | — | [VU] |
| Programmes, pointage, absences, messages CA, réunions, comptes rendus, rapports, comptes utilisateurs | Voir `docs/ARCHITECTURE.md` §11 | Voir `docs/ARCHITECTURE.md` §11 | [VU] |
| Agent H / Agent F | Programmes, pointage | Pointage | [VU] |
| CIPS / CTC / CL | Programmes, réunions | Messages à la CA, comptes rendus | [VU] |

Point d'architecture [MÉM] : côté navigateur, `window.currentUser.role` et `window.authToken` sont fournis par `public/js/auth-guard.js`, qui **ne contrôle pas le rôle**. Seul le menu (`sidebar.js`) masque des liens ; le contrôle d'accès réel est dans les routes serveur (`verifierToken`, `verifierRole`).

## 4. Règles métier détaillées

### 4.1 Inscription publique
- Page `public/inscription.html`, sans connexion. 3 profils : Nouveau Bachelier, Nouveau Adhérent, Ancien / Confirmé. Le formulaire s'adapte (la section « Origine dans le mouvement » est cachée pour Nouveau Adhérent) [VU].
- Champs obligatoires côté navigateur uniquement : prénom, nom, sexe, téléphone, nom du tuteur, téléphone du tuteur [VU].
- 22 champs envoyés : `prenom, nom, sexe, date_naissance, lieu_naissance, telephone, email, adresse, tuteur_nom, tuteur_telephone, filiere, niveau, region_origine, departement, arrondissement, commune`, puis (hors Nouveau Adhérent) `comite_origine, conseil_origine, section_base, poste_section_base, pf_nom, pf_telephone`. Plus 2 fichiers facultatifs : `photo_profil`, `document_identite` [VU].
- Envoi en `FormData` vers `POST /api/inscriptions/soumettre`. Réponse : message de succès et `id` (numéro de dossier) [VU].
- **Côté serveur, seul `type_formulaire` est exigé à la soumission** (avec la validité des téléphones et de l'email par `validerMembre`). Le prénom, le nom, le sexe et la catégorie ne sont pas vérifiés à ce stade : un dossier incomplet peut être enregistré, puis échouer à la validation (erreur 500 probable, non testée) [VU code].
- Le serveur ne vérifie pas non plus le doublon de téléphone à la soumission : le doublon n'est détecté qu'à la validation [VU code].
- Depuis le commit `a3c235e`, `soumettre` ne conserve que les 22 champs autorisés (`utils/champsInscription.js`) ; les adresses de fichiers viennent uniquement des fichiers réellement envoyés (Multer/Cloudinary) [VU].

### 4.2 Validation, rejet, modification (CA)
- **Valider** (`PATCH /api/inscriptions/:id/valider`) : refuse un dossier déjà traité ; normalise les 3 téléphones (message « … invalide dans le dossier. Modifiez-le avant de valider. ») ; refuse si un membre a déjà ce téléphone (3 formes testées : `n`, `221n`, `+221n`) ; crée le membre avec `categorie = type_formulaire`, `statut = 'Confirme'` si le type est `Ancien`, sinon `'Nouveau'`, `date_adhesion = maintenant` ; passe le dossier à `Valide` avec `valide_par` et `date_traitement`. Les champs de fichiers sont repris seulement s'ils commencent par `https://res.cloudinary.com/` [VU].
- **Faiblesse connue, non testée** : création du membre et mise à jour du dossier ne sont pas dans une transaction ; si la seconde étape échoue, le membre existe et le dossier reste « En attente » [VU code].
- **Rejeter** : motif obligatoire (non vide) ; dossier déjà traité refusé ; statut `Rejete` [VU].
- **Modifier** (`PUT /api/inscriptions/:id/modifier`) : remplace `donnees` en entier, vérifie seulement les téléphones, ne vérifie pas le statut du dossier et ne filtre pas les champs [VU code]. Aucune page ne l'appelle : vérifié dans les 19 pages de `public/` le 26/11/2026 [VU].

### 4.3 Membres
- CRUD sans suppression ; archivage = statut `Inactif`. Liste filtrable (statut, sexe, commission, recherche `q`) [MÉM doc Phases 3-4].
- Téléphone : voir 4.9. Unicité en base sur `membres.telephone` [VU].
- Fichiers : photo de profil et pièce d'identité (JPG, PNG, PDF, 5 Mo max), envoyés à Cloudinary [VU].
- Création d'un membre depuis un visiteur : voir 4.6.

### 4.4 Pointage
- Programmes proposés au pointage : `GET /api/programmes?statut=Planifie`, puis filtre de `pointage.html` : date supérieure ou égale à aujourd'hui − 7 jours [VU].
- À l'envoi, `findOrCreate` par (membre, programme) enregistre la présence ; le programme passe à `Tenu` [MÉM].
- Hors ligne : le navigateur garde le travail dans `localStorage` (clés `brouillon_<id>`, `pointage_<id>` pour le pointage finalisé, `cache_programmes`, `cache_membres`). `synchroniserDonneesLocales` envoie les `pointage_<id>` toutes les 10 s et au retour du réseau, puis efface la clé. Les visiteurs de la séance sont dans le champ `visiteurs` de ces clés [MÉM ; effacement après envoi confirmé en production le 26/11/2026].
- Limite connue : en rouvrant un programme déjà pointé, les visiteurs déjà enregistrés ne s'affichent pas [MÉM].

### 4.5 Absences
- Seuil : ≥ 2 absences consécutives ; `absences.html` met en avant les cas à 3 et plus (`absences_consecutives >= 3`) [MÉM/VU]. Lien WhatsApp `https://wa.me/221<téléphone>` : suppose un numéro à 9 chiffres [VU].

### 4.6 Visiteurs et conversion
- Table séparée ; prénom, nom, téléphone obligatoires ; statuts de suivi : `A contacter`, `Contacte`, `Devenu membre` (ce dernier uniquement par la conversion) [MÉM].
- Seuil par défaut 3 participations au **même type de programme** (pas de cumul entre programmes) ; compte aussi les programmes « Autre », par nom sans tenir compte de la casse ; seuil configurable 1 à 50 ; simple indicateur [MÉM].
- Conversion : la CA choisit d'abord le type (Nouveau Bachelier, Nouveau Adhérent, Ancien / Confirmé), complète le formulaire ; le serveur crée le membre et marque le visiteur dans une **transaction** (`ajouterMembre`, champ `visiteur_id`) [MÉM].
- Lecture : Super Admin, Admin CA, PF. Écriture : Super Admin, Admin CA [MÉM].

### 4.7 Messages à la CA, réunions et comptes rendus, rapports
- Messagerie vers la CA : `messages_ca` (objet obligatoire, contenu facultatif, fichier 10 Mo max), statuts `En attente` et `Traite`, compteurs `enAttente`, `traites`, `total` [VU].
- Réunions et comptes rendus : `reunions` (date obligatoire) et `comptes_rendus` (un par réunion et par commission ; contenu et/ou fichier PDF/DOC/DOCX, 10 Mo max) [VU].
- Rapports : `statistiques` (taux par programme, répartition par type, classement des 10 membres, comparaison H/F, évolution sur 6 mois), exports PDF (PDFKit) et Excel (ExcelJS) avec filtres `mois`, `type_programme`, `sexe`, `commission` [VU]. Détail dans `docs/API.md`.

### 4.8 Cas limites connus
- Dossier d'inscription sans prénom/nom : accepté à la soumission (voir 4.1).
- Deux dossiers en attente avec le même téléphone : le second échoue à la validation.
- Membres créés avant la migration Cloudinary : chemins `/uploads/…` cassés [MÉM].

### 4.9 Téléphone (règle transverse)
- Format en base : **9 chiffres**, sans `+221` ni espaces. Entrée acceptée : espaces et tirets ignorés, préfixe `221` ou `+221` facultatif, exactement 9 chiffres ensuite [VU `utils/telephone.js`].
- Un champ vide est accepté ; un numéro invalide est refusé, tuteur et PF compris [VU/MÉM].
- À l'écran : `+221` fixe à gauche, numéro en groupes (`77 123 45 67`) ; mêmes règles pour les 7 champs (`f_telephone`, `f_tuteur_telephone`, `f_pf_telephone`, `telephone`, `tuteur_telephone`, `pf_telephone`, `visTelephone`) via `public/js/telephone-input.js` [MÉM].
- Les listes ne sont pas reformatées à l'affichage (décision : faible valeur) [MÉM].
- Aucune migration des anciens numéros : les données sont fictives (décision du 26/11/2026).

## 5. Stack et architecture

| Couche | Choix | Niveau |
|---|---|---|
| Serveur | Node.js + Express (`server.js`), lancé en développement par `npm run dev` (nodemon) | [MÉM] |
| Node | Aucun champ `engines` dans `package.json`. Version utilisée par Render : **[À CONFIRMER]** ; le terminal de Zo affichait v26.12.0 le 26/11/2026 [MÉM]. | [VU] |
| Base | MySQL via Sequelize/mysql2, `underscored: true`, `timestamps: true` (colonnes `created_at`, `updated_at`) ; version MySQL [À CONFIRMER] | [VU] |
| Auth | JWT (durée 8 h, décision : ne pas changer pour l'instant), mots de passe hachés avec bcryptjs (10 tours vus dans `sync.js`) | [MÉM/VU] |
| Fichiers | Multer + Cloudinary (`multer-storage-cloudinary`) | [VU] |
| Rapports | PDFKit, ExcelJS ; graphiques Chart.js | [MÉM] |
| Frontend | HTML statique dans `public/`, Bootstrap 5 et Lucide servis en local, design system dans `commun.css` (mode clair/sombre), JavaScript natif, PWA (service worker) | [MÉM] |

**Flux d'une requête** : navigateur → `server.js` → `routes/<domaine>.js` (middlewares `verifierToken`, `verifierRole(...)`, `uploadMembreFields`, `validerMembre`) → `controllers/<domaine>Controller.js` → `models/*` (Sequelize) → MySQL. Les contrôleurs répondent en JSON ; les erreurs serveur renvoient `{ message: 'Erreur serveur.', erreur: <message d'erreur> }` [VU].

**Connexion base** (`config/database.js`) [VU] : lit `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` (défaut 3306), `DB_SSL`. SSL activé automatiquement si l'hôte n'est pas local (`localhost`, `127.0.0.1`, `::1`) ou si `DB_SSL=true` ; `rejectUnauthorized: false`. Pool max 5 ; 5 tentatives avec attente croissante sur les erreurs réseau (résilience Render/Aiven). La connexion s'authentifie dès le chargement du fichier.

## 6. Arborescence commentée

| Chemin | Rôle | Niveau |
|---|---|---|
| `server.js` | Point d'entrée Express ; **aucun `sync` dedans** | [MÉM] |
| `sync.js` | Crée les tables manquantes (`sync({ force: false })`) et un Super Admin s'il n'en existe aucun. Vise la base du `.env` | [VU] |
| `config/database.js`, `config/cloudinary.js` | Connexion Sequelize ; configuration Cloudinary | [VU] / [MÉM] |
| `models/` (`index.js`, `Membre.js`, `InscriptionEnAttente.js`, `Visiteur.js`, `Visite.js`, `Parametre.js`, …) | Modèles Sequelize. `models/index.js` a été réécrit par le formateur de VS Code (cosmétique) | [MÉM] |
| `controllers/` (`membreController.js`, `inscriptionController.js`, `pointageController.js`, `visiteurController.js`, …) | Logique métier | [MÉM] |
| `routes/` (`membres.js`, `inscriptions.js`, `visiteurs.js`, …) | Déclaration des routes et de leurs protections | [MÉM] |
| `middleware/` (`auth.js`, `validation.js`, `upload.js`) | Authentification/rôles ; validation (téléphones, email) ; upload Cloudinary partagé (`uploadMembreFields`, dossier `dmwm-uasz/membres`, 5 Mo, JPG/PNG/PDF) | [VU] |
| `utils/` (`telephone.js`, `champsInscription.js`, …) | Normalisation des téléphones ; liste blanche des champs d'un dossier | [VU] |
| `public/` | Pages HTML, `css/` (un fichier par page + `commun.css`), `js/` (`sidebar.js`, `auth-guard.js`, `labels.js`, `telephone-input.js`, `pwa.js`, `theme.js`, `icons.js`), `js-libs/` (Bootstrap, Lucide), `service-worker.js` | [MÉM] |
| `public/js/copier-libs.js` | Copie Bootstrap, Chart.js, Lucide et les polices dans `public/` ; exécuté automatiquement par `npm run postinstall`, donc à chaque `npm install`, y compris sur Render. Les copies sont ignorées par Git. | [VU] |
| `docs/` | Documentation (ce briefing) | |

Ordre des `<link>` CSS dans chaque page : bootstrap, commun, page [MÉM]. `commun.css` porte le design system (couleurs, polices, shell, cartes, tableaux, formulaires, mode sombre) ; les fichiers de page ne gardent que leurs styles propres. `page-wrapper`, `topbar-page`, `btn-hamburger` sont définis dans `commun.css` et le shell est généré par `sidebar.js` [MÉM].

## 7. Modèle de données

Toutes les tables ont `created_at` / `updated_at` (Sequelize, `underscored`).

### 7.1 `membres` [VU]
`id` (PK auto), `prenom` (obligatoire), `nom` (obligatoire), `sexe` ENUM(`H`,`F`) (obligatoire), `date_naissance` (date), `lieu_naissance`, `adresse`, `telephone` (**unique**), `email`, `photo_profil`, `document_identite`, `tuteur_nom`, `tuteur_telephone`, `filiere`, `niveau`, `region_origine`, `departement`, `arrondissement`, `commune`, `comite_origine`, `conseil_origine`, `section_base`, `pf_nom`, `pf_telephone`, `poste_section_base` ENUM(`PF`,`CA`,`CIPS`,`CL`,`CTC`,`Aucun`), `categorie` ENUM(`Nouveau Bachelier`,`Nouveau Adherent`,`Ancien`) (obligatoire), `commission` ENUM(`PF`,`CA`,`CIPS`,`CTC`,`CL`,`Membre simple`) défaut `Membre simple`, `date_adhesion` (date), `statut` ENUM(`Nouveau`,`Confirme`,`Inactif`) défaut `Nouveau`, `notes` (texte).
Non appliqué en base : unicité sur les téléphones du tuteur et du PF ; aucune clé étrangère déclarée dans le modèle ; aucun champ de suppression logique en dehors du statut.

### 7.2 `inscriptions_en_attente` [VU]
`id`, `type_formulaire` ENUM(`Nouveau Bachelier`,`Nouveau Adherent`,`Ancien`) (obligatoire), `donnees` JSON (obligatoire), `statut` ENUM(`En attente`,`Valide`,`Rejete`) défaut `En attente`, `motif_rejet` (texte), `valide_par` (entier, sans clé étrangère déclarée), `date_traitement` (date-heure).

### 7.3 Visiteurs [VU]
- `visiteurs` : `id`, `prenom`, `nom`, `telephone` (20, unique), `statut_suivi` ENUM(`A contacter`,`Contacte`,`Devenu membre`) défaut `A contacter`, `membre_id` (nullable, sans clé étrangère déclarée).
- `visites` : `id`, `visiteur_id`, `programme_id`, **index unique (visiteur, programme)**.
- `parametres` : `cle` (clé primaire, 50), `valeur` (100) ; stocke le seuil des visiteurs (`seuil_visiteurs`, défaut 3).
- Modèles `Visiteur`, `Visite`, `Parametre` ; tables créées par `node sync.js` (créées sur Aiven le 26/11/2026).

### 7.4 Autres tables [VU]
- `utilisateurs` : `id`, `nom`, `identifiant` (unique), `mot_de_passe` (haché), `role` ENUM(8 rôles), `actif` (booléen, défaut vrai).
- `programmes` : `id`, `type` ENUM(`Goudy Aldiouma`,`Xadara`,`Enseignement`,`Autre`), `nom`, `date`, `heure_debut`, `heure_fin`, `lieu`, `oustaze`, `theme`, `recurrent` (booléen), `statut` ENUM(`Planifie`,`Tenu`,`Annule`).
- `presences` : `id`, `membre_id`, `programme_id`, `statut` ENUM(`Present`,`Absent`), `sync_status` ENUM(`Local`,`Synchronise`).
- `messages_ca` : `id`, `expediteur_id`, `commission`, `objet`, `contenu`, `fichier_joint`, `statut` ENUM(`En attente`,`Traite`).
- `reunions` : `id`, `date`, `heure_debut`, `heure_fin`, `lieu`, `ordre_du_jour`, `cree_par`.
- `comptes_rendus` : `id`, `reunion_id`, `auteur_id`, `commission`, `contenu`, `fichier`.

Aucune clé étrangère n'est déclarée dans les modèles (`constraints: false` sur les associations).

**Pas de système de migrations** : `sync({ force: false })` crée les tables manquantes mais **ne modifie jamais** une table existante. Toute modification de colonne en production se fait à la main ou par un script à écrire.

## 8. API

Format d'erreur courant : `{ "message": "...", "erreur": "..." }` avec les codes 400, 401, 404, 500 [VU].

### 8.1 Routes connues

| Méthode | Chemin | Protection | Remarques | Niveau |
|---|---|---|---|---|
| GET | `/api/health` | Publique | Utilisée par le ping cron-job.org ; 200 en production le 26/11/2026 | [MÉM/VU] |
| POST | `/api/inscriptions/soumettre` | **Publique** | `multipart/form-data` ; `uploadMembreFields` puis `validerMembre` puis `soumettre` | [VU] |
| GET | `/api/inscriptions/stats` | Token | `{ enAttente, valides, rejetes, total }` | [VU] |
| GET | `/api/inscriptions` | Super Admin, Admin CA | filtres `statut`, `type_formulaire` ; tri par `created_at` décroissant | [VU] |
| GET | `/api/inscriptions/:id` | Super Admin, Admin CA | | [VU] |
| PATCH | `/api/inscriptions/:id/valider` | Super Admin, Admin CA | crée le membre | [VU] |
| PATCH | `/api/inscriptions/:id/rejeter` | Super Admin, Admin CA | corps `{ motif_rejet }` obligatoire | [VU] |
| PUT | `/api/inscriptions/:id/modifier` | Super Admin, Admin CA | corps `{ donnees }` | [VU] |
| GET | `/api/membres/stats` | Token | total, nouveaux, H/F, inactifs | [MÉM] |
| GET | `/api/membres`, `/api/membres/:id` | CA / PF / Super Admin | | [MÉM] |
| POST / PUT | `/api/membres`, `/api/membres/:id` | CA / Super Admin | `multipart` ; POST accepte `visiteur_id` (conversion, transaction) | [MÉM] |
| PATCH | `/api/membres/:id/statut`, `/api/membres/:id/archiver` | CA / Super Admin | | [MÉM] |
| GET | `/api/visiteurs` | Super Admin, Admin CA, PF | 401 sans token (testé en production) ; chaque visiteur porte `participations`, `potentiel`, `statut_suivi` | [VU/MÉM] |
| GET | `/api/visiteurs/:id/historique` | idem | renvoie un `historique` (date, programme, lieu) | [VU/MÉM] |
| PUT | `/api/visiteurs/seuil` | Super Admin, Admin CA | seuil de 1 à 50 | [MÉM] |
| PATCH | `/api/visiteurs/:id/statut` | Super Admin, Admin CA | | [MÉM] |

### 8.2 Autres routes
Toutes les routes sont désormais relevées et documentées dans `docs/API.md` (méthode, chemin, rôles, corps, réponses). Les chemins `/api/` et `/uploads/` ne sont jamais interceptés par le service worker [VU].

## 9. Pages et parcours

19 pages dans `public/` [VU] : `index.html` (connexion), `dashboard.html`, `membres.html`, `membre-form.html`, `membre-detail.html`, `nouveaux-adherents.html`, `validation-inscriptions.html`, `inscription.html` (publique), `programmes.html`, `pointage.html`, `absences.html`, `visiteurs.html`, `boite-reception.html`, `partager-ca.html`, `reunions.html`, `rapports.html`, `comptes.html`, `profil.html`, `offline.html`. L'accès aux pages dépend du menu de `sidebar.js` ; le contrôle réel reste côté API (section 3).

Scripts partagés [MÉM] : `sidebar.js` (menu selon rôle, hamburger mobile, badge des inscriptions en attente, déconnexion), `auth-guard.js` (fournit `window.currentUser` et `window.authToken`, ne contrôle pas le rôle), `labels.js` (libellés d'affichage, par exemple `Confirme` → « Confirmé »), `telephone-input.js` (champs téléphone, expose `window.rafraichirTelephones` et `window.formaterTelephone`), `pwa.js`.

Parcours principal : inscription publique → dossier « En attente » → la CA ouvre `validation-inscriptions.html`, valide ou rejette → membre visible dans `membres.html`. Parcours visiteur : pointage (en ligne ou hors ligne) → visiteur enregistré → `visiteurs.html` → conversion en membre par la CA.

PWA [VU] : `public/service-worker.js`, `VERSION = "v3"`, 14 fichiers au PRECACHE dont `pointage.html`, `sidebar.js`, `telephone-input.js`. **`cache.addAll` est tout ou rien** : un fichier introuvable fait échouer tout le pré-cache. Changer la `VERSION` quand un fichier pré-caché change. Icônes de la PWA : provisoires (« DM »).

## 10. Sécurité et données personnelles

| Sujet | État | Niveau |
|---|---|---|
| Token | JWT 8 h ; stocké dans `localStorage` avec l'utilisateur ; `window.authToken` fourni par `auth-guard.js` | [VU] |
| CORS | `app.use(cors())` sans restriction : toutes les origines sont acceptées | [VU] |
| Rate limiting | Aucun middleware de limitation, y compris sur la route publique de soumission | [VU] |
| Journal d'audit | Aucun journal d'audit : seuls `valide_par` et `date_traitement` sur les dossiers, et `cree_par` sur les réunions | [VU] |
| Validation des entrées | `validerMembre` ne contrôle que les téléphones et l'email ; il ne refuse ni `<` ni `>` | [VU] |
| Route publique | `POST /api/inscriptions/soumettre` : liste blanche de 22 champs ajoutée le 26/11/2026 (`a3c235e`). Le test avec une requête truquée (`commission`, `notes`, faux `photo_profil`) a confirmé l'écartement | [VU] |
| XSS | **Échappement ajouté seulement dans** `validation-inscriptions.html` (`516b316`), et déjà présent dans `visiteurs.html` (`echapper`) et dans la liste de visiteurs de `pointage.html` (`echapperHtml`). **Non échappés** (prénom/nom insérés dans `innerHTML`) : `membres.html`, `nouveaux-adherents.html`, `absences.html`, `dashboard.html`, `pointage.html` (liste des membres) ; saisis par des comptes de confiance mais sans échappement : `comptes.html`, `programmes.html` ; `rapports.html` à examiner. `membre-detail.html` utilise `textContent` (sûr) | [VU] |
| Apostrophe | Bug **confirmé** dans `membres.html`, `nouveaux-adherents.html`, `absences.html` et `comptes.html` : les `onclick` passent le nom entre apostrophes (`archiverMembre`, `confirmerMembre`, `voirHistorique`…) | [VU] |
| Uploads | Extension contrôlée (JPG/PNG/PDF), pas le contenu ; 5 Mo ; Cloudinary `resource_type: auto` ; pièces d'identité en **URL publiques** (à durcir plus tard) ; un refus serveur après l'upload peut laisser un fichier orphelin | [VU/MÉM] |
| Messages d'erreur | Les erreurs 500 renvoient le message interne (`erreur: error.message`) au client | [VU] |
| Mot de passe par défaut | `sync.js` crée un Super Admin (identifiant `superadmin`) avec un mot de passe **écrit en clair dans le fichier** et affiché dans la console. Valeur non reproduite ici. A-t-il été changé en production ? | [À CONFIRMER] |
| Incident du 26/11/2026 | Le mot de passe de la base Aiven a été collé dans une conversation avec un assistant ; il a été **changé sur Aiven et sur Render** (confirmé par Zo). Un test de santé de la production a répondu 200 ensuite | [MÉM] |
| Données personnelles | Noms, téléphones, adresses, tuteurs, photos, pièces d'identité de ~350 personnes. Politique de conservation, consentement, mentions légales, base légale : **aucune trouvée** | [À CONFIRMER] |
| `npm audit fix --force` | À ne jamais lancer | [MÉM] |

## 11. Environnements et comptes

| Environnement | Détail | Niveau |
|---|---|---|
| Local | Windows, VS Code, WAMP (MySQL), Node, PowerShell ; dossier `C:\wamp64\www\UASZ DMWM\DMWM_APP` ; base `dmwm_uasz` ; le `.env` pointe vers le **local** | [MÉM] |
| Production — application | Render (plan gratuit, déploiement automatique depuis la branche `main`, peut dormir) ; ping `cron-job.org` sur `/api/health` | [MÉM] |
| Production — base | Aiven MySQL (plan gratuit, SSL obligatoire), base `defaultdb`, service `dmwm-uasz-db`. Le plan gratuit peut s'éteindre après inactivité : rappel hebdomadaire de connexion à la console ; il n'est pas prouvé qu'un `SELECT 1` suffise | [MÉM] |
| Fichiers | Cloudinary, dossier `dmwm-uasz/membres` ; plan gratuit à quota | [MÉM] |
| Staging | Aucun | [MÉM] |
| Code | GitHub `commission2023-star/DMWM_APP` (branches `main`, `develop`) | [MÉM] |
| TablePlus | Configuré sur **Aiven, c'est-à-dire la production** : attention aux requêtes d'écriture | [MÉM] |

**Variables d'environnement (noms seulement)** : `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`, `JWT_SECRET`, `PORT` [VU]. Cloudinary n'utilise **aucune** variable : le nom, la clé et le secret sont écrits en dur dans `config/cloudinary.js` [VU]. Un modèle `.env.example` existe désormais à la racine.
**Emplacement** : fichier `.env` local, non versionné [MÉM] ; variables d'environnement du service sur Render [MÉM]. Les valeurs ne doivent jamais être demandées, copiées ni écrites dans un document.

**Qui détient les accès** : Zo détient le poste, le compte GitHub `commission2023-star`, et vraisemblablement les consoles Render, Aiven, Cloudinary et cron-job.org (**[À CONFIRMER]**, ainsi que les autres personnes de la CA qui y ont accès).

**Viser Aiven depuis le poste sans toucher au `.env`** (méthode utilisée le 26/11/2026) : dans un terminal PowerShell neuf, définir `$env:DB_HOST`, `$env:DB_PORT`, `$env:DB_NAME`, `$env:DB_USER`, `$env:DB_SSL = "true"` et saisir le mot de passe sans l'afficher dans une conversation (`dotenv` ne remplace pas une variable déjà définie). Contrôler `Hote local ? false` avec un script de lecture avant toute écriture, et **fermer le terminal ensuite** (sinon `npm run dev` viserait la production).

## 12. Déploiement et exploitation

| Sujet | Contenu | Niveau |
|---|---|---|
| Développement | `npm run dev` (nodemon) ; WAMP/MySQL doit tourner, sinon `ECONNREFUSED ::1:3306` | [MÉM] |
| Création des tables | `node sync.js` (tables manquantes seulement ; ne touche pas aux tables existantes) | [VU] |
| Mise en production | Pull Request `develop` → `main` sur GitHub (type « Create a merge commit »), puis Render redéploie `main` | [MÉM] |
| Commande de build / démarrage sur Render | `npm install` / `node server.js` (scripts du `package.json`) ; version de Node **[À CONFIRMER]** | [VU] |
| Interroger la base | `node -r dotenv/config -e "..."` avec `require('./models')` ; Zo avait indiqué que le terminal ne connaissait pas `mysql` ; la mémoire du projet parle du terminal MySQL : **[À CONFIRMER]** | [MÉM] |
| Tester la production | `Invoke-WebRequest` (PowerShell, pas `curl -H`) ; vérifier `/api/health`, les pages, le code 401 d'une route protégée | [MÉM] |
| Sauvegardes / restauration | **Aucune procédure documentée** ; sauvegardes automatiques d'Aiven (plan gratuit) : à vérifier. Voir `docs/EXPLOITATION.md` §6 | [À CONFIRMER] |
| Supervision | Ping cron-job.org sur `/api/health` (garde Render éveillé) ; pas d'alerte connue | [MÉM] |
| Retour arrière | Documenté dans `docs/EXPLOITATION.md` §9 : redéploiement d'un déploiement précédent sur Render, `git revert` puis nouvelle PR, restauration de sauvegarde pour la base | [VU] |

**Incidents connus** : Render ne conserve pas les fichiers envoyés (cause du passage à Cloudinary) ; fichiers CSS en 404 lors d'une mise en production quand un `push` avait été oublié ; une erreur 500 aurait frappé tout visiteur envoyé en production tant que les tables visiteurs n'existaient pas sur Aiven (corrigé le 26/11/2026) ; fuite d'un mot de passe Aiven dans une conversation (voir section 10).

## 13. État réel du projet (au 26/11/2026)

**Git** : `develop` = `410a892` (documentation) ; `main` doit être aligné après la prochaine PR. Fichiers non suivis : `docs/`, `.opencode/` (outil local) et `verifier_tables.js` (lecture seule, **jamais à commiter**). Commits récents : `1a0ad97`, `527c07f`, `10f1fa8`, `60690db` (visiteurs), `06a4abc` (photo et documents, fait par Zo hors méthode), `f43747b` (conversion), `5f51e48`, `4528725` (téléphone), `516b316` (échappement), `a3c235e` (filtre des champs) [VU].

**Terminé et confirmé par Zo** : phases 1 à 10, V2, migration Cloudinary, résilience Render/Aiven (tâche 3), CSS en fichiers `.css` (tâche 4), stratégie mobile (tâche 5), tâche 6 (visiteurs au pointage, API, page d'administration, conversion, téléphone serveur et formulaires). Tests en production le 26/11/2026 : déploiement (200 sur les pages, `VERSION v3`, 401 sans token), page Visiteurs sur Aiven, pointage en ligne avec visiteur, pointage **hors ligne** avec visiteur (clé `pointage_<id>` créée puis effacée après resynchronisation), cache `dmwm-v3`. Test réel de la photo et de la carte d'identité en local (formulaire public → validation → fiche du membre) [MÉM].

**Données de test** : locales (membres 14 « Test Format », 15 « Test Format2 » archivé, 16 « Test Photo », 17 « Test Filtre » ; dossiers de test tous traités ; visiteurs Test Visiteur, Awa Ba, Moussa Fall) ; en production : visiteurs `Test Prod` et `Test Hors`, un programme passé à `Tenu` par le test. L'archivage du membre 14 n'a jamais été confirmé.

**Jamais testé en conditions réelles** [MÉM] : réseau lent ; plusieurs appareils en même temps ; tailles « 0 » dans Cache Storage ; photo de plus de 5 Mo ; badge des jours (nouveaux adhérents) ; rejet avec/sans motif en production ; suppression de programme ; filtre par mois ; absences sur 2 programmes ; Cloudinary avec de vrais volumes.

**Bugs et limites ouverts** : voir sections 4, 10 et 14.

## 14. Backlog et priorités

Règle absolue : **ne rien démarrer sans l'accord explicite de Zo.** L'ordre ci-dessous est une proposition ; Zo décide.

| # | Chantier | Statut | Dépendances / remarques |
|---|---|---|---|
| 1 | Sessions sécurité dédiées (voir détail ci-dessous) | À planifier, décidé par Zo | S2 (apostrophe) est le plus utile |
| 2 | Avant le lancement officiel : vider les données fictives d'Aiven, vérifier le compte Super Admin, traiter le bug de l'apostrophe, vérifier les sauvegardes | À faire | dépend du choix de la date de lancement |
| 3 | Tâche 7 — refonte design : dégradés violet/bleu avec grain, polices Inter + Space Grotesk + Instrument Serif, glassmorphism, dark mode, icônes Lucide à la place de Font Awesome, remplacement des icônes provisoires « DM », mise à jour du PRECACHE et de `VERSION` | Prochain chantier (documentation terminée avant) | gros chantier ; toucher à `service-worker.js` impose un nouveau `VERSION` |
| 4 | Cases de la checklist V2 jamais testées (section 13) | Sans urgence | |
| 5 | Durée du jeton JWT (8 h), durcissement des pièces d'identité, fichiers Cloudinary orphelins | Sans urgence | |
| 6 | Limite connue : visiteurs déjà enregistrés non affichés à la réouverture d'un programme pointé | Ouvert | |
| 7 | Rappel hebdomadaire pour garder Aiven actif ; piste d'amélioration à valider | Ouvert | |

**Détail des sessions sécurité** (aucune n'est commencée) :
- S1 : refuser `<` et `>` dans les champs texte côté serveur (`validerMembre`).
- S2 : bug des noms avec apostrophe dans les boutons de `membres.html`, `nouveaux-adherents.html`, `absences.html` (ne plus passer le nom dans le `onclick`).
- S3 : échappement des affichages de `membres`, `nouveaux-adherents`, `absences`, `dashboard`, `pointage` (réutiliser `echapper` de `visiteurs.html`).
- S4 : vérifier le mot de passe par défaut du Super Admin en production.
- S5 : pièces d'identité en URL publiques.
- S6 : limite de soumissions sur la route publique (pas encore étudiée).
- S7 : fichiers Cloudinary orphelins.
- Ajouts possibles, non décidés : transaction dans `valider`, exigences minimales côté serveur à la soumission, ne plus renvoyer `error.message` au client.

## 15. Journal des décisions

| Décision | Raison / alternatives |
|---|---|
| Un membre n'est jamais supprimé : archivage (`Inactif`) | Conserver l'historique |
| Visiteurs dans une table séparée ; seuil 3 par type de programme ; indicateur seulement | Pas d'adhésion automatique ; pas de cumul entre programmes |
| Conversion visiteur → membre en transaction, type choisi d'abord | Éviter un membre sans visiteur marqué |
| Téléphone : 9 chiffres en base, `+221` fixe à l'écran | Format unique ; listes non reformatées (valeur faible) |
| Pas de migration des anciens numéros (26/11/2026) | Données fictives ; au lancement, on vide plutôt que de migrer |
| Pointage : `findOrCreate` par (membre, programme) ; programmes `Planifie` de moins de 7 jours seulement | |
| JWT 8 h inchangé | Décision de Zo, à réévaluer plus tard |
| Photos et documents sur Cloudinary | Render ne conserve pas les fichiers |
| Aucune nouvelle phase après la tâche 6 sans l'accord de Zo | |
| Sécurité traitée en sessions dédiées, pas au fil de l'eau (26/11/2026) | Éviter de dériver du plan ; seuls F1 (filtre) et F2 (échappement de la validation) ont été faits |
| Fusion par PR avec « merge commit » (pas de squash) | Garder `develop` et `main` alignés |
| Atteindre Aiven par variables de session PowerShell | Ne jamais saisir ou montrer un secret |

**Pièges déjà rencontrés** [MÉM] : remplacement en masse (Ctrl + H) de lignes identiques, fatal 3 fois ; `require` en double après une édition par numéros de ligne ; fichier remis à zéro par des Ctrl + Z en chaîne ; commandes `node -e` trop longues coupées au collage (les garder sur une ligne ou utiliser un petit `.js` temporaire non commité) ; `Get-Content` sans `-Encoding UTF8` affiche « Ã© » (affichage seulement) ; VS Code peut convertir `'` en `"` ; les avertissements « LF will be replaced by CRLF » sont sans gravité ; un `git status` propre ne prouve pas qu'un Ctrl + S a été fait ; `git push` peut échouer avec « Could not resolve host » (le refaire) ; « must be a collaborator » = mauvais compte GitHub ; « Impossible de se connecter » = serveur non lancé ; ne jamais cocher « Bypass for network » hors ligne ; F5 et non Ctrl + F5 ; les « Could not establish connection » viennent d'une extension Zotero.

## 16. Conventions

- Langue : français partout (interface, messages, commentaires). Le code vu écrit les chaînes sans accents (`Nouveau Adherent`, `Confirme`, `Rejete`, `Planifie`) ; `labels.js` gère l'affichage accentué [VU].
- Nommage : tables et champs en `snake_case` français ; modèles en PascalCase (`InscriptionEnAttente`) ; contrôleurs avec des fonctions en français (`soumettre`, `valider`, `rejeter`) [VU].
- Git : travailler sur `develop`, **jamais** directement sur `main`. Messages de commit en français sans accents, préfixés par le sujet (`Tache 6 : …`, `Securite : …`, `Telephone : …`). **Toujours `git push` après un commit puis vérifier « up to date ».** Fusion `develop` → `main` par Pull Request GitHub (compte `commission2023-star`), seulement en fin de grande étape, car elle déclenche Render. Après la fusion : `git switch main`, `git pull`, `git switch develop`, `git merge main`, `git push`. Garder `develop`. Ne jamais utiliser `git add .` (risque d'ajouter `verifier_tables.js` ou `.env`).
- Édition des fichiers : remplacer le contenu entier d'un fichier court ou très modifié (Ctrl + A, coller) ; sinon Ctrl + G ligne par ligne **de bas en haut**, avec contrôle préalable des numéros par `Select-String` ; filet de sécurité : `git diff chemin\fichier`, `git restore chemin\fichier` (jamais sur un fichier contenant du travail non commité).
- Outil d'affichage à retaper dans chaque nouveau terminal :
    function Voir($f,$a,$b){ $i=0; Get-Content -Encoding UTF8 $f | ForEach-Object { $i++; if ($i -ge $a -and $i -le $b) { "{0,4}: {1}" -f $i, $_ } } }
- Versionnement : pas de numéro de version applicatif relevé ; `VERSION` du service worker à incrémenter quand un fichier pré-caché change.
- Documentation : à mettre à jour après chaque grande étape (voir section 17).

**Méthode de travail voulue par Zo (obligatoire)** : l'agent explique, Zo applique à la main, par lots d'étapes simples ; chaque étape a une explication ligne par ligne et une commande de vérification avec le résultat attendu ; ne jamais déclarer « fonctionne » ce qui n'a pas été testé ; dire ce qui n'a pas pu être vérifié ; reconnaître ses erreurs ; ne pas supposer le contenu d'un fichier (demander à Zo de l'afficher avant toute modification) ; commandes PowerShell Windows (pas de `curl -H`) ; ne jamais demander un mot de passe ou un secret ; vérifier chaque sauvegarde (Zo oublie parfois Ctrl + S) ; une réponse hésitante (« je crois ») ne vaut pas confirmation, « oui je confirme » oui ; écarter les chantiers à faible valeur ; ne rien élargir sans accord.

## 17. Documentation existante

| Document | État |
|---|---|
| `Documentation_Phases3_4_DMWM.docx` (documentation technique Phases 3 et 4) | Existe ; **partiellement obsolète** : datée « Mai 2025 » (date à vérifier), parle d'upload local (`uploads/`) alors que les fichiers sont sur Cloudinary, noms de rôles et routes d'avant la V2 ; elle indique encore la phase 5 « en cours » | [VU] |
| Cahier des charges V2, rapport final complet | Existent d'après la mémoire ; contenu non relu | [À CONFIRMER] |
| `README.md` | Réécrit le 26/11/2026 : installation, variables, rôles, 11 tables, matrice des routes, limites | [VU] |
| `docs/ARCHITECTURE.md` | Couches, flux métier, matrice réelle des droits, écarts menu/API | [VU] |
| `docs/API.md` | Toutes les routes : rôles, corps, réponses, erreurs | [VU] |
| `docs/CHANGELOG.md` | Historique consolidé et backlog | [VU] |
| `docs/EXPLOITATION.md` | Déploiement, supervision, sauvegardes, rotation des secrets, incidents | [VU] |
| `docs/BRIEFING_PROJET.md` (ce document) | Version 2, 26/11/2026 | |

## 18. Questions ouvertes (à faire confirmer par Zo)

1. Développement exact de DMWM, PF, CIPS, CTC, CL, et rôle précis de Agent H / Agent F.
2. ~~Matrice complète des droits par rôle pour programmes, pointage, absences, messages, réunions, comptes rendus, rapports, comptes utilisateurs.~~ Répondu : voir `docs/ARCHITECTURE.md` §11.
3. Le mot de passe par défaut du Super Admin a-t-il été changé en production ?
4. Quelles consoles et quels comptes (Render, Aiven, Cloudinary, cron-job.org, GitHub) sont accessibles à qui, et par qui sont-ils détenus ?
5. Version de Node visée (v24 ou v26.12.0 ?) et version de MySQL. La commande de démarrage (`node server.js`) et le moment d'exécution de `copier-libs.js` (`postinstall`) sont connus.
6. Sauvegardes de la base (Aiven) : existent-elles, comment restaurer ?
7. Politique de conservation et de consentement pour les données personnelles (pièces d'identité, photos, tuteurs).
8. Que contient la production à vider avant le lancement ? Date de lancement officiel ?
9. Quel est le prochain chantier choisi : sécurité, tâche 7 (design), checklist V2 ?
10. Le « Format On Save » de VS Code est-il désactivé pour ce dossier ? (Zo n'a jamais confirmé.)
11. ~~Une page appelle-t-elle `PUT /api/inscriptions/:id/modifier` ?~~ Répondu : aucune (vérifié le 26/11/2026).

## 19. TOP 10 à savoir immédiatement

1. **Ne jamais travailler ni pousser sur `main`.** Tout se fait sur `develop` ; la PR vers `main` déclenche Render, uniquement en fin de grande étape.
2. **Aucune migration** : `node sync.js` ne crée que les tables manquantes. Modifier une colonne existante demande une action manuelle sur chaque base (locale et Aiven).
3. **`node sync.js` vise la base du `.env` (le local).** Pour Aiven : variables de session PowerShell, contrôle `Hote local ? false`, terminal fermé ensuite. TablePlus est branché sur la production.
4. **Jamais de secret dans une conversation ni un fichier.** Un mot de passe Aiven a déjà fuité le 26/11/2026 (changé depuis).
5. **Un membre n'est jamais supprimé** : archivage `Inactif`.
6. **Téléphone : 9 chiffres en base** ; la règle est dans `utils/telephone.js` et doit rester identique partout.
7. **La route `POST /api/inscriptions/soumettre` est publique.** Elle ne garde que 22 champs (`utils/champsInscription.js`) ; le serveur n'y vérifie pas les champs obligatoires ni les doublons.
8. **XSS et apostrophes** : seules 3 pages échappent leurs données ; le reste de l'interface insère prénoms et noms dans `innerHTML` sans échappement, et les noms avec apostrophe cassent des boutons.
9. **Service worker** : toute modification d'un fichier pré-caché exige un nouveau `VERSION` ; `cache.addAll` est tout ou rien ; `/api/` et `/uploads/` ne sont jamais interceptés.
10. **Zo veut la méthode pas à pas** (explication, test, résultat attendu), sans rien supposer des fichiers, et **rien ne démarre sans son accord**.

## 20. PROMPT DE DÉMARRAGE (texte à donner à l'agent suivant)

Tu reprends la gestion technique du projet DMWM — Conseil UASZ (application web d'administration : membres, inscriptions publiques avec validation par la CA, programmes, pointage hors ligne, absences, visiteurs, messages CA, réunions, rapports). Lis d'abord `docs/BRIEFING_PROJET.md` en entier. Le briefing a été écrit sans accès au code : toute ligne [MÉM] ou [À CONFIRMER] doit être vérifiée dans le dépôt avant d'être utilisée.

Contexte : Node.js + Express, MySQL (Sequelize), JWT + bcryptjs, Multer + Cloudinary, frontend HTML statique + PWA. Production : Render (branche `main`) + Aiven MySQL + Cloudinary. Dépôt : `commission2023-star/DMWM_APP`. État : `develop` = `410a892`, tâche 6 terminée et testée en production le 26/11/2026 ; documentation réécrite (README + `docs/`) ; prochain chantier : tâche 7 (refonte design). Les données déployées sont fictives.

Ta première action : demande à Zo `git status`, `git log --oneline -3`, puis vérifie dans le code les points de la section 18. Ne code rien avant. Ne démarre aucun chantier sans l'accord explicite de Zo ; propose-lui le choix entre sessions sécurité, tâche 7 (refonte design) et checklist V2.

Règles : travaille sur `develop`, jamais sur `main` ; ne demande ni ne montre jamais un mot de passe ou un secret ; commandes PowerShell Windows ; explique chaque étape ligne par ligne avec une commande de vérification et le résultat attendu ; ne déclare jamais « fonctionne » ce qui n'est pas testé ; demande l'affichage d'un fichier (outil `Voir`) avant de le modifier ; n'utilise jamais `git add .` ; vérifie qu'un Ctrl + S a bien été fait.