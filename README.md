# Royal Palace Antsirabe — API

API du site de l'hôtel Royal Palace Antsirabe : contenu éditorial, réservations,
formulaires de contact, newsletter et back-office d'administration.

- **Runtime** : Node.js 18+ / TypeScript
- **Framework** : Express 4
- **Base de données** : MySQL 8 (via `mysql2/promise`)
- **Validation** : Zod
- **Authentification** : JWT + bcrypt
- **E-mails** : SMTP Gmail via Nodemailer (optionnel)

---

## Démarrage rapide

```bash
npm install
cp .env.example .env     # puis ajuste DATABASE_URL
npm run db:setup         # crée le schéma + insère le contenu de départ
npm run create-admin -- admin@royalpalaceantsirabe.com tonMotDePasse admin
npm run dev              # http://localhost:4000
```

Vérification : `curl http://localhost:4000/health`

### Configurer `DATABASE_URL`

Le format est `mysql://utilisateur:motdepasse@hote:port/base`.

| Installation | Valeur |
| --- | --- |
| Laragon / XAMPP (root sans mot de passe) | `mysql://root:@127.0.0.1:3306/royal_palace` |
| Docker Compose (`docker compose up -d`) | `mysql://royal:royal@127.0.0.1:3306/royal_palace` |

Si la connexion échoue, l'API s'arrête immédiatement avec un message explicite
plutôt que de renvoyer une erreur 500 sur chaque requête.

---

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement (redémarrage automatique) |
| `npm run build` | Compile TypeScript vers `dist/` |
| `npm start` | Lance le serveur compilé |
| `npm run typecheck` | Vérifie les types sans générer de fichiers |
| `npm run test:api` | Test global de l'API (voir ci-dessous) |
| `npm run db:setup` | `db:init` + `db:migrate:admin-content` + `db:seed` |
| `npm run db:init` | Crée la base et les tables (`db/schema.sql`) |
| `npm run db:seed` | Insère le contenu de départ, sans écraser les modifications d'id existants |
| `npm run db:migrate:admin-content` | Ajoute les colonnes éditables aux bases créées avant leur introduction |
| `npm run db:reset` | ⚠️ Supprime toutes les tables, puis recrée et réinsère |
| `npm run create-admin` | Crée (ou réinitialise) un compte d'administration |

`create-admin` accepte des arguments pour un usage non interactif :

```bash
npm run create-admin -- email@domaine.com motdepasse admin
```

Relancer la commande avec une adresse existante réinitialise son mot de passe.

---

## Test global de l'API

`tests/api.test.ts` interroge l'API en HTTP, comme le ferait le front, et
vérifie 221 points : contenu public, disponibilité, réservations (dont
surréservation et concurrence), contact, devis, newsletter, authentification,
rôles, protection du back-office, CRUD complet (chambres, carte, salles, spa,
galerie, Découvrir), envoi d'images, tableau de bord, pagination, recherche,
tri, exports CSV, gestion des comptes, révocation des jetons et journal des
actions.

```bash
npm run dev        # terminal 1
npm run test:api   # terminal 2
```

| Option | Rôle |
| --- | --- |
| `--base=http://host:port/api` | Vise une autre API (défaut : `$API_URL`) |
| `--email=` / `--password=` | Identifiants admin (défaut : `$TEST_ADMIN_EMAIL` / `$TEST_ADMIN_PASSWORD`) |
| `--verbose` | Affiche les réponses complètes des vérifications en échec |
| `--keep` | Conserve les données créées par le test |

Le script sort en code 1 au moindre échec, ce qui permet de le brancher sur une
intégration continue.

**Il nettoie derrière lui.** Chaque exécution utilise un identifiant unique ;
les chambres, sections, plats et salles créés sont supprimés via l'API, et les
réservations, messages et inscriptions — qui n'ont pas d'endpoint de suppression
— le sont en SQL via `DATABASE_URL`. La base revient à son état initial.

**Il est rejouable.** Les assertions portent sur la forme des réponses, pas sur
le nombre de lignes : ajouter des chambres depuis le back-office ne le fait pas
échouer.

