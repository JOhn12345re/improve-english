# EnglishFlow

SaaS mobile d'apprentissage de l'anglais — iOS + Android (React Native Expo + NestJS).

## Prerequis

- Node.js >= 20
- pnpm >= 9
- Docker (pour PostgreSQL local)

## Installation

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
# Remplir les variables dans apps/api/.env

docker compose up -d   # Lance PostgreSQL + Redis
pnpm prisma migrate dev
pnpm seed
```

## Developpement

```bash
pnpm --filter mobile start   # Expo dev server (scanner QR avec Expo Go)
pnpm --filter api dev        # NestJS hot-reload sur http://localhost:3000
```

## Tests

```bash
pnpm test          # Jest (tous les packages)
pnpm test:e2e      # Detox E2E (iOS simulator requis)
pnpm lint          # ESLint + Prettier
pnpm typecheck     # TypeScript strict check
```

## Build production

```bash
pnpm --filter mobile build:ios
pnpm --filter mobile build:android
pnpm --filter api build
```

## Structure

```
apps/
  mobile/   App React Native (Expo SDK 51)
  api/      Backend NestJS + PostgreSQL + Prisma
packages/
  shared-types/   Types TypeScript partages
```
