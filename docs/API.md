# API — DMWM Conseil UASZ

Référence des routes HTTP. Vérifiée dans `routes/` et `controllers/` le 26/11/2026.

## Conventions

- Base : même origine que l'application (`http://localhost:3000` ou
  `https://dmwm-uasz.onrender.com`).
- Préfixe : `/api`.
- Authentification : en-tête `Authorization: Bearer <token>`, jeton JWT valable 8 h.
- Corps JSON par défaut. Les routes qui reçoivent des fichiers attendent
  `multipart/form-data`.
- Erreur type : `{ "message": "..." }`, avec `erreur` (message interne) en plus sur
  les réponses `500`.
- Codes utilisés : `200`, `201`, `400`, `401`, `403`, `404`, `500`, `503`.
- Aucune pagination : les listes renvoient tous les enregistrements.

Notation des rôles : `SA` = Super Admin, `CA` = Admin CA, `H/F` = Agent H et Agent F.

## Authentification

| Méthode | Route | Accès | Corps | Réponse |
|---|---|---|---|---|
| POST | `/api/auth/login` | Public | `{ identifiant, mot_de_passe }` | `{ message, token, utilisateur: { id, nom, identifiant, role } }` |
| GET | `/api/auth/me` | Connecté | — | Utilisateur sans `mot_de_passe` |
| PUT | `/api/auth/changer-mot-de-passe` | Connecté | `{ ancien_mot_de_passe, nouveau_mot_de_passe }` | `{ message }` |

Aucune règle de complexité n'est imposée au nouveau mot de passe ; un ancien mot de
passe faux renvoie `401`.

Erreurs de connexion :

| Cas | Code |
|---|---|
| Champ manquant | 400 |
| Identifiant inconnu ou mot de passe faux | 401 |
| Compte désactivé (`actif = false`) | 403 |

## Comptes utilisateurs

Réservé au Super Admin.

| Méthode | Route | Corps | Réponse |
|---|---|---|---|
| GET | `/api/utilisateurs` | — | Liste sans `mot_de_passe` |
| POST | `/api/utilisateurs` | `{ nom, identifiant, mot_de_passe, role }` | `{ message, utilisateur }` |
| PUT | `/api/utilisateurs/:id` | `{ nom, role }` | `{ message }` |
| PATCH | `/api/utilisateurs/:id/toggle` | — | `{ message }` (active/désactive) |

`role` accepte : `Super Admin`, `Admin CA`, `Agent H`, `Agent F`, `PF`, `CIPS`,
`CTC`, `CL`. Un identifiant déjà pris renvoie `400`.

## Membres

| Méthode | Route | Accès | Paramètres / corps |
|---|---|---|---|
| GET | `/api/membres/stats` | Connecté (sans contrôle de rôle) | — |
| GET | `/api/membres` | SA, CA, PF | `statut`, `sexe`, `commission`, `categorie`, `q` |
| GET | `/api/membres/:id` | SA, CA, PF | — |
| POST | `/api/membres` | SA, CA | `multipart` |
| PUT | `/api/membres/:id` | SA, CA | `multipart` |
| PATCH | `/api/membres/:id/statut` | SA, CA | `{ statut }` |
| PATCH | `/api/membres/:id/archiver` | SA, CA | — |

`GET /api/membres/stats` renvoie
`{ total, nouveaux, hommes, femmes, inactifs, absents: 0, enAttente: 0 }`.
`total`, `hommes` et `femmes` excluent les `Inactif`. Les deux derniers champs sont
toujours à `0` (valeurs figées dans le contrôleur).

Corps d'un membre : tous les champs du modèle `Membre`
(`prenom`, `nom`, `sexe`, `date_naissance`, `lieu_naissance`, `adresse`, `telephone`,
`email`, `photo_profil`, `document_identite`, `tuteur_nom`, `tuteur_telephone`,
`filiere`, `niveau`, `region_origine`, `departement`, `arrondissement`, `commune`,
`comite_origine`, `conseil_origine`, `section_base`, `pf_nom`, `pf_telephone`,
`poste_section_base`, `categorie`, `commission`, `date_adhesion`, `statut`, `notes`).

Fichiers acceptés : `photo_profil` et `document_identite` (JPG, PNG, PDF, 5 Mo max).

Règles :

- `telephone`, `tuteur_telephone` et `pf_telephone` sont normalisés en 9 chiffres.
  Un numéro invalide renvoie `400`.
- Un téléphone déjà utilisé renvoie `400` (comparaison sur `n`, `221n`, `+221n`).
- `POST` accepte un champ `visiteur_id` : le membre est créé et le visiteur passe à
  `Devenu membre` dans une transaction.
- `PATCH /statut` accepte `Nouveau`, `Confirme` ou `Inactif` ; une autre valeur
  provoque une erreur Sequelize (`500`).
- Aucune route ne supprime un membre.

