# Scheduler (Manon)

Scheduler est l'automate permettant d'exécuter des tâches récurrentes sur l'application Candilib.

Ce composant utilise :
* une collection "SchedulerJobs" dans la base mongodb "candilib"
* l'api "candilib" pour executer les tâches (jobs)

## Configuration
Variables d'environnement (à définir en argument du Makefile)
```bash
      SCHEDULER_NAME: ${SCHEDULER_NAME}
      MONGO_URL: mongodb://login:pwd@db:27017/candilib}
      API_BASE_URL: http://api:8000
      API_PREFIX: /api/v2
      DISABLE_SCHEDULE: true|false
      DISABLE_DEFINE: true|false
      JOB_LIST: hello,get-api-version
```

## Lancer le scheduler en mode dev

* Pre requis: demarrer api et db
```bash
cd ..
make build-dev up-dev-api up-dev-db
```

* Demarrer le scheduler
```bash
cd ..
make build-dev-scheduler
make up-dev-scheduler
```

* Consulter les logs
```bash
docker logs candilib_scheduler
```

* Arreter le scheduler, api et db
```bash
cd ..
make down-dev-scheduler
make down-dev
```

## Lancer le scheduler en mode prod
* Pre requis: demarrer api et db
```bash
cd ..
make build-api build-db up-api up-db
```

* Demarrer le scheduler

```bash
cd ..
make build-scheduler
make up-scheduler
```

* Consulter les logs
```bash
docker logs candilib_scheduler
```

* Arreter le scheduler, api et db
```bash
cd ..
make down-scheduler
make down-api down-db
```


