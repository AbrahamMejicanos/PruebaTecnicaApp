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