## Inscriptions

| Méthode | Route | Accès | Corps |
|---|---|---|---|
| POST | `/api/inscriptions/soumettre` | **Public** | `multipart` |
| GET | `/api/inscriptions/stats` | Connecté (sans contrôle de rôle) | — |
| GET | `/api/inscriptions` | SA, CA | `statut`, `type_formulaire` |
| GET | `/api/inscriptions/:id` | SA, CA | — |
| PATCH | `/api/inscriptions/:id/valider` | SA, CA | — |
| PATCH | `/api/inscriptions/:id/rejeter` | SA, CA | `{ motif_rejet }` |
| PUT | `/api/inscriptions/:id/modifier` | SA, CA | `{ donnees }` |

Soumission publique :

- `type_formulaire` obligatoire : `Nouveau Bachelier`, `Nouveau Adherent` ou `Ancien`.
- 22 champs acceptés au maximum (liste blanche `utils/champsInscription.js`) ;
  tout autre champ est ignoré.
- Fichiers facultatifs : `photo_profil`, `document_identite` (5 Mo max).
- Réponse `201` : `{ message, id }`.
- Le serveur ne vérifie pas les champs obligatoires du formulaire (prénom, nom,
  sexe) ni le doublon de téléphone à ce stade.

Traitement :

- `stats` renvoie `{ enAttente, valides, rejetes, total }`.
- `valider` crée le membre (`categorie = type_formulaire`,
  `statut = Confirme` si `Ancien`, sinon `Nouveau`), puis passe le dossier à `Valide`.
  Un dossier déjà traité renvoie `400`. Un téléphone en doublon renvoie `400`.
- `rejeter` exige un motif non vide.
- `modifier` remplace `donnees` en entier ; aucune page ne l'appelle.

## Programmes

| Méthode | Route | Accès | Paramètres / corps |
|---|---|---|---|
| GET | `/api/programmes/prochain` | Connecté (sans contrôle de rôle) | — |
| GET | `/api/programmes` | Les 8 rôles | `statut`, `type`, `mois` (`AAAA-MM`) |
| GET | `/api/programmes/:id` | Les 8 rôles | — |
| POST | `/api/programmes` | SA, CA | Voir ci-dessous |
| PUT | `/api/programmes/:id` | SA, CA | Champs partiels |
| PATCH | `/api/programmes/:id/statut` | SA, CA | `{ statut }` |
| DELETE | `/api/programmes/:id` | SA, CA | — |

Corps de création : `{ type, nom?, date, heure_debut?, heure_fin?, lieu?, oustaze?, theme?, statut? }`.

- `type` : `Goudy Aldiouma`, `Xadara`, `Enseignement`, `Autre`.
- `date` obligatoire.
- `statut` par défaut `Planifie` ; valeurs `Planifie`, `Tenu`, `Annule`.
- Chaque `GET /` et `GET /prochain` crée les programmes récurrents de la semaine
  (mardi, jeudi, samedi) s'ils manquent.
- `DELETE` renvoie `400` pour un programme `recurrent: true`.

## Pointage

| Méthode | Route | Accès | Paramètres / corps |
|---|---|---|---|
| GET | `/api/pointage/membres` | SA, CA, H/F | `programme_id` (obligatoire), `sexe` |
| POST | `/api/pointage/enregistrer` | SA, CA, H/F | Voir ci-dessous |
| GET | `/api/pointage/stats/:programme_id` | SA, CA, PF | — |
| GET | `/api/pointage/historique/:membre_id` | SA, CA, PF | — |
| GET | `/api/pointage/absents-recurrents` | SA, CA, PF | — |

`GET /membres` renvoie les membres non `Inactif` avec leur `presence`
(`Present`, `Absent` ou `null`).

Corps d'enregistrement :

```json
{
  "programme_id": 12,
  "pointages": [
    { "membre_id": 3, "statut": "Present" },
    { "membre_id": 4, "statut": "Absent" }
  ],
  "visiteurs": [
    { "prenom": "Awa", "nom": "Ba", "telephone": "771234567" }
  ]
}
```

- `statut` d'une présence : `Present` ou `Absent`.
- Un couple (membre, programme) est unique : la seconde saisie met à jour.
- Un visiteur est identifié par son téléphone normalisé ; un couple
  (visiteur, programme) est unique.
- Un visiteur sans prénom, nom ou téléphone valide est ignoré et compté dans
  `visiteurs_ignores`.
- Le programme passe à `Tenu`.
- Réponse : `{ message, total, visiteurs_enregistres, visiteurs_ignores }`.

`stats/:id` renvoie `{ presents, absents, total, taux }`.