**Limite de débit.** La suite consomme une bonne partie du quota d'écriture
(30 requêtes / 15 min). Pour l'enchaîner plusieurs fois :

```bash
DISABLE_RATE_LIMIT=true npm run dev
```

Ce réglage est **ignoré quand `NODE_ENV=production`**. Redémarrer l'API remet
également le compteur à zéro. Si des `429` surviennent, le script le signale
explicitement en fin de rapport plutôt que de laisser croire à une régression.

---

## Variables d'environnement

| Variable | Obligatoire | Rôle |
| --- | --- | --- |
| `DATABASE_URL` | oui | Connexion MySQL |
| `JWT_SECRET` | en production | Signature des jetons. En développement, une valeur de repli est utilisée. |
| `JWT_EXPIRES_IN` | non | Durée de validité du jeton (défaut `7d`) |
| `ADMIN_INVITE_CODE` | non | Vide ⇒ `POST /api/auth/register` est désactivé |
| `GMAIL_USER` | non | Boîte Gmail de l'hôtel. Vide ⇒ les e-mails sont ignorés sans faire échouer la requête |
| `GMAIL_APP_PASSWORD` | non | Mot de passe d'application à 16 caractères, pas celui du compte |
| `FROM_NAME` | non | Nom affiché comme expéditeur (défaut `Royal Palace Antsirabe`) |
| `HOTEL_EMAIL` | non | Destinataire des notifications (défaut `royalpalace.resa@moov.mg`) |
| `DEEPL_API_KEY` | non | Traduction FR → EN du back-office. Vide ⇒ les champs « (EN) » se remplissent à la main |
| `DEEPL_TARGET_LANG` | non | Variante d'anglais produite : `EN-GB` (défaut) ou `EN-US` |
| `PORT` | non | Défaut `4000` |
| `NODE_ENV` | non | `development` ou `production` |
| `CORS_ORIGIN` | en production | Origines autorisées, séparées par des virgules |
| `DISABLE_RATE_LIMIT` | non | `true` désactive les limites de débit. Ignoré en production. |

En développement, `localhost:5173`, `:3000` et `:3002` sont toujours autorisés.
En production, **seule** la liste `CORS_ORIGIN` l'est : si elle est vide, toutes
les requêtes cross-origin sont refusées.

---

## Endpoints

Toutes les réponses sont du JSON. Les données utiles sont dans `data`, les
erreurs dans `error` (avec `details` pour les erreurs de validation).

### Public

| Méthode | Chemin | Rôle |
| --- | --- | --- |
| `GET` | `/health` | État du serveur |
| `GET` | `/api/content/rooms` | Chambres, avec images et équipements |
| `GET` | `/api/content/menu` | Carte du restaurant (sections + plats) |
| `GET` | `/api/content/spa` | Soins du spa |
| `GET` | `/api/content/events` | Salles de réunion |
| `GET` | `/api/content/gallery` | Images de la galerie, avec leur catégorie |
| `GET` | `/api/content/discover` | `{ activities, attractions }` de la page Découvrir |
| `GET` | `/api/restaurant/menu` | Identique à `/api/content/menu` |
| `GET` | `/api/content/availability` | Calendrier : unités libres par nuit, `from` / `to` |
| `POST` | `/api/bookings/availability` | Disponibilité sur une période |
| `POST` | `/api/bookings` | Création d'une réservation |
| `POST` | `/api/contact` | Message de contact |
| `POST` | `/api/contact/event-inquiry` | Demande de devis événement |
| `POST` | `/api/newsletter` | Inscription à la newsletter |

Les endpoints en écriture sont limités à 30 requêtes / 15 min par adresse IP.

**Disponibilité** — `roomId` est facultatif ; sans lui, le calcul porte sur
l'ensemble de l'hôtel. `adults` / `children` sont facultatifs mais utiles :
renseignés, ils écartent les catégories trop petites, pour que la recherche
réponde comme la réservation répondra.

