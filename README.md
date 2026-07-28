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

- API Laravel funcional instalada en `backend/`.
- Autenticacion JWT configurada con `php-open-source-saver/jwt-auth`.
- Modelos, migraciones y seeders para usuarios, categorias y noticias.
- Endpoints protegidos para noticias, recomendadas y categorias.
- Expo React Native con TypeScript instalado en `mobile/`.
- Dependencias moviles base instaladas: React Navigation, Axios y Expo Secure Store.
- Dependencias de pruebas moviles instaladas: Jest Expo y React Native Testing Library.
- `docker-compose.yml` preparado para PostgreSQL local.

## Comandos utiles

Backend, primera instalacion desde la raiz del repo:

```powershell
.\scripts\setup-backend.ps1
```

Backend, primera instalacion manual desde `backend/`:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate:fresh --seed
php artisan serve
php artisan test
```

Backend, entorno local ya configurado:

```powershell
cd C:\Users\ameji\OneDrive\Desktop\PruebaApp\PruebaTecnicaApp
docker compose up -d postgres
cd backend
php artisan serve
```

Si PostgreSQL ya esta activo localmente, basta con:

```powershell
cd C:\Users\ameji\OneDrive\Desktop\PruebaApp\PruebaTecnicaApp\backend
php artisan serve
```

Setup backend automatizado en Windows:

```powershell
.\scripts\setup-backend.ps1
```

Si ya tienes PostgreSQL levantado y no quieres usar Docker:

```powershell
.\scripts\setup-backend.ps1 -SkipDocker
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

El backend ya cuenta con implementacion funcional. La siguiente fase natural es conectar el frontend movil a estos endpoints.
