# Task Manager API

FastAPI service backed by PostgreSQL. It creates the `tasks` table at startup and uses `DATABASE_URL` for its connection string.

## Run locally

From this directory, install `requirements.txt` and start the service:

```sh
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL='postgresql+psycopg://app:app@localhost:5432/app'
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The database must be running and the database/user in the URL must exist. In Docker Compose, the API base URL is normally `http://localhost:8000` from the browser. Set the frontend's `VITE_API_URL` to that base URL; the frontend can call `${VITE_API_URL}/api/tasks`.

`CORS_ORIGINS` is a comma-separated list of allowed browser origins and defaults to `http://localhost:5173`.

## Endpoints

- `GET /health` — checks API and database availability.
- `GET /api/tasks?limit=100&offset=0` — newest tasks first.
- `POST /api/tasks` — JSON `{ "title": "...", "description": "..." }`.
- `PATCH /api/tasks/{id}` — any subset of `title`, `description`, and `completed`.
- `DELETE /api/tasks/{id}` — returns `204` on success.

Task responses contain `id`, `title`, `description`, `completed`, `created_at`, and `updated_at`. Missing task IDs return `404`.