```json
{ "checkIn": "2026-12-01", "checkOut": "2026-12-05", "rooms": 1, "roomId": "suite" }
```

La réponse détaille ce qui occupe la période, pour pouvoir l'expliquer au
visiteur plutôt que de répondre un simple « non » :

```json
{
  "available": true, "availableRooms": 2, "requestedRooms": 1,
  "totalRooms": 4, "bookedRooms": 1, "blockedRooms": 1,
  "fitsParty": true, "maxGuests": 4
}
```

**Calendrier** — `GET /api/content/availability?from=2026-12-01&to=2026-12-08`
renvoie, pour chaque catégorie, les unités encore vendables **nuit par nuit**.
`to` est exclusive, la fenêtre est plafonnée à 120 jours. Un seul appel suffit
donc à afficher toutes les chambres, là où il fallait auparavant une requête par
chambre.

```json
{ "data": [ { "roomId": "suite", "slug": "suite-royale", "totalUnits": 4,
  "days": [ { "date": "2026-12-01", "free": 2 }, { "date": "2026-12-02", "free": 4 } ] } ] }
```

Le calendrier public ne dit **que** le reste à vendre : ni qui a réservé, ni
pourquoi une unité est bloquée. Le détail (`booked`, `blocked`) reste au
back-office.

**Réservation** — `roomId` est facultatif : s'il est absent, la chambre la moins
chère pouvant accueillir le groupe et disponible sur la période est attribuée.
`children` vaut `0` par défaut.

