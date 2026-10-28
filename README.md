# Mini-Flotte — gestion de flotte automobile

Petite application d'apprentissage : **Angular 20** (front) + **Spring Boot 3.5 / Java 21** (back) + **PostgreSQL 16**, le tout dockerisé.
Objectif : la faire tourner en local (WSL), puis la déployer sur **AWS**.

## 1. Architecture

```
            Navigateur
                │  http://localhost:8080
                ▼
┌───────────────────────────── réseau Docker privé ─────────────────────────────┐
│  frontend (nginx :80)  ──/api/*──►  backend (Spring Boot :8080)  ──►  db (PostgreSQL :5432) │
│  sert Angular                       API REST + sécurité              volume db-data       │
└───────────────────────────────────────────────────────────────────────────────┘
```

- Seul **nginx** est exposé. Le back-end et la base ne sont pas joignables depuis l'extérieur.
- nginx envoie tout ce qui commence par `/api` vers le back-end : le navigateur ne voit qu'**une seule adresse** (pas de souci de CORS).
- Le schéma de la base est créé par **Flyway** (`backend/src/main/resources/db/migration`).
- Les données de démo (utilisateurs, véhicules, entretiens) sont créées au **premier démarrage**, quand la base est vide.

## 2. Comptes de démonstration

| ID | Identifiant | Mot de passe  | Nom           | Rôle                      | Véhicules attribués            |
|----|-------------|---------------|---------------|---------------------------|--------------------------------|
| 1  | `admin`     | `Admin2026!`  | Sophie Martin | Gestionnaire (ADMIN)      | voit et gère toute la flotte   |
| 2  | `jdupont`   | `Julien2026!` | Julien Dupont | Conducteur (DRIVER)       | AB-123-CD (Clio), QR-345-ST (C3) |
| 3  | `aleroy`    | `Amina2026!`  | Amina Leroy   | Conducteur (DRIVER)       | EF-456-GH (Peugeot 308)        |
| 4  | `kmensah`   | `Kofi2026!`   | Kofi Mensah   | Conducteur (DRIVER)       | IJ-789-KL (Kangoo Van)         |
| 5  | `lbernard`  | `Lucie2026!`  | Lucie Bernard | Conducteur (DRIVER)       | MN-012-OP (Tesla Model 3)      |

Véhicules non attribués : UV-678-WX (Yaris, disponible), CD-234-EF (Sandero, disponible), YZ-901-AB (Transit, en maintenance).

> ⚠️ Mots de passe de démo uniquement. On les changera / désactivera avant toute mise en ligne « sérieuse ».

### Ce que chacun peut faire

- **Gestionnaire** : tableau de bord, filtres, ajout de véhicule, attribution / retrait d'un conducteur, passage en maintenance, ajout d'entretiens, liste des utilisateurs.
- **Conducteur** : voit uniquement *ses* véhicules, met à jour le kilométrage, consulte l'historique d'entretien.
  Les droits sont vérifiés **côté serveur** (le front ne fait que masquer les boutons).

## 3. Lancer en local (WSL)

### Prérequis

```bash
docker --version          # Docker 24+ (Docker Desktop avec intégration WSL, ou Docker Engine dans WSL)
docker compose version    # Compose v2
```

> Astuce WSL : travaillez dans le système de fichiers Linux (`~/projets/...`), **pas** dans `/mnt/c/...` : les builds sont beaucoup plus rapides.

### Démarrage

```bash
mkdir -p ~/projets && cd ~/projets
cp /mnt/c/Users/<VOTRE_USER_WINDOWS>/Downloads/mini-flotte.zip .
unzip mini-flotte.zip && cd mini-flotte      # (sudo apt install unzip si besoin)

cp .env.example .env                         # variables d'environnement (mot de passe BDD...)
docker compose up -d --build                 # 1er build : 3 à 8 min (téléchargement Maven + npm)
docker compose ps                            # les 3 services doivent être "running (healthy)"
```

Ouvrir **http://localhost:8080** dans le navigateur Windows et se connecter avec un des comptes ci-dessus.

