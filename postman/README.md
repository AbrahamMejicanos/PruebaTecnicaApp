# Postman

Importa estos dos archivos en Postman:

- `NewsAgenticApp.postman_collection.json`
- `NewsAgenticApp.postman_environment.json`

Selecciona el environment `NewsAgenticApp Local` y configura:

- `password`: password del superusuario local.
- `email`: email del superusuario si cambiaste el valor por defecto.

Ejecuta primero:

```text
01 Auth / Login correcto - guarda token
```

Ese request guarda automaticamente `token` en el environment. Despues puedes ejecutar los endpoints protegidos.

La coleccion incluye requests para:

- Filtros de noticias con `date_from`, `date_to`, busqueda y paginacion.
- Noticias por categoria en `GET /categories/{id}/news`.
- CRUD de noticias para editor/administrador/superusuario.
- Gestion de roles/usuarios para administrador/superusuario.
- Favoritos propios del usuario autenticado.

Para validar seguridad:

- `04 Security / Sin token - noticias bloqueado`
- `04 Security / Sin token - categorias bloqueado`
- `04 Security / Token invalido - noticias bloqueado`
- Ejecuta `Login correcto - guarda token`, copia el token, ejecuta login otra vez, e intenta usar el token viejo para validar sesion reemplazada.
- `01 Auth / Logout - invalida token`
- `04 Security / Despues de logout - token viejo bloqueado`
