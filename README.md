# Task API — Supabase Authentication + PostgreSQL

A Node.js and Express REST API that continues the earlier CRUD API work. PostgreSQL stores tasks, while Supabase Auth manages user accounts and issues JWT access tokens. The API verifies bearer tokens with Supabase before returning protected user data.

## Features

- Email/password signup and login using Supabase Auth.
- Reusable `authenticateToken` middleware verifies the bearer token with `supabase.auth.getUser(token)`.
- Protected profile and dashboard endpoints; public information endpoint.
- Swagger UI with HTTP Bearer/JWT authorization at `/docs`.
- PostgreSQL-backed task CRUD retained from the earlier assignment.
- Docker Compose starts the API and PostgreSQL together.
- `.env` and other local environment files are ignored by Git; `.env.example` contains placeholders only.

## Requirements

- Node.js 22+ and npm
- Docker Desktop with Docker Compose
- A Supabase project (free tier is sufficient)

## Setup

1. Create a Supabase project.
2. In **Project Settings → API Keys**, copy the Project URL and the public anon/publishable key. Do not use the `service_role` or secret key.
3. In **Authentication → Sign In / Providers → Email**, turn off **Confirm email** only for this practice assignment so a new account can log in immediately. For production, email confirmation should normally remain enabled.
4. Copy the environment template and edit it:

```powershell
Copy-Item .env.example .env
```

Set these values in `.env`:

```env
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
POSTGRES_PASSWORD=dev
PORT=3000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your_public_anon_or_publishable_key
```

Never commit `.env`. The `.env.example` file is safe to commit because it contains placeholders only.

## Run

Install dependencies once:

```powershell
npm install
```

Start the API and database with one command:

```powershell
docker compose up --build
```

The API listens on `http://localhost:3000`. Stop the foreground process with `Ctrl+C`. To stop containers without deleting persistent database data, run `docker compose down` (do not add `-v`).

Useful URLs:

- Health: <http://localhost:3000/health>
- Swagger UI: <http://localhost:3000/docs>
- Public information: <http://localhost:3000/public/info>

## Authentication API reference

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| POST | `/auth/signup` | Create a Supabase user | No |
| POST | `/auth/login` | Verify credentials and return access/refresh tokens | No |
| POST | `/auth/logout` | Acknowledge logout for the authenticated caller | Bearer token |
| GET | `/protected/profile` | Return the verified user's ID, email and creation date | Bearer token |
| GET | `/public/info` | Return public welcome information | No |

Additional protected example: `GET /protected/dashboard` uses the same middleware as `/protected/profile`.

### Expected status codes

- `201 Created` — signup successful.
- `200 OK` — login or protected read successful.
- `204 No Content` — logout acknowledged.
- `400 Bad Request` — signup/login input is missing or invalid.
- `401 Unauthorized` — bearer token is missing, malformed, invalid or expired.

## Authentication flow

1. Call `POST /auth/signup` with JSON containing `email` and `password`.
2. Call `POST /auth/login` with the same credentials and copy the `access_token` from the response.
3. In Swagger UI, click **Authorize** and paste the access token value only. Swagger adds the `Bearer` prefix.
4. Execute `GET /protected/profile`. A valid token returns `200`; a missing or invalid token returns `401`.
5. Execute `POST /auth/logout` with the bearer token; the endpoint returns `204`.

Example request body (use your own test account; never put real credentials in screenshots or source control):

```json
{
  "email": "your-test-email@example.com",
  "password": "your-strong-test-password"
}
```

### Logout behavior

The current logout endpoint is protected and returns `204 No Content`. It acknowledges that the client has logged out; the client must discard its access and refresh tokens. Supabase access tokens are stateless JWTs, so this endpoint does not instantly invalidate an already-issued access token. A token may remain valid until expiry unless a server-side revocation strategy is implemented. This limitation is documented rather than claiming that the JWT has been revoked.

## Swagger verification

Capture actual signup, login, protected profile and logout responses using Swagger UI. Redact tokens, passwords and account identifiers before sharing. No screenshots were included in this upload.

## Existing task API (retained)

| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| GET | `/tasks` | List tasks; supports `done` and `search` filters | 200 |
| GET | `/tasks/:id` | Get one task | 200 |
| POST | `/tasks` | Create a task | 201 |
| PUT | `/tasks/:id` | Update a task | 200 |
| DELETE | `/tasks/:id` | Delete a task | 204 |
| GET | `/stats` | Get task counts | 200 |
| POST | `/reset` | Restore sample tasks | 200 |

## Tests

Run the Node test suite:

```powershell
npm test
```

The included tests check configuration and OpenAPI structure without external services. Live PostgreSQL and Supabase integration must be verified locally.

## Security checklist

- [x] `.env` is ignored by `.gitignore`.
- [x] `.env.example` contains placeholder values only.
- [x] No Supabase service-role/secret key is required by this application.
- [x] Passwords are sent to Supabase Auth; this API does not store or hash passwords.
- [x] Protected routes verify bearer tokens with Supabase.
- [ ] Before publishing, verify that `.env` has never been committed and that no credentials or JWTs appear in Git history.

## Publishing checklist

This public repository contains the project import and configuration improvements. Keep `.env` out of every commit. The supplied lockfile was from an older SQLite project; run `npm install` locally to generate a matching `package-lock.json`, then commit it. Task CRUD and reset are intentionally public for this exercise; protect them before production deployment.
