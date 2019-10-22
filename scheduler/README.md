# Scheduler (Manon)

Scheduler est l'automate permettant d'exécuter des tâches récurrentes sur l'application Candilib.

Ce composant utilise une collection "SchedulerJobs" dans la base mongodb "candilib"

## lancer le scheduler en mode dev

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
