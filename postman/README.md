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

Para validar seguridad:

- `04 Security / Sin token - noticias bloqueado`
- `04 Security / Sin token - categorias bloqueado`
- `04 Security / Token invalido - noticias bloqueado`
- `01 Auth / Logout - invalida token`
- `04 Security / Despues de logout - token viejo bloqueado`