`absents-recurrents` examine les 5 derniers programmes `Tenu` et renvoie les membres
avec au moins 2 absences consécutives en remontant depuis le plus récent (l'absence
d'enregistrement compte comme une absence), triés par nombre décroissant.

## Visiteurs

| Méthode | Route | Accès | Paramètres / corps |
|---|---|---|---|
| GET | `/api/visiteurs` | SA, CA, PF | `programme`, `statut`, `min`, `potentiels=true` |
| GET | `/api/visiteurs/:id/historique` | SA, CA, PF | — |
| PUT | `/api/visiteurs/seuil` | SA, CA | `{ seuil }` (1 à 50) |
| PATCH | `/api/visiteurs/:id/statut` | SA, CA | `{ statut }` |

`GET /` renvoie `{ seuil, programmes, visiteurs }`. Chaque visiteur porte
`total_visites`, `participations`, `meilleur`, `potentiel`, `statut_suivi`.

- `programme` filtre sur la clé d'un type (`Enseignement`, `Xadara`,
  `Autre:<nom en minuscules>`).
- `statut` : `A contacter`, `Contacte`, `Devenu membre`.
- `min` : nombre minimum de participations.
- `potentiels=true` : seulement les visiteurs ayant atteint le seuil.

`PATCH /statut` n'accepte que `A contacter` ou `Contacte`. Un visiteur déjà
`Devenu membre` renvoie `400`.

## Messages à la CA

| Méthode | Route | Accès | Paramètres / corps |
|---|---|---|---|
| GET | `/api/messages/stats` | SA, CA | — |
| GET | `/api/messages/mes-messages` | Connecté (sans contrôle de rôle) | — |
| GET | `/api/messages` | SA, CA, PF | `statut`, `commission` |
| GET | `/api/messages/:id` | SA, CA, PF | — |
| POST | `/api/messages` | SA, CA, PF, CIPS, CTC, CL | `multipart` |
| PATCH | `/api/messages/:id/statut` | SA, CA | `{ statut }` |

- Envoi : `objet` obligatoire, `contenu` facultatif, fichier `fichier_joint`
  (10 Mo max ; JPG, PNG, PDF, DOC, DOCX, XLS, XLSX).
- `commission` est remplie automatiquement avec le rôle de l'expéditeur.
- Statuts : `En attente`, `Traite`.
- `stats` renvoie `{ enAttente, traites, total }`.
- `PATCH /statut` ne valide pas la valeur reçue.

## Réunions et comptes rendus

| Méthode | Route | Accès | Corps |
|---|---|---|---|
| GET | `/api/reunions` | SA, CA, PF, CIPS, CTC, CL | — |
| GET | `/api/reunions/:id` | SA, CA, PF, CIPS, CTC, CL | — |
| POST | `/api/reunions` | SA, CA | `{ date, heure_debut?, heure_fin?, lieu?, ordre_du_jour? }` |
| PUT | `/api/reunions/:id` | SA, CA | Champs partiels |
| POST | `/api/reunions/:id/comptes-rendus` | SA, CA, PF, CIPS, CTC, CL | `multipart` |
| DELETE | `/api/reunions/:id/comptes-rendus/:cr_id` | SA, CA | — |

- `date` obligatoire à la création.
- Compte rendu : `contenu` et/ou fichier `fichier` (PDF, DOC, DOCX, 10 Mo max).
  Sans les deux, `400`.
- `commission` du compte rendu = rôle de l'auteur.
- La liste des réunions inclut le nombre de comptes rendus et le nom du créateur.

## Rapports

| Méthode | Route | Accès | Paramètres |
|---|---|---|---|
| GET | `/api/rapports/statistiques` | SA, CA, PF | `mois` (`AAAA-MM`) |
| GET | `/api/rapports/pdf` | SA, CA, PF | `mois`, `type_programme`, `sexe`, `commission` |
| GET | `/api/rapports/excel` | SA, CA, PF | idem |

- `statistiques` renvoie `tauxParProgramme`, `repartitionType`, `classement` (10),
  `comparaisonHF`, `evolutionNouveaux` (6 mois).
- `pdf` et `excel` renvoient un fichier en pièce jointe
  (`Content-Disposition: attachment`).

## Santé

| Méthode | Route | Accès | Réponse |
|---|---|---|---|
| GET | `/api/health` | Public | `200 { status: "ok" }` ou `503 { status: "erreur", message }` |

Teste le serveur **et** la base (`SELECT 1`).

## Points de vigilance

1. Quatre routes ne vérifient pas le rôle : `/api/membres/stats`,
   `/api/inscriptions/stats`, `/api/programmes/prochain`,
   `/api/messages/mes-messages`.
2. Aucune limitation du nombre de requêtes, en particulier sur
   `POST /api/inscriptions/soumettre`.
3. Les erreurs `500` renvoient le message interne (`erreur: error.message`).
4. Les listes ne sont pas paginées.
5. `PATCH /api/membres/:id/statut` et `PATCH /api/messages/:id/statut` ne valident
   pas la valeur reçue avant l'écriture.
