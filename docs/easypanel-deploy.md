# Easypanel Deployment

This project is prepared for three Easypanel resources:

- `mesa-web`: static React/Vite frontend built with `Dockerfile.web`.
- `mesa-api`: Express API built with `Dockerfile.api`.
- `mesa-postgres`: PostgreSQL database created from Easypanel.

## 1. Push to Git

Create a normal Git remote, for example GitHub, GitLab, or a private Gitea repo.

```bash
git remote add origin <YOUR_GIT_REMOTE_URL>
git push -u origin main
```

## 2. Create Postgres

In Easypanel, create a PostgreSQL service and copy its internal connection string.

Use that value as `DATABASE_URL` in the API service.

## 3. Create API Service

Create an App from Git:

- Build type: Dockerfile
- Dockerfile path: `Dockerfile.api`
- Port: `3000`

Required environment variables:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=<EASYPANEL_POSTGRES_CONNECTION_STRING>
SESSION_SECRET=<LONG_RANDOM_SECRET>
CORS_ORIGIN=https://tu-dominio.com
WEB_PUBLIC_URL=https://tu-dominio.com
API_PUBLIC_URL=https://api.tu-dominio.com
SESSION_COOKIE_SAMESITE=lax
```

Optional Google login variables:

```bash
GOOGLE_CLIENT_ID=<GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<GOOGLE_CLIENT_SECRET>
```

After the first API deployment, run this once from the API container console:

```bash
pnpm --filter @workspace/db run push
```

Then restart the API service.

## 4. Create Web Service

Create another App from the same Git repo:

- Build type: Dockerfile
- Dockerfile path: `Dockerfile.web`
- Port: `80`

Build argument:

```bash
VITE_API_BASE_URL=https://api.tu-dominio.com
```

Point the web domain to this service, for example:

```bash
https://tu-dominio.com
```

Point the API domain to the API service, for example:

```bash
https://api.tu-dominio.com
```

## 5. Google OAuth Callback

If Google login is enabled, add this callback URL in Google Cloud Console:

```bash
https://api.tu-dominio.com/api/auth/google/callback
```

## Notes

- Without `DATABASE_URL`, the API falls back to the local demo router. In production, always set `DATABASE_URL`.
- The frontend is built with `VITE_API_BASE_URL`; changing the API URL requires rebuilding the web service.
- If web and API are on unrelated domains, set `SESSION_COOKIE_SAMESITE=none` and keep HTTPS enabled.
