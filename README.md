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
- RBAC con roles `superuser`, `administrator`, `news_editor` y `user`.
- Endpoints administrativos de usuarios/roles protegidos por rol.
- CRUD autorizado de noticias para superusuario, administrador y editor.
- Favoritos por usuario autenticado.
- Filtros de noticias por busqueda, fecha y paginacion.
- Categorias ordenadas por cantidad de noticias y navegacion a noticias de cada categoria.
- App movil con date picker para filtros de fecha y tabs administrativos segun rol.
- Creacion/edicion de noticias con subida de imagen desde el dispositivo.
- Expo React Native con TypeScript instalado en `mobile/`.
- Dependencias moviles base instaladas: React Navigation, Axios y Expo Secure Store.
- Dependencias de pruebas moviles instaladas: Jest Expo y React Native Testing Library.
- `docker-compose.yml` preparado para PostgreSQL local.

## Despliegue Docker backend

El backend queda preparado para correr igual en local y en un servidor Ubuntu/EC2. Desde la raiz del repo:

```bash
cp .env.docker.example .env.docker
```

Edita `.env.docker`. Para local puedes dejar `APP_URL=http://localhost:8000`. En EC2 usa la IP publica o dominio del servidor:

```env
APP_URL=http://TU_IP_O_DOMINIO:8000
SUPERUSER_EMAIL=tu-correo@example.com
SUPERUSER_PASSWORD=tu-password-seguro
```

Luego levanta todo:

```bash
docker compose --env-file .env.docker up -d --build
```

Esto levanta PostgreSQL y Laravel, espera la base de datos, ejecuta migraciones/seeders y publica la API en:

```text
http://localhost:8000/api
```

En EC2 abre el puerto `8000` en el Security Group si vas a exponer Laravel directamente. Si usas Nginx o un proxy, apunta `APP_URL` al dominio final.

Para ver logs:

```bash
docker compose --env-file .env.docker logs -f backend
```

Para reiniciar desde cero, eliminando datos de base y uploads:

```bash
docker compose --env-file .env.docker down -v
docker compose --env-file .env.docker up -d --build
```

## Generar APK

Antes de generar el APK, configura la URL de API que quedara embebida en la app:

```bash
cd mobile
cp .env.example .env
```

Para emulador local:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api
```

Para entregar APK apuntando al EC2:

```env
EXPO_PUBLIC_API_URL=http://TU_IP_O_DOMINIO:8000/api
```

Con Expo EAS:

```bash
cd mobile
npm install
npx eas-cli login
npx eas-cli build -p android --profile preview
```

El perfil `preview` genera un APK. Al terminar, EAS muestra un link de descarga del `.apk`.

## Comandos utiles

Backend, primera instalacion desde la raiz del repo:

```powershell
.\scripts\setup-backend.ps1
```

El script te pedira credenciales del superusuario si no existen en `backend/.env`.

Backend, primera instalacion manual desde `backend/`:

```bash
cd backend
composer install
cp .env.example .env
```

Antes de sembrar la base, edita `backend/.env`:

```env
SUPERUSER_NAME="Tu Nombre"
SUPERUSER_EMAIL=tu-correo@example.com
SUPERUSER_PASSWORD=tu-password-seguro
```

Luego continua:

```bash
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

Para usar una base PostgreSQL local existente, configura `backend/.env` con los datos equivalentes:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=news_agentic
DB_USERNAME=postgres
DB_PASSWORD=tu-password-local
```

Usa una base dedicada como `news_agentic` para evitar conflictos con tablas existentes.

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
docker compose --env-file .env.docker up postgres
```

## Flujo de ramas sugerido

1. Hacer push de esta configuracion base en la rama actual.
2. Crear una rama de desarrollo, por ejemplo `develop`.
3. Implementar por capas: backend funcional, mobile funcional, pruebas y documentacion final.

## Credenciales de acceso

El acceso se crea desde las variables `SUPERUSER_NAME`, `SUPERUSER_EMAIL` y `SUPERUSER_PASSWORD` en `backend/.env`. No hay credenciales de login quemadas en el codigo.

El backend y el frontend movil ya cuentan con un MVP funcional conectado. La siguiente fase natural es pulir experiencia administrativa o ampliar pruebas visuales/end-to-end.

Usuarios demo adicionales creados por seeder:

```text
admin@example.com / password
editor@example.com / password
user@example.com / password
```
