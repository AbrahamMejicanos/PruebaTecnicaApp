# PruebaTecnicaApp

Aplicacion movil Android de noticias con backend Laravel, PostgreSQL, autenticacion JWT y frontend React Native con Expo.

## Estado inicial

Este repositorio esta preparado como monorepo para desarrollar:

- `backend/`: API REST Laravel.
- `mobile/`: app movil React Native / Expo.
- `docs/`: documentacion tecnica y flujo agentico.

La prueba original mencionaba una aplicacion web, pero el criterio vigente es entregar una experiencia principal Android.

## Requisitos locales

- Git
- Node.js y npm
- PHP 8.3 o superior
- Composer
- PostgreSQL 15 o superior, o Docker si se decide levantar servicios por contenedor

## Configuracion creada

- Laravel instalado en `backend/`.
- Paquete JWT instalado: `php-open-source-saver/jwt-auth`.
- Expo React Native con TypeScript instalado en `mobile/`.
- Dependencias moviles base instaladas: React Navigation, Axios y Expo Secure Store.
- Dependencias de pruebas moviles instaladas: Jest Expo y React Native Testing Library.
- `docker-compose.yml` preparado para PostgreSQL local.

## Comandos utiles

Backend:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
php artisan test
```

Mobile:

```bash
cd mobile
npm install
npm start
npm test
```

PostgreSQL con Docker:

```bash
docker compose up -d postgres
```

## Flujo de ramas sugerido

1. Hacer push de esta configuracion base en la rama actual.
2. Crear una rama de desarrollo, por ejemplo `develop`.
3. Implementar por capas: backend funcional, mobile funcional, pruebas y documentacion final.

## Credenciales demo esperadas

```text
Email: demo@example.com
Password: password
```

La implementacion funcional de endpoints y pantallas se realizara en una rama de desarrollo despues del primer push de esta base.