Bornes appliquées à la création (la *consultation* de disponibilité, elle,
reste ouverte sur n'importe quelle période, y compris passée) :

| Règle | Réponse si enfreinte |
| --- | --- |
| Arrivée dans le passé | `400` |
| Séjour de plus de 90 nuits | `400` |
| Plus de 10 chambres, ou plus de 40 voyageurs | `400` |
| Groupe dépassant la capacité de la chambre choisie | `400` |
| Plus d'unités demandées que disponibles | `409` |

```json
{
  "guestName": "Jean Dupont",
  "guestEmail": "jean@example.com",
  "guestPhone": "+261 34 49 040 40",
  "checkIn": "2026-12-01",
  "checkOut": "2026-12-05",
  "rooms": 1,
  "adults": 2,
  "children": 0,
  "roomId": "suite"
}
```

Le contrôle de disponibilité et l'insertion se font dans une transaction avec
verrou (`SELECT … FOR UPDATE`) : deux réservations simultanées ne peuvent pas
dépasser le nombre d'unités disponibles. En cas de dépassement, l'API répond
`409`.

### Comment la disponibilité est calculée

Deux choses occupent une unité : une **réservation active** (`pending` ou
`confirmed` — une annulation rend ses nuits) et un **blocage** (`room_blocks` :
travaux, fermeture, réservation reçue hors du site). Les bornes de fin sont
toujours **exclusives** : un séjour du 12 au 15 occupe les nuits du 12, 13 et 14,
et laisse le 15 libre pour l'arrivée suivante.

Tout se calcule **nuit par nuit**, jamais en cumulant les réservations d'une
période — c'est la seule façon d'obtenir la bonne réponse. Dans une catégorie de
2 unités où une réservation occupe la nuit du 12 et une autre celle du 13, un
cumul sur le séjour du 12 au 14 conclurait « 0 disponible », alors qu'une unité
est libre chacune des deux nuits : on refuserait une réservation parfaitement
possible. La disponibilité d'un séjour est donc celle de **sa pire nuit**.

Le calendrier affiché et le contrôle fait à la réservation partagent le même
calcul ([`src/modules/bookings/availability.ts`](src/modules/bookings/availability.ts)) :
ce qui est annoncé libre à l'écran est exactement ce qui sera accepté.

Côté hôtel entier, le reste à vendre est plafonné catégorie par catégorie avant
d'être additionné : sans cela, une catégorie bloquée au-delà de son stock
viendrait masquer les unités libres d'une autre.

**Périodes bloquées.** `room_blocks` ferme des unités sans créer de réservation
nominative : travaux, fermeture saisonnière, ou allotement. Elles sont décomptées
par le même calcul, donc elles ferment le site public en même temps qu'elles
noircissent le tableau du back-office. Bloquer plus d'unités que la catégorie
n'en compte est refusé en `400`.

**Réservations saisies au back-office.** `POST /api/admin/bookings` enregistre un
appel téléphonique ou une réservation au comptoir. Elle passe par le même service
que le site public — donc par le même verrou anti-survente — avec trois
différences : le statut vaut `confirmed` par défaut, l'adresse e-mail est
facultative (on n'a pas toujours celle d'un client au téléphone), et **aucun
e-mail n'est envoyé**. La colonne `bookings.source` distingue ensuite `website`
de `admin` dans la liste du back-office.

### Authentification

| Méthode | Chemin | Rôle |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Connexion ⇒ `{ token, user }` |
| `POST` | `/api/auth/register` | Création de compte, exige `adminInviteCode` |
| `GET` | `/api/auth/me` | Compte courant (jeton requis) |

Limite : 10 tentatives / 15 min par IP.

### Administration — `Authorization: Bearer <token>` obligatoire

| Ressource | Endpoints |
| --- | --- |
| Tableau de bord | `GET /api/admin/stats` |
| Images | `POST /api/admin/uploads` · `DELETE /api/admin/uploads/:fichier` |
| Traduction | `GET /api/admin/translate` (disponibilité) · `POST /api/admin/translate` |
| Disponibilité | `GET /api/admin/availability?from=&to=` |
| Périodes bloquées | `GET POST /api/admin/room-blocks` · `PUT DELETE /api/admin/room-blocks/:id` |
| Chambres | `GET POST /api/admin/rooms` · `GET PUT DELETE /api/admin/rooms/:id` |
| Sections de carte | `GET POST /api/admin/menu/sections` · `PUT DELETE /api/admin/menu/sections/:id` |
| Plats | `GET POST /api/admin/menu/items` · `PUT DELETE /api/admin/menu/items/:id` |
| Salles de réunion | `GET POST /api/admin/event-rooms` · `PUT DELETE /api/admin/event-rooms/:id` |
| Soins du spa | `GET POST /api/admin/spa` · `PUT DELETE /api/admin/spa/:id` |
| Galerie photo | `GET POST /api/admin/gallery` (filtre `category`) · `PUT DELETE /api/admin/gallery/:id` |
| Page Découvrir | `GET POST /api/admin/discover` (filtre `type`) · `PUT DELETE /api/admin/discover/:id` |
| Réservations | `GET POST /api/admin/bookings` · `GET /api/admin/bookings/:id` · `PATCH /api/admin/bookings/:id` · `GET /api/admin/bookings/export` |
| Messages | `GET /api/admin/contact-messages` · `GET`/`PATCH`/`DELETE` `/:id` · `GET /api/admin/contact-messages/export` |
| Abonnés | `GET /api/admin/subscribers` · `DELETE /api/admin/subscribers/:id` · `GET /api/admin/subscribers/export` |
| Mon compte | `PUT /api/admin/account/password` |
| Comptes † | `GET POST /api/admin/users` · `PUT DELETE /api/admin/users/:id` |
| Journal † | `GET /api/admin/audit-log` (filtres `entity`, `action`, `limit`) |

† réservé au rôle `admin` ; le rôle `staff` reçoit un `403`.

**Listes paginées.** `bookings`, `contact-messages` et `subscribers` acceptent
`page`, `perPage` (max 200), `q` (recherche plein texte) et, pour les
réservations, `sort` (`createdAt`, `checkIn`, `checkOut`, `guestName`, `status`)
et `order`. La réponse ajoute `meta` à côté de `data` :

```json
{ "data": [...], "meta": { "page": 1, "perPage": 25, "total": 132, "totalPages": 6 } }
```

**Exports CSV.** Les endpoints `/export` renvoient un fichier avec BOM UTF-8
(sans quoi Excel sous Windows abîme les accents) et neutralisent les cellules
commençant par `= + - @`, qu'Excel interpréterait comme des formules — les noms
et messages viennent de visiteurs du site. Ils respectent les filtres courants.

**Images.** Le back-office n'accepte pas d'URL : on joint un fichier. Le champ
envoie l'image en `multipart/form-data` (champ `files`, jusqu'à 12 à la fois) et
reçoit en retour un chemin **relatif** `/uploads/<fichier>`, qui est ce qui est
stocké en base — la base reste donc valable si le domaine de l'API change. Le
front résout ce chemin contre l'origine de l'API (`resolveImageUrl`), tandis que
les images livrées avec le site (`/images/...`) continuent d'être servies par le
front.

