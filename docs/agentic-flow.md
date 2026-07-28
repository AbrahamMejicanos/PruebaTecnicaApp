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
- Se extendio RBAC con roles `administrator`, `news_editor` y `user`.
- Se agregaron endpoints administrativos de usuarios/roles y CRUD autorizado de noticias.
- Se agregaron favoritos por usuario autenticado.
- Se agregaron filtros por busqueda/fecha y paginacion en `GET /news`.
- Se agrego endpoint de noticias por categoria y ordenamiento de categorias por cantidad de noticias.

## Frontend Mobile

- Scaffold Expo creado con TypeScript.
- Dependencias base instaladas para navegacion, HTTP y almacenamiento seguro.
- Pantallas conectadas a API: login, noticias, detalle, recomendadas, categorias y favoritos.
- Inicio con busqueda, filtros por fecha, paginacion y acciones de favorito.
- Filtros de fecha usan selector visual y permiten limpiar `Desde` y `Hasta` por separado.
- Categorias son navegables y muestran ranking visual por cantidad de noticias.
- Tabs administrativos aparecen segun rol: gestion de noticias para editor/admin/superuser y gestion de usuarios para admin/superuser.
- La gestion de noticias sube imagenes desde el dispositivo con Expo Image Picker y multipart.
- Cabecera con indicador visual del rol autenticado.

## QA

- Backend validado con `php artisan test`: 14 pruebas pasan.
- Frontend mantiene smoke test inicial de Expo.

## Documentador

- Documentacion base inicial creada.
