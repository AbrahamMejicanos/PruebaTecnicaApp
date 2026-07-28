# API

Base esperada: `/api`

| Metodo | Endpoint | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/login` | No | Autentica usuario y retorna JWT. |
| POST | `/logout` | Si | Invalida token. |
| GET | `/me` | Si | Retorna usuario autenticado. |
| GET | `/users` | Si, superuser/admin | Lista usuarios. |
| GET | `/users/{id}` | Si, superuser/admin | Detalle de usuario. |
| POST | `/users` | Si, superuser/admin | Crea usuario. |
| PUT | `/users/{id}` | Si, superuser/admin | Actualiza usuario. |
| DELETE | `/users/{id}` | Si, superuser/admin | Elimina usuario. |
| PUT | `/users/{id}/role` | Si, superuser/admin | Cambia rol de usuario. |
| GET | `/roles` | Si, superuser/admin | Lista roles. |
| GET | `/news` | Si | Lista noticias. |
| GET | `/news/{id}` | Si | Detalle de noticia. |
| POST | `/news` | Si, superuser/admin/editor | Crea noticia. |
| PUT | `/news/{id}` | Si, superuser/admin/editor | Actualiza noticia. |
| POST | `/news/{id}` | Si, superuser/admin/editor | Actualiza noticia con soporte multipart. |
| DELETE | `/news/{id}` | Si, superuser/admin/editor | Elimina noticia. |
| GET | `/news/{id}/recommended` | Si | Noticias recomendadas. |
| GET | `/categories` | Si | Lista categorias. |
| GET | `/categories/{id}/news` | Si | Lista noticias de una categoria. |
| GET | `/favorites` | Si | Lista favoritos del usuario. |
| POST | `/news/{id}/favorite` | Si | Marca favorito. |
| DELETE | `/news/{id}/favorite` | Si | Desmarca favorito. |

## Autenticacion

### POST `/api/login`

Body:

```json
{
  "email": "tu-correo@example.com",
  "password": "tu-password-seguro"
}
```

Nota de seguridad: cada usuario solo mantiene un token activo. Si el mismo usuario inicia sesion otra vez, el token anterior queda reemplazado y los endpoints protegidos responderan `401`.

Respuesta:

```json
{
  "data": {
    "token": "jwt-token",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "name": "Tu Nombre",
      "email": "tu-correo@example.com",
      "role": {
        "id": 1,
        "name": "Superusuario",
        "slug": "superuser"
      }
    }
  },
  "message": "OK"
}
```

### Header protegido

```http
Authorization: Bearer <token>
```

### POST `/api/logout`

No requiere body. El token enviado en `Authorization` identifica la sesion a cerrar.

Respuesta:

```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "Tu Nombre",
      "email": "tu-correo@example.com",
      "role": {
        "id": 1,
        "name": "Superusuario",
        "slug": "superuser"
      }
    }
  },
  "message": "Sesion cerrada."
}
```

## Noticias

### GET `/api/news`

Retorna lista de noticias con datos resumidos. Sin parametros mantiene una lista plana compatible con la version inicial:

```json
{
  "data": [
    {
      "id": 1,
      "title": "Titulo",
      "image_url": "http://localhost:8000/images/news/mobile-development.png",
      "excerpt": "Resumen",
      "published_at": "2026-07-28T06:00:00.000000Z",
      "category": {
        "id": 1,
        "name": "Tecnologia",
        "description": "..."
      }
    }
  ],
  "message": "OK"
}
```

Acepta filtros, categoria y paginacion:

```text
GET /api/news?search=laravel|react&date_from=2026-07-01&date_to=2026-07-31&category_id=1&page=1&per_page=10
```

`date_from` y `date_to` son independientes. Se puede enviar solo `date_from`, solo `date_to` o ambas fechas.

Cuando se envia `page` o `per_page`, agrega `meta`:

```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 10,
    "total": 0
  },
  "message": "OK"
}
```

En PostgreSQL, `search` usa expresion regular case-insensitive sobre titulo, resumen y cuerpo. En testing/local SQLite usa busqueda parcial compatible.

### POST `/api/news`

Usa `multipart/form-data` para subir imagen:

```text
category_id
title
image
excerpt
body
published_at
```

`image` debe ser un archivo de imagen de hasta 5 MB. Para actualizar una noticia con imagen nueva se puede usar `POST /api/news/{id}` con el mismo formato.

### GET `/api/news/{id}`

Incluye `body` completo.

### GET `/api/news/{id}/recommended`

Retorna 3 noticias recomendadas. Primero busca por misma categoria y completa con noticias recientes si faltan resultados.

## Categorias

### GET `/api/categories`

Retorna categorias ordenadas por cantidad de noticias descendente. En empates, ordena por nombre.

```json
{
  "data": [
    {
      "id": 1,
      "name": "Tecnologia",
      "description": "Noticias sobre software, inteligencia artificial y productos digitales.",
      "news_count": 4
    }
  ],
  "message": "OK"
}
```

### GET `/api/categories/{id}/news`

```json
{
  "data": {
    "category": {
      "id": 1,
      "name": "Tecnologia",
      "description": "...",
      "news_count": 4
    },
    "news": []
  },
  "message": "OK"
}
```

## Roles y usuarios

Roles iniciales:

- `superuser`: acceso total. Puede gestionar otros superusuarios.
- `administrator`: administra usuarios y noticias, pero no puede crear, modificar, eliminar ni asignar superusuarios.
- `news_editor`: administra noticias, sin gestionar usuarios ni roles.
- `user`: navega noticias, categorias, recomendadas y favoritos.

Los endpoints administrativos devuelven `403` cuando el rol no tiene permiso.

La app movil muestra tabs segun rol:

- Usuario: Inicio, Favoritos y Categorias.
- Editor: Inicio, Favoritos, Categorias y Gestion de noticias.
- Administrador/Superusuario: agrega tambien Gestion de usuarios.

## Favoritos

### GET `/api/favorites`

Retorna las noticias favoritas del usuario autenticado.

### POST `/api/news/{id}/favorite`

Marca una noticia como favorita.

### DELETE `/api/news/{id}/favorite`

Quita una noticia de favoritos.

## Errores principales

Credenciales invalidas:

```json
{
  "message": "Credenciales invalidas."
}
```

Noticia inexistente:

```json
{
  "message": "Noticia no encontrada."
}
```

Token ausente:

```json
{
  "message": "Token ausente o no autenticado."
}
```

Token invalido:

```json
{
  "message": "Token invalido."
}
```

Sesion reemplazada por un nuevo login:

```json
{
  "message": "Sesion reemplazada por un nuevo inicio de sesion."
}
```

Permiso insuficiente:

```json
{
  "message": "No tienes permisos para realizar esta accion."
}
```