Formats acceptés : JPEG, PNG, WebP, AVIF, GIF ; 5 Mo par fichier. Le nom est
entièrement régénéré et son extension déduite du type MIME, jamais du nom
envoyé : un fichier « piege.php.jpg » est écrit en « <id>.jpg ». Les fichiers
sont servis avec `X-Content-Type-Options: nosniff`, et avec
`Cross-Origin-Resource-Policy: cross-origin` pour ce seul dossier — sans quoi le
réglage par défaut de `helmet` empêcherait le front de les afficher.

Ils sont écrits dans `Royal-Backend/uploads/`, hors de Git. **En production,
prévois un volume persistant pour ce dossier** : sur un hébergement au système
de fichiers éphémère (Heroku, conteneur sans volume), les images disparaîtraient
à chaque redéploiement. Remplacer une image ne supprime pas l'ancienne : le
ménage se fait avec `DELETE /api/admin/uploads/:fichier`.

**Traduction FR → EN.** Le back-office propose la version anglaise des champs de
contenu au fur et à mesure de la saisie : dès qu'on quitte un champ français, son
jumeau « (EN) » se remplit **s'il est encore vide**, et un bouton « Retraduire »
permet de forcer un remplacement après une correction du français. La proposition
arrive dans un champ ordinaire : elle est modifiable, et c'est bien la valeur
affichée à l'écran qui est enregistrée. Rien n'est traduit à l'insertion en base.

```http
POST /api/admin/translate      { "texts": ["Chambre avec vue sur le jardin"] }
→ { "data": { "translations": ["Room with garden view"] } }
```

Dix textes au plus par appel. Le service est **facultatif** : sans
`DEEPL_API_KEY`, `GET /api/admin/translate` renvoie `{ enabled: false }`, le
back-office n'affiche aucune proposition et les champs anglais se remplissent à
la main — exactement comme avant. La clé ne quitte jamais le serveur : le
navigateur n'appelle pas DeepL lui-même.

Les traductions déjà obtenues sont gardées en mémoire (500 textes). Le
back-office traduit à chaque sortie de champ : sans ce cache, revenir sur une
description pour corriger une virgule referait un appel facturé au quota mensuel
pour un texte déjà traduit. Le cache est vidé au redémarrage de l'API.

