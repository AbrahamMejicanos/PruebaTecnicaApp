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
- `NewsController`: listado, detalle y recomendadas.
- `CategoryController`: listado de categorias.
- `Category` y `News` usan relacion uno a muchos.
- Las respuestas JSON mantienen el formato `{ data, message }` cuando la operacion es exitosa.

## Modelo de datos

```text
users
  id
  name
  email
  password
  timestamps

categories
  id
  name
  description
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
```

## Setup de datos

La base se reconstruye con:

```bash
php artisan migrate:fresh --seed
```

El seeder crea un usuario demo, 3 categorias y 8 noticias.
