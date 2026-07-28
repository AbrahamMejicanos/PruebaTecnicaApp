# Arquitectura

## Vision

Monorepo con separacion clara entre API Laravel y cliente movil React Native.

```text
PruebaTecnicaApp/
  backend/
  mobile/
  docs/
```

## Decisiones iniciales

- Backend API REST bajo `/api`.
- Autenticacion JWT para proteger noticias y categorias.
- PostgreSQL como base de datos relacional.
- React Native con Expo para acelerar desarrollo y prueba en Android.

## Backend implementado

- `AuthController`: login, logout y perfil autenticado.
- `NewsController`: listado filtrable/paginable, detalle, recomendadas y CRUD autorizado.
- `CategoryController`: listado de categorias ordenadas por `news_count` y noticias por categoria.
- `UserController` y `RoleController`: administracion protegida por rol.
- `FavoriteController`: favoritos por usuario autenticado.
- `Category` y `News` usan relacion uno a muchos.
- `User` pertenece a `Role` mediante `users.role_id`.
- `User` y `News` se relacionan por favoritos mediante `favorite_news`.
- Las respuestas JSON mantienen el formato `{ data, message }` cuando la operacion es exitosa.

## Modelo de datos

```text
users
  id
  role_id
  name
  email
  password
  timestamps

roles
  id
  name
  slug
  description
  timestamps

categories
  id
  name
  description
  news_count calculado con withCount
  timestamps

news
  id
  category_id
  title
  image_url
  excerpt
  body
  published_at
  timestamps

favorite_news
  id
  user_id
  news_id
  timestamps
```

## Setup de datos

La base se reconstruye con:

```bash
php artisan migrate:fresh --seed
```

El seeder crea los roles `superuser`, `administrator`, `news_editor` y `user`; un superusuario desde variables `.env`; usuarios demo para administrador/editor/usuario con password `password`; 3 categorias y 8 noticias.

## Docker

El repositorio incluye una opcion Docker completa:

- `docker-compose.yml`: orquesta backend Laravel y PostgreSQL.
- `backend/Dockerfile`: instala PHP 8.3, extensiones PostgreSQL y Composer.
- `backend/docker/entrypoint.sh`: prepara `.env`, instala dependencias, espera PostgreSQL, migra y ejecuta seeders.
- `.env.docker.example`: variables para PostgreSQL y superusuario.

Comando principal:

```bash
docker compose --env-file .env.docker up --build
```