**Comptes et sécurité.** Un compte désactivé est refusé dès sa requête suivante
(et non à l'expiration de son jeton) : chaque requête d'administration revérifie
son état et son rôle en base. On ne peut ni modifier son propre rôle, ni
désactiver son propre compte, ni retirer le dernier administrateur actif. Toute
création, modification, suppression, connexion et export est consignée dans
`admin_audit_log`.

Un **changement de mot de passe révoque les jetons déjà émis** : le compte porte
un compteur `token_version`, incrémenté à chaque changement et inscrit dans le
jeton. Un jeton volé cesse donc d'être valable dès que le mot de passe est
changé — et une réinitialisation faite par un administrateur déconnecte la
personne concernée. `PUT /api/admin/account/password` renvoie un jeton neuf,
pour que la session qui vient de faire le changement ne soit pas coupée.

> Un compteur plutôt qu'un horodatage : `iat` n'a qu'une précision d'une
> seconde, donc un jeton émis dans la même seconde que le changement serait
> indistinguable d'un jeton antérieur.

> Toutes les routes d'administration vivent sous `/api/admin`. Aucun routeur ne
> doit être monté sur `/api` seul : un routeur monté là s'applique à **toutes**
> les routes `/api/*`, y compris les routes publiques et la connexion.

---

## Structure

```
Royal-Backend/
├── db/
│   ├── schema.sql                      # Schéma MySQL
│   ├── seed.sql                        # Contenu de départ (idempotent)
│   ├── reset.sql                       # Suppression des tables
│   ├── run-sql.ts                      # Exécuteur de fichiers .sql
│   ├── create-admin.ts                 # Création / réinitialisation d'un admin
│   └── migrate-admin-content-columns.ts
├── src/
│   ├── server.ts                       # Point d'entrée unique
│   ├── config/
│   │   ├── env.ts                      # Lecture et validation de l'environnement
│   │   └── db.ts                       # Pool MySQL
│   ├── middleware/
│   │   ├── authMiddleware.ts           # Vérification JWT (+ requireAdmin)
│   │   ├── errorHandler.ts             # Gestion centralisée des erreurs
│   │   └── validate.ts                 # Validation Zod
│   ├── modules/
│   │   ├── content/                    # Lecture publique du contenu
│   │   ├── restaurant/                 # Carte publique
│   │   ├── bookings/                   # Disponibilité et réservations
│   │   │   └── availability.ts         # Calcul nuit par nuit, partagé site + back-office
│   │   ├── contact/                    # Contact et demandes de devis
│   │   ├── newsletter/                 # Inscriptions
│   │   ├── auth/                       # Connexion et inscription
│   │   └── admin/                      # CRUD du back-office
│   ├── types/database.ts               # Interfaces des lignes SQL
│   └── utils/
│       ├── email.ts                    # Envoi via le SMTP de Gmail
│       └── translate.ts                # Traduction FR → EN du back-office (DeepL)
├── tests/api.test.ts                   # Test global de l'API (npm run test:api)
├── uploads/                            # Images envoyées depuis le back-office (hors Git)
├── _unused/                            # Anciens fichiers retirés de src/ (voir son README)
├── docker-compose.yml
└── tsconfig.json
```

---

## Base de données

`rooms`, `room_images`, `room_amenities`, `bookings`, `room_blocks`,
`menu_sections`, `menu_items`, `spa_treatments`, `event_rooms`, `gallery_images`,
`discover_items`, `contact_messages`, `newsletter_subscribers`, `admin_users`,
`admin_audit_log`.

Le seed (`npm run db:seed`) reprend le contenu qui vivait jusqu'ici en dur dans
le front : les 23 images de `src/data/gallery.ts`, les activités et lieux de la
page Découvrir, et les libellés des soins du spa issus des fichiers de
traduction. Il est **idempotent** et ne réécrit pas les champs que tu modifies
au back-office (`rooms.name`, `rooms.description`…), afin qu'un `db:seed` n'efface
pas tes saisies.

`npm run db:setup` enchaîne la création des tables, la migration des colonnes et
le seed. Pour une base créée avant l'ajout des colonnes éditables (`rooms.name`,
`spa_treatments.duration`, `admin_users.is_active`, …),
`npm run db:migrate:admin-content` ajoute uniquement celles qui manquent — la
commande est sûre à relancer. Les nouvelles *tables* sont créées par
`db/schema.sql`, en `CREATE TABLE IF NOT EXISTS`.

Pour une base antérieure au tableau de disponibilité, la mise à jour tient en
deux commandes, sans perte de données :

```bash
npm run db:init                    # crée room_blocks
npm run db:migrate:admin-content   # ajoute bookings.source, rend guest_email facultative
```

`bookings.guest_email` devient **nullable** : une réservation saisie au
back-office depuis un appel n'a pas toujours d'adresse.

---

## Notifications

| Événement | À l'hôtel | Au client |
| --- | --- | --- |
| Réservation reçue | notification complète | accusé de réception avec récapitulatif (e-mail) |
| Réservation **confirmée** au back-office | — | e-mail de confirmation |
| Réservation **annulée** au back-office | — | e-mail d'annulation |
| Message de contact | notification | — |
| Demande de devis | notification | accusé de réception |

