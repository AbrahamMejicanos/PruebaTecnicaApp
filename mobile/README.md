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

## Android

Para Android Emulator, `EXPO_PUBLIC_API_URL` debe usar `10.0.2.2` para apuntar al backend local:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api
```

Para dispositivo fisico, reemplazar `10.0.2.2` por la IP local de la computadora.

## Pruebas

```bash
npm test
```
