---
title: Slate API
emoji: 🚀
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Slate

Slate is a whiteboard MVP: sign in, create boards, draw with Excalidraw, autosave, and reopen boards later.

## Apps

- `apps/web` - React, Vite, TypeScript, Tailwind, Zustand, Excalidraw
- `apps/api` - Spring Boot 3, Java 21, Spring Security OAuth2, Spring Data JPA
- `docker` - local PostgreSQL compose setup

## Local Development

Start PostgreSQL:

```bash
docker compose -f docker/docker-compose.yml up -d
```

Run the API:

```bash
cd apps/api
mvn spring-boot:run
```

Run the web app:

```bash
cd apps/web
pnpm install
pnpm dev
```

The frontend expects the API at `http://localhost:8080`.

For local development, `SLATE_DEV_USER_ENABLED=true` lets API requests use a built-in dev user. To enable Google OAuth, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, then start the API with the `oauth` profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=oauth
```
