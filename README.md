# SEREDO Next

## Docker

Create a production env file on the server:

```bash
cp .env.example .env
```

Edit `.env` and set a strong `POSTGRES_PASSWORD`, then run:

```bash
docker compose up -d --build
```

The app runs on `APP_PORT` and PostgreSQL is bound to `127.0.0.1:POSTGRES_PORT`.

Useful commands:

```bash
docker compose logs -f app
docker compose exec postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > seredo-backup.sql
docker compose down
```
