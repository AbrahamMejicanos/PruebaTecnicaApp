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
