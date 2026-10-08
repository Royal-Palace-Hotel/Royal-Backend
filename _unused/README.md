# Fichiers retirés de `src/`

Ces fichiers ne sont plus utilisés par l'API. Ils sont conservés ici au cas où
tu voudrais récupérer quelque chose — le projet n'étant pas sous Git, rien n'a
été supprimé définitivement. Le dossier peut être effacé sans risque.

| Fichier | Raison |
| --- | --- |
| `src/index.ts` | Copie périmée de `src/server.ts` (il lui manquait les routes restaurant). `package.json` démarre `src/server.ts` ; ce fichier n'était jamais exécuté. |
| `src/config/db.js` | Remplacé par `src/config/db.ts` (typé, lit `src/config/env.ts`). Deux fichiers `db.js` / `db.ts` dans le même dossier rendaient l'import `../../config/db` ambigu. |
| `src/database/db.js` | Deuxième pool MySQL, avec son propre schéma et son propre seed, divergents de `db/schema.sql` (sa table `rooms` avait une colonne `is_active` absente du vrai schéma). Importé nulle part. |
| `src/middleware/auth.js` | Troisième implémentation du contrôle JWT, importée nulle part. Remplacée par `src/middleware/authMiddleware.ts`. |
| `src/modules/rooms/*.js` | Module CRUD chambres jamais monté dans le serveur, et dont l'import `../../db.js` pointait vers un fichier inexistant. Les mêmes opérations existent dans `src/modules/admin/`. |
| `src/modules/restaurant/validation.ts` | Les schémas de gestion du menu vivent maintenant dans `src/modules/admin/validation.ts`. |