### Vérifier l'API en ligne de commande

```bash
curl -s http://localhost:8080/health                                  # {"status":"UP",...}
curl -s -u 'admin:Admin2026!'   http://localhost:8080/api/me           # infos de Sophie
curl -s -u 'jdupont:Julien2026!' http://localhost:8080/api/vehicles    # 2 véhicules seulement
curl -s -o /dev/null -w '%{http_code}\n' -u 'jdupont:Julien2026!' http://localhost:8080/api/users   # 403 (pas admin)
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8080/api/vehicles                         # 401 (pas connecté)
```

### Commandes utiles

```bash
docker compose logs -f backend      # suivre les logs du back-end
docker compose restart backend      # redémarrer un service
docker compose down                 # tout arrêter (les données sont conservées)
docker compose down -v              # tout arrêter ET effacer la base (les données de démo seront recréées)
docker compose exec db psql -U flotte -d flotte -c "select id, username, role from app_user;"
```

### En cas de problème

| Symptôme | Piste |
|---|---|
| `port is already allocated` | Changer `HTTP_PORT` dans `.env` (ex. 8090) |
| backend `unhealthy` | `docker compose logs backend` (souvent : mauvais mot de passe BDD après modif du `.env` → `docker compose down -v`) |
| page blanche | `docker compose logs frontend`, puis F12 → onglet Console |
| erreur pendant `npm install` / `mvn` | copier l'erreur complète et me l'envoyer |

## 4. Mode développement (optionnel, sans Docker pour le code)

```bash
docker compose up -d db                                   # seulement la base
# (exposer temporairement le port 5432 dans docker-compose.yml si besoin)
cd backend && mvn spring-boot:run                         # API sur :8080
cd frontend && npm install && npm start                   # Angular sur http://localhost:4200 (proxy /api → :8080)
```

## 5. API REST

| Méthode | URL | Rôle | Description |
|---|---|---|---|
| GET | `/api/me` | tous | utilisateur connecté |
| GET | `/api/users` | ADMIN | liste des utilisateurs |
| GET | `/api/vehicles` | tous | ADMIN : toute la flotte, DRIVER : ses véhicules |
| GET | `/api/vehicles/{id}` | tous* | détail |
| POST | `/api/vehicles` | ADMIN | créer un véhicule |
| PUT | `/api/vehicles/{id}/driver` | ADMIN | `{"driverId": 3}` ou `{"driverId": null}` |
| PUT | `/api/vehicles/{id}/status` | ADMIN | `{"status": "MAINTENANCE"}` |
| PATCH | `/api/vehicles/{id}/mileage` | tous* | `{"mileage": 46000}` |
| GET | `/api/vehicles/{id}/maintenances` | tous* | historique |
| POST | `/api/vehicles/{id}/maintenances` | ADMIN | ajouter un entretien |
| GET | `/actuator/health` (via `/health`) | public | état de santé |

\* un conducteur uniquement sur ses propres véhicules.

## 6. Arborescence

```
mini-flotte/
├── docker-compose.yml          # lancement local (build des images)
├── .env.example                # modèle des variables (copier en .env)
├── backend/                    # Spring Boot
│   ├── Dockerfile              # build multi-étapes (Maven → JRE léger, utilisateur non-root)
│   └── src/main/...            # model / repository / service / web / config
├── frontend/                   # Angular
│   ├── Dockerfile              # build multi-étapes (Node → nginx)
│   ├── nginx.conf              # fichiers statiques + reverse proxy /api
│   └── src/app/...             # core (auth, api) + pages
├── deploy/                     # utilisé à l'étape AWS
│   ├── docker-compose.prod.yml
│   └── .env.prod.example
└── docs/AWS-FEUILLE-DE-ROUTE.md
```

## 7. Et ensuite ?

Le plan du déploiement AWS est dans [`docs/AWS-FEUILLE-DE-ROUTE.md`](docs/AWS-FEUILLE-DE-ROUTE.md).
# mini_flotte
