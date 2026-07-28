param(
    [switch] $SkipDocker
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"

Set-Location $Backend

if (-not (Get-Command composer -ErrorAction SilentlyContinue)) {
    throw "Composer no esta disponible en PATH. Instala Composer y vuelve a ejecutar este script."
}

composer install

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
}

php artisan key:generate --force
php artisan jwt:secret --force

if (-not $SkipDocker) {
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        Set-Location $Root
        docker compose up -d postgres
        Set-Location $Backend
    } else {
        Write-Host "Docker no esta disponible. Se omite el levantamiento automatico de PostgreSQL."
        Write-Host "Asegurate de tener PostgreSQL activo con la configuracion de backend/.env."
    }
}

php artisan migrate:fresh --seed

Write-Host ""
Write-Host "Backend listo."
Write-Host "API local: http://localhost:8000/api"
Write-Host "Credenciales demo: demo@example.com / password"
Write-Host "Ejecuta: php artisan serve"
