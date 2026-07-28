# API

Base esperada: `/api`

| Metodo | Endpoint | Auth | Descripcion |
| --- | --- | --- | --- |
| POST | `/login` | No | Autentica usuario y retorna JWT. |
| POST | `/logout` | Si | Invalida token. |
| GET | `/me` | Si | Retorna usuario autenticado. |
| GET | `/news` | Si | Lista noticias. |
| GET | `/news/{id}` | Si | Detalle de noticia. |
| GET | `/news/{id}/recommended` | Si | Noticias recomendadas. |
| GET | `/categories` | Si | Lista categorias. |

## Autenticacion

### POST `/api/login`

Body:

```json
{
  "email": "demo@example.com",
  "password": "password"
}
```

Respuesta:

```json
{
  "data": {
    "token": "jwt-token",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "name": "Demo User",
      "email": "demo@example.com"
    }
  },
  "message": "OK"
}
```

### Header protegido

```http
Authorization: Bearer <token>
```

## Noticias

### GET `/api/news`

Retorna lista de noticias con datos resumidos:

```json
{
  "data": [
    {
      "id": 1,
      "title": "Titulo",
      "image_url": "https://placehold.co/...",
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

### GET `/api/news/{id}`

Incluye `body` completo.

### GET `/api/news/{id}/recommended`

Retorna 3 noticias recomendadas. Primero busca por misma categoria y completa con noticias recientes si faltan resultados.

## Categorias

### GET `/api/categories`

```json
{
  "data": [
    {
      "id": 1,
      "name": "Tecnologia",
      "description": "Noticias sobre software, inteligencia artificial y productos digitales."
    }
  ],
  "message": "OK"
}
```

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
