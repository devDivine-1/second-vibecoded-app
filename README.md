# Daymark Task Manager

A small task manager with a React/Vite frontend, FastAPI backend, and PostgreSQL database.

## Run with Docker Compose

From the `my_app` folder, run:

```sh
docker compose up --build
```

Open the app at [http://localhost:3000](http://localhost:3000). The API is available at [http://localhost:8000](http://localhost:8000), with interactive API docs at [http://localhost:8000/docs](http://localhost:8000/docs). PostgreSQL data is stored in the `postgres_data` Docker volume.

The default database settings are for local development. Set `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` in the shell or a root `.env` file to customize them. If the browser-facing API URL changes, set `VITE_API_URL` before building the frontend.

## Services

- `frontend/` — React and Vite single-page app, served by Nginx in production.
- `backend/` — FastAPI JSON API with SQLAlchemy and PostgreSQL.
- `docker-compose.yml` — frontend, backend, and database services.
- `.github/workflows/ci.yml` — GitHub Actions Compose configuration and image build check.

The API supports `GET` and `POST /api/tasks`, `PATCH /api/tasks/{id}`, and `DELETE /api/tasks/{id}`. `GET /health` reports API/database readiness.
# second-vibecoded-app
# second-vibecoded-app
