# Mobile

App Android de noticias construida con React Native y Expo.

## Stack

- Expo
- React Native
- TypeScript
- React Navigation
- Axios
- Expo Secure Store
- Jest Expo
- React Native Testing Library

## Instalacion

```bash
npm install
cp .env.example .env
npm start
```

Si se cambia `.env`, reiniciar Expo para que lea de nuevo las variables `EXPO_PUBLIC_*`.

## Android

Para Android Emulator, `EXPO_PUBLIC_API_URL` debe usar `10.0.2.2` para apuntar al backend local:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api
```

Para dispositivo fisico, reemplazar `10.0.2.2` por la IP local de la computadora.

## Emulador Android

Estado configurado en esta maquina:

- Android Studio instalado en `C:\Program Files\Android\Android Studio`.
- Android SDK instalado en `C:\Users\ameji\AppData\Local\Android\Sdk`.
- Variables de usuario configuradas: `JAVA_HOME`, `ANDROID_HOME`, `ANDROID_SDK_ROOT`.
- Herramientas instaladas: Platform Tools, Android Emulator, Command-Line Tools, Android 36 y Google APIs x86_64.
- AVD creado: `NewsAgentic_API36`.

Si una terminal nueva no reconoce `adb`, `emulator`, `sdkmanager` o `avdmanager`, cerrar y abrir PowerShell para recargar el PATH.

Para abrir el emulador desde consola:

```powershell
emulator -avd NewsAgentic_API36
```

Para confirmar que Android ya arranco:

```powershell
adb devices
adb shell getprop sys.boot_completed
```

`sys.boot_completed` debe responder `1`.

## Levantar app con backend local

1. Levantar backend local:

```powershell
cd C:\Users\ameji\OneDrive\Desktop\PruebaApp\PruebaTecnicaApp\backend
php artisan serve --host=0.0.0.0 --port=8000
```

2. Levantar app:

```powershell
cd C:\Users\ameji\OneDrive\Desktop\PruebaApp\PruebaTecnicaApp\mobile
npm run android
```

Si el backend se corre con Docker, mantener igualmente el puerto `8000` expuesto en la maquina host para que el emulador pueda llegar con `http://10.0.2.2:8000/api`.

## Pruebas

```bash
npx tsc --noEmit
npm test
```
