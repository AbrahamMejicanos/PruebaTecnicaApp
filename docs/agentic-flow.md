# Flujo de Desarrollo Agentico

## Product Owner

- Se define una app movil Android de noticias autenticada.
- Alcance inicial: login, noticias, detalle, recomendadas y categorias.

## Arquitecto

- Monorepo con `backend/`, `mobile/` y `docs/`.
- Backend Laravel, PostgreSQL y JWT.
- Frontend React Native con Expo.

## DevOps

- Configuracion inicial de repositorio, `.gitignore` y documentacion base.
- Dependencias locales revisadas: Node/npm disponibles; PHP instalado por WinGet.
- `docker-compose.yml` disponible para PostgreSQL.
- Scripts de setup backend creados en `scripts/setup-backend.ps1` y `scripts/setup-backend.sh`.
- Docker completo agregado para backend Laravel + PostgreSQL con `.env.docker.example`.

## Backend

- Laravel API activada bajo `/api`.
- JWT configurado con guard `api`.
- Modelos `Category` y `News` implementados con relaciones.
- Migraciones para categorias y noticias.
- Seeder reproducible con usuario demo, 3 categorias y 8 noticias.
- Endpoints implementados: login, logout, me, news, news detail, recommended y categories.
- Feature tests cubren autenticacion, rutas protegidas, noticias, recomendadas y categorias.
- Se agrego `UserResource` para respuestas limpias de usuario.
- Se personalizaron mensajes para token ausente, invalido y expirado.
- Se agrego manejo de roles con rol inicial `superuser` y credenciales configurables por `.env`.
- Se agrego control de sesion unica por usuario mediante `active_jwt_id`.

## Frontend Mobile

- Scaffold Expo creado con TypeScript.
- Dependencias base instaladas para navegacion, HTTP y almacenamiento seguro.

## QA

- Backend validado con `php artisan test`: 14 pruebas pasan.
- Frontend mantiene smoke test inicial de Expo.

## Documentador

- Documentacion base inicial creada.