Le champ `Reply-To` pointe vers le client sur les notifications reçues par
l'hôtel, pour pouvoir répondre directement depuis sa boîte mail.

L'accusé de réception d'une réservation reste prudent dans sa formulation : la
réservation arrive en statut « en attente » et n'est confirmée qu'une fois
validée au back-office.

### Confirmation et annulation

`PATCH /api/admin/bookings/:id` prévient le client **uniquement au véritable
passage** à `confirmed` ou `cancelled` :

- réappliquer le statut déjà en place (double clic, re-synchro) n'envoie rien ;
- un retour à `pending` est une correction interne et ne déclenche aucun message.

La réponse indique si l'e-mail est réellement parti, et le back-office l'affiche :

```jsonc
{ "data": { "id": "…", "status": "confirmed", "notification": "sent" } }
// "sent"     ⇒ le client a reçu l'e-mail
// "failed"   ⇒ envoi tenté sans succès : le bandeau invite l'administrateur
//              à prévenir le client lui-même
// "not-due"  ⇒ aucun e-mail n'était attendu (statut inchangé, ou retour à pending)
```

> Sans `GMAIL_USER` / `GMAIL_APP_PASSWORD`, **aucun e-mail ne part** : l'envoi
> est ignoré avec un avertissement dans la console, et l'opération métier
> (réservation, changement de statut, message) est tout de même enregistrée. Un
> envoi n'échoue jamais une requête.

### Configurer l'expéditeur

L'envoi passe par le SMTP de Gmail, gratuit et sans nom de domaine à acheter.
Sur le compte Gmail de l'hôtel :

1. activer la **validation en deux étapes** — elle conditionne l'étape suivante ;
2. générer un **mot de passe d'application** sur
   [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) ;
3. reporter l'adresse dans `GMAIL_USER` et les 16 caractères dans
   `GMAIL_APP_PASSWORD`, puis **redémarrer le serveur** : `nodemon` surveille
   `src/`, pas `.env`, qui n'est lu qu'au démarrage.

Le mot de passe d'application n'est pas celui du compte, et les espaces que
Google affiche (« abcd efgh ijkl mnop ») sont retirés à la lecture : un
copier-coller tel quel fonctionne.

Le client voit `FROM_NAME` comme expéditeur, mais l'adresse reste celle de
`GMAIL_USER` : Gmail refuse d'envoyer depuis une autre adresse que celle
authentifiée, ou un alias déclaré dans « Envoyer des e-mails en tant que ».
C'est pourquoi `FROM_EMAIL` est déduit de `GMAIL_USER` plutôt que réglable —
une valeur divergente donnerait une panne silencieuse.

> Un compte Gmail gratuit plafonne autour de **100 e-mails/jour en SMTP**.
> Au-delà, il faudra un domaine et un service d'envoi transactionnel.

---

## Production

```bash
npm run build
NODE_ENV=production npm start
```

À définir impérativement : `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`,
`NODE_ENV=production`. En production, les détails techniques des erreurs ne sont
plus renvoyés au client.

---

## Dépannage

**`ER_ACCESS_DENIED_ERROR` au démarrage** — l'utilisateur ou le mot de passe de
`DATABASE_URL` ne correspond pas au serveur MySQL. Pour un mot de passe vide,
garder les deux-points : `mysql://root:@127.0.0.1:3306/royal_palace`.

**`EADDRINUSE: port 4000`** — une autre instance tourne déjà. La trouver avec
`Get-NetTCPConnection -LocalPort 4000 -State Listen` (PowerShell), ou changer
`PORT`.

**Erreur CORS depuis le front** — ajouter l'origine à `CORS_ORIGIN`.
Le front doit pointer vers l'API via `VITE_API_URL=http://localhost:4000/api`.

**`401` sur un endpoint public** — vérifier qu'aucun routeur n'a été monté sur
`/api` seul dans `src/server.ts`.
