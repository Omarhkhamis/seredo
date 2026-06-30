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

## Registration forms

Visitor and exhibitor forms are rendered by the Next.js app and submit through:

```bash
POST /api/registration
```

To keep Google Sheets as the destination, add the `doPost` function from
`docs/google-registration-webhook.gs` to the existing Google Apps Script, deploy
it as a web app, then set:

```bash
GOOGLE_REGISTRATION_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"
```

Useful commands:

```bash
docker compose logs -f app
docker compose exec postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > seredo-backup.sql
docker compose down
```
